#!/bin/bash
DOMAIN="letsbeus.freeddns.org"
EMAIL="elmreda05@gmail.com"  # For renewal notifications

# Dynu API Key — create one at https://www.dynu.com/en-US/ControlPanel/APICredentials
# Either export DYNU_API_KEY before running, or set it below
DYNU_API_KEY="${DYNU_API_KEY:-}"

# Set to 1 for testing (uses staging - fake certificates)
# Set to 0 for production (real certificates)
STAGING=1

if [ -z "${DYNU_API_KEY}" ]; then
  echo "ERROR: DYNU_API_KEY environment variable is not set" >&2
  echo "Create one at: https://www.dynu.com/en-US/ControlPanel/APICredentials" >&2
  echo "Then run:  export DYNU_API_KEY=\"your-api-key\" ; ./init-letsencrypt.sh" >&2
  exit 1
fi

if [ "$STAGING" = "1" ]; then
  echo "### TESTING MODE: Using Let's Encrypt STAGING (fake certificate) ###"
  STAGING_FLAG="--staging"
else
  echo "### PRODUCTION MODE: Using Let's Encrypt PRODUCTION (real certificate) ###"
  STAGING_FLAG=""
fi

echo "### Initializing Let's Encrypt DNS-01 certificate for $DOMAIN (via Dynu API) ###"

mkdir -p certbot/conf
mkdir -p certbot/www

echo "### Downloading recommended TLS parameters ..."
mkdir -p certbot/conf
TMP_OPT=$(mktemp)
TMP_DHP=$(mktemp)
curl -fsSL -o "${TMP_OPT}" https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf
curl -fsSL -o "${TMP_DHP}" https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem
# Use docker to copy into the certbot/conf dir even if it's root-owned (bypasses host permissions)
docker run --rm \
  -v "$(pwd)/certbot/conf:/dst:rw" \
  -v "${TMP_OPT}:/tmp/options.conf:ro" \
  -v "${TMP_DHP}:/tmp/dhparams.pem:ro" \
  alpine sh -c "cp /tmp/options.conf /dst/options-ssl-nginx.conf && cp /tmp/dhparams.pem /dst/ssl-dhparams.pem && chmod 0644 /dst/options-ssl-nginx.conf /dst/ssl-dhparams.pem"
rm -f "${TMP_OPT}" "${TMP_DHP}"
echo

echo "### Installing certbot runtime deps (curl, python3) + issuing certificate via DNS-01 ..."
chmod +x "$(pwd)/certbot-dynu/authenticator.sh" "$(pwd)/certbot-dynu/cleanup.sh" || true
docker compose -f docker-compose.prod.yml run --rm \
  -e DYNU_API_KEY="${DYNU_API_KEY}" \
  -v "$(pwd)/certbot-dynu:/etc/letsencrypt/hooks" \
  certbot sh -c "
    apk add --no-cache curl python3 >/dev/null 2>&1
    certbot certonly \
      --manual \
      --preferred-challenges dns \
      --manual-auth-hook /etc/letsencrypt/hooks/authenticator.sh \
      --manual-cleanup-hook /etc/letsencrypt/hooks/cleanup.sh \
      ${STAGING_FLAG} \
      --email ${EMAIL} \
      --agree-tos \
      --no-eff-email \
      --force-renewal \
      --non-interactive \
      --cert-name ${DOMAIN} \
      -d ${DOMAIN}
  "
CERTBOT_EXIT=$?

if [ "${CERTBOT_EXIT}" -ne 0 ]; then
  echo "ERROR: certbot DNS-01 issuance failed (exit ${CERTBOT_EXIT})" >&2
  exit ${CERTBOT_EXIT}
fi
echo

echo "### DNS-01 certificate issued for ${DOMAIN}! ###"
echo "### (Caller is responsible for starting/recreating containers now) ###"
echo "### Setup complete. ###"
