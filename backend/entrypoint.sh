#!/bin/bash

# Wait for the database to be ready
echo "Starting backend..."

# Install dependencies
if [ ! -d "vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Handle database preparation for MySQL
echo "Waiting for MySQL database connection ($DB_HOST:$DB_PORT)..."
until php -r "try { new PDO('mysql:host=' . (getenv('DB_HOST') ?: 'db') . ';port=' . (getenv('DB_PORT') ?: 3306) . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }"; do
    sleep 2
    echo "MySQL is unavailable - waiting..."
done
echo "MySQL connection established successfully!"

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Only seed on first boot (use a marker file to prevent duplicate seeding)
SEED_MARKER="/var/www/html/storage/.seeded"
if [ ! -f "$SEED_MARKER" ]; then
    echo "First boot detected — seeding database..."
    php artisan db:seed --force
    touch "$SEED_MARKER"
    echo "Seeding complete."
else
    echo "Database already seeded (marker file exists), skipping seed."
fi

# Migrate local storage to S3 (one-time, on first boot with S3 enabled)
S3_MARKER="/var/www/html/storage/.s3_migrated"
if [ "$FILESYSTEM_DISK" = "s3" ] && [ ! -f "$S3_MARKER" ]; then
    echo "First boot with S3 — migrating local files to S3..."
    php artisan storage:migrate-to-s3 || true
    touch "$S3_MARKER"
    echo "S3 migration complete."
else
    echo "S3 migration already done or not using S3, skipping."
fi

# Clear cached config, routes, and application cache
echo "Clearing application cache..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Cache config and routes for production performance
echo "Caching config and routes for production..."
php artisan config:cache
php artisan route:cache

# Link storage
echo "Linking storage..."
php artisan storage:link 2>/dev/null || true

# Change permissions
chown -R sail:sail /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure PHP-FPM socket directory exists
mkdir -p /run/php

# Start Supervisor (manages php-fpm + nginx)
echo "Starting Supervisor (php-fpm + nginx)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
