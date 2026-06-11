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

# Make sure the database file exists
if [ ! -f "database/marketDB.sqlite" ]; then
    echo "Creating database file..."
    touch database/marketDB.sqlite
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Link storage
echo "Linking storage..."
php artisan storage:link

# Change permissions
chown -R sail:sail /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Start server
echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=80
