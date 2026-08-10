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

# Run migrations and seeders
echo "Running database migrations..."
php artisan migrate --force

echo "Seeding database with initial data..."
php artisan db:seed --force

# Clear cached config, routes, and application cache
echo "Clearing application cache..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Link storage
echo "Linking storage..."
php artisan storage:link

# Change permissions
chown -R sail:sail /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Start server
echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=80
