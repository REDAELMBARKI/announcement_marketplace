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
echo "### Requesting Let's Encrypt certificate for $DOMAIN via DNS-01 (Dynu) ..."
COMPOSE_BAKE=1 docker compose -f docker-compose.prod.yml run --rm certbot \
  certbot certonly \
    --manual \
    --preferred-challenges dns-01 \
    --manual-auth-hook /etc/letsencrypt/dynu/authenticator.sh \
    --manual-cleanup-hook /etc/letsencrypt/dynu/cleanup.sh \
    $STAGING_FLAG \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --force-renewal \
    -d "$DOMAIN"
echo

echo "### Certificate setup complete! ###"
echo "Your certificate files live in the host bind-mount: certbot/conf/live/$DOMAIN/"
echo "Start the frontend/nginx stack separately to serve https://$DOMAIN"
