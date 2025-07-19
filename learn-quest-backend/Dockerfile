# Use an official PHP runtime as a parent image
FROM php:8.4-cli

# Install system dependencies and PHP extensions required by Symfony
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    zip \
    libicu-dev \
    libzip-dev \
    libonig-dev \
    npm \
    nodejs \
    && docker-php-ext-install intl pdo pdo_mysql zip

# Install Composer from the official Composer image
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set the working directory
WORKDIR /app

# Copy only composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install PHP dependencies (you can remove --no-scripts if you need to run them)
RUN composer install --no-scripts --no-autoloader

# Copy the rest of the project files
COPY . .

# (Optional) Generate the autoloader if needed
RUN composer dump-autoload

# Expose port 8000 for the PHP built-in server
EXPOSE 8000

RUN npm install

# Start the Symfony application using PHP's built-in server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
