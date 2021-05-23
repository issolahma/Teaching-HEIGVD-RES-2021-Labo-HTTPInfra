FROM php:7.2-apache

RUN apt update && apt install -y vim

COPY apache2-foreground /usr/local/bin
COPY templates/ /var/apache2/

# copy content to
COPY conf/ /etc/apache2/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*

# docker build -t res/apache_rp .

# docker run -e STATIC_APP=172.x.x.x -e DYNAMIC_APP=172.x.x.x 
