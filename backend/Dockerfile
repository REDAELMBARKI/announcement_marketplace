FROM ubuntu:24.04

LABEL maintainer="Your Name"

ARG WWWGROUP
ARG NODE_VERSION=20

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
ENV LANG=C.UTF-8

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get upgrade -y \
    && mkdir -p /etc/apt/keyrings \
    && apt-get install -y gnupg gosu curl ca-certificates zip unzip git sqlite3 libcap2-bin libpng-dev \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update \
    && apt-get install -y \
        php8.2-cli \
        php8.2-fpm \
        php8.2-gd \
        php8.2-curl \
        php8.2-mbstring \
        php8.2-xml \
        php8.2-zip \
        php8.2-bcmath \
        php8.2-intl \
        php8.2-readline \
        php8.2-sqlite3 \
        php8.2-mysql \
        php8.2-pgsql \
        nginx \
        supervisor \
    && curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN setcap "cap_net_bind_service=+ep" /usr/bin/php8.2

# Configure PHP-FPM to listen on unix socket
RUN mkdir -p /run/php && \
    sed -i 's|^listen = .*|listen = /run/php/php8.2-fpm.sock|' /etc/php/8.2/fpm/pool.d/www.conf && \
    sed -i 's|^;listen.owner = .*|listen.owner = www-data|' /etc/php/8.2/fpm/pool.d/www.conf && \
    sed -i 's|^;listen.group = .*|listen.group = www-data|' /etc/php/8.2/fpm/pool.d/www.conf && \
    sed -i 's|^;listen.mode = .*|listen.mode = 0660|' /etc/php/8.2/fpm/pool.d/www.conf

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

RUN userdel -r ubuntu || true
RUN groupadd --force -g ${WWWGROUP:-1000} sail
RUN useradd -ms /bin/bash --no-user-group -g ${WWWGROUP:-1000} -u 1337 sail
# Add sail user to www-data group so PHP-FPM socket is accessible
RUN usermod -aG www-data sail
RUN git config --global --add safe.directory /var/www/html

# Copy all Laravel project files into the container
COPY . /var/www/html

RUN composer update --no-interaction --prefer-dist --no-scripts --ignore-platform-reqs

RUN composer dump-autoload --optimize --no-scripts --ignore-platform-reqs

# Change ownership
RUN chown -R sail:sail /var/www/html

# Copy nginx config for backend
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]