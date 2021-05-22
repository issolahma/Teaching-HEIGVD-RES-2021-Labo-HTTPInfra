FROM php:7.2-apache

RUN apt update && apt install -y vim

# copy content to
COPY conf/ /etc/apache2/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*

# docker build -t res/apache_rp .
