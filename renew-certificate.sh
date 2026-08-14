#!/bin/bash

DYNU_API_KEY="${DYNU_API_KEY:-}"
if [ -z "${DYNU_API_KEY}" ]; then
  echo "ERROR: DYNU_API_KEY environment variable is not set" >&2
  echo "Run:  export DYNU_API_KEY=\"your-api-key\" ; ./renew-certificate.sh" >&2
  exit 1
fi

echo "### Renewing SSL Certificate via DNS-01 (Dynu API) ###"

chmod +x "$(pwd)/certbot-dynu/authenticator.sh" "$(pwd)/certbot-dynu/cleanup.sh" || true
docker compose -f docker-compose.prod.yml run --rm \
  -e DYNU_API_KEY="${DYNU_API_KEY}" \
  -v "$(pwd)/certbot-dynu:/etc/letsencrypt/hooks" \
  certbot sh -c "
    apk add --no-cache curl python3 >/dev/null 2>&1
    certbot renew \
      --manual-auth-hook /etc/letsencrypt/hooks/authenticator.sh \
      --manual-cleanup-hook /etc/letsencrypt/hooks/cleanup.sh \
      --non-interactive
  "

echo "### Reloading nginx ..."
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo "### Certificate renewal complete! ###"
