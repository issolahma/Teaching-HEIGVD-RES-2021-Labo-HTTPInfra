FROM php:7.2-apache

COPY content/ /var/www/html/

# le copy ne donne pas de droits de lecture (r-x)
RUN chmod 744 -R /var/www/html

# build -t res/http_infra .

