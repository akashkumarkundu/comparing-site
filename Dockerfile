FROM php:8.4-cli-alpine

# Install system packages & build tools
RUN apk add --no-cache \
    curl \
    git \
    libzip-dev \
    zip \
    unzip \
    sqlite \
    sqlite-dev \
    oniguruma-dev \
    icu-dev \
    && docker-php-ext-install pdo pdo_sqlite mbstring bcmath intl opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application files
COPY . .

# Ensure storage & bootstrap/cache directories have correct permissions
RUN mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/framework/cache \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/database \
    && touch /var/www/database/database.sqlite \
    && chmod -R 777 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Install PHP dependencies for production
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Expose Render default port
ENV PORT=10000
EXPOSE 10000

# Start Laravel
CMD sh -c "php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=\${PORT:-10000}"
