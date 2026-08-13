#!/bin/bash
DOMAIN="letsbeus.duckdns.org"
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

echo "### Initializing Let's Encrypt certificate for $DOMAIN ###"

# Create directories if they don't exist
mkdir -p certbot/conf
mkdir -p certbot/www

# Download recommended TLS parameters
echo "### Downloading recommended TLS parameters ..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./certbot/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./certbot/conf/ssl-dhparams.pem"
echo

# Create dummy certificate for nginx to start
echo "### Creating dummy certificate for $DOMAIN ..."
path="/etc/letsencrypt/live/$DOMAIN"
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

# Start nginx with dummy certificate
echo "### Starting nginx ..."
docker-compose -f docker-compose.prod.yml up --force-recreate -d frontend
echo

# Delete dummy certificate
echo "### Deleting dummy certificate for $DOMAIN ..."
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo

# Request Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate for $DOMAIN ..."
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN" certbot
echo

# Reload nginx to load the real certificate
echo "### Reloading nginx ..."
docker-compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo "### Certificate setup complete! ###"
echo "Your site should now be accessible at https://$DOMAIN"
