#!/bin/bash
set -euo pipefail

DOMAIN="letsbeus.freeddns.org"
EMAIL="elmreda05@gmail.com"  # For renewal notifications

# Set to 1 for testing (uses staging - fake certificates)
# Set to 0 for production (real certificates)
STAGING=1

if [ "$STAGING" = "1" ]; then
  echo "### TESTING MODE: Using Let's Encrypt STAGING (fake certificate) ###"
  STAGING_FLAG="--staging"
else
  echo "### PRODUCTION MODE: Using Let's Encrypt PRODUCTION (real certificate) ###"
  STAGING_FLAG=""
fi

echo "### Initializing Let's Encrypt certificate for $DOMAIN (DNS-01 via Dynu) ###"

# Create directories if they don't exist
mkdir -p certbot/conf
mkdir -p certbot/www

# Write recommended TLS parameters locally (avoid remote fetch failures)
echo "### Writing recommended TLS parameters ..."
cat > "./certbot/conf/options-ssl-nginx.conf" <<'EOF'
# This file contains important security parameters. If you modify this file
# manually, Certbot will be unable to automatically provide future security
# updates. Instead, Certbot will print and log an error message with a path to
# the up-to-date file that you will need to refer to when manually updating
# this file.

ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
EOF

# Generate DH params if missing (2048-bit, sufficient for most setups)
if [ ! -f "./certbot/conf/ssl-dhparams.pem" ]; then
  echo "### Generating DH params (this may take a moment)..."
  openssl dhparam -out "./certbot/conf/ssl-dhparams.pem" 2048 2>/dev/null || \
  curl -sSL https://ssl-config.mozilla.org/ffdhe2048.txt > "./certbot/conf/ssl-dhparams.pem"
fi
echo

# Ensure Dynu API key is available
if [ -z "${DYNU_API_KEY:-}" ]; then
  echo "ERROR: DYNU_API_KEY env var is not set. DNS-01 challenge cannot proceed."
  exit 1
fi

# DNS-01: Request Let's Encrypt certificate via Dynu hooks (no nginx/webroot needed)
#
# NOTE: The certbot service in docker-compose.prod.yml sets a custom `entrypoint:`
# that is the 12-hour auto-renew loop. `docker compose run` only overrides `command`,
# NOT `entrypoint`, so without an explicit --entrypoint below the container would
# run its sleep-forever loop and never execute certonly -> appears frozen -> timeout.
#
# NOTE on Alpine + bash: certbot/certbot image is Alpine, which ships only with
# busybox /bin/sh. The Dynu hooks use `#!/bin/bash` and bashisms ([[ glob ]]), so
# bash MUST be installed via apk, otherwise execve fails with ENOENT on the
# interpreter and the shell reports a confusing "/path/hook.sh: not found" (err 127)
# even though the hook file itself exists and is +x. curl + python3 also required
# by the Dynu hooks.
echo "### Requesting Let's Encrypt certificate for $DOMAIN via DNS-01 (Dynu) ..."
DYNU_API_KEY="$DYNU_API_KEY" docker compose -f docker-compose.prod.yml run --rm --entrypoint "" certbot \
  /bin/sh -c '
    set -eu
    echo "[container] Installing bash curl python3 (Dynu hook deps, Alpine missing bash by default)..."
    apk add --no-cache bash curl python3 >/dev/null
    echo "[container] Installed bash: $(bash --version | head -1)"
    echo "[container] Mounted hook dir listing..."
    ls -la /etc/letsencrypt/hooks/ || { echo "[container] ERROR: /etc/letsencrypt/hooks/ directory missing! Bind mount not applied."; ls -la /etc/letsencrypt/; exit 9; }
    AUTH=/etc/letsencrypt/hooks/authenticator.sh
    CLEAN=/etc/letsencrypt/hooks/cleanup.sh
    for f in "$AUTH" "$CLEAN"; do
      echo "[container] Inspect $f -> size=$(wc -c < $f), perms=$(ls -l $f | awk "{print \$1,\$3,\$4}"), shebang=$(head -1 $f)"
      test -x "$f" || { echo "[container] Making $f executable"; chmod +x "$f"; }
    done
    echo "[container] About to invoke: certbot certonly with hooks at $AUTH / $CLEAN"
    certbot certonly \
      --manual \
      --preferred-challenges dns-01 \
      --manual-auth-hook "$AUTH" \
      --manual-cleanup-hook "$CLEAN" \
      '"$STAGING_FLAG"' \
      --email "'"$EMAIL"'" \
      --agree-tos \
      --no-eff-email \
      --non-interactive \
      --force-renewal \
      -v \
      -d "'"$DOMAIN"'"
  '
echo

echo "### Certificate setup complete! ###"
echo "Your certificate files live in the host bind-mount: certbot/conf/live/$DOMAIN/"
echo "Start the frontend/nginx stack separately to serve https://$DOMAIN"
