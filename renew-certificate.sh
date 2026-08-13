#!/bin/bash

echo "### Renewing SSL Certificate ###"

# Renew certificate
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Reload nginx to apply new certificate
echo "### Reloading nginx ..."
docker-compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo "### Certificate renewal complete! ###"
