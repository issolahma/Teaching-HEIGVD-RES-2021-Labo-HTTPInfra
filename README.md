# RES - Labo HTTPInfra

Par: Godi Matthieu et Issolah Maude

juin 2021



````
docker-compose up --detach
docker exec -it <nom_de_la_machine> /bin/bash
````



## Step 1 -  Serveur HTTP statique avec apache httpd

- Arborescence du projet http.

````bash
docker-images/
└── apache-php-image
    ├── content # Contenu du site web
    │   ├── assets
    │   ├── css
    │   ├── index.html
    │   └── js
    └── Dockerfile

````

- Dockerfile

````
FROM php:7.2-apache

RUN apt update && apt install -y vim

COPY content/ /var/www/html/

# le copy ne donne pas de droits de lecture (r-x)
RUN chmod 755 -R /var/www/html
````

- Accès au container depuis le navigateur

![](figures/bootstrap-template.png)

https://startbootstrap.com/theme/grayscale



## Step 2 - Serveur dynamique HTTP avec express.js

Nous avons choisis de retourner des addresses.

````javascript
# Extrait du fichier index.js
var addresses = [];
for (var i=0; i < numberOfAdresses; i++) {
   addresses.push({
      street: chance.street(),
      zip: chance.zip(),
      city: chance.city(),
      country: chance.country()
   });
};
console.log(addresses);
return addresses;
````



- Arborescence du projet express.js

````
express-image/
├── Dockerfile
└── src
    ├── index.js
    ├── node_modules
    │   └── chance
    ├── package.json
    └── package-lock.json

````

- Dockerfile

````
FROM node:14.17

RUN apt update && apt install -y vim

COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
````

- Accès au container depuis le navigateur
  ![](figures/express-js.png)



## Step 3 - Reverse proxy avec apache (conf. statique)

- Arborescence des fichiers de configuration du reverse proxy.

````
apache-reverse-proxy/
├── apache2-foreground
├── conf
│   └── sites-available
│       ├── 000-default.conf
│       └── 001-reverse-proxy.conf
└── Dockerfile
````

- Dockerfile

````
FROM php:7.2-apache

RUN apt update && apt install -y vim

COPY apache2-foreground /usr/local/bin
COPY templates/ /var/apache2/

# copy content to
COPY conf/ /etc/apache2/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
````

- e

````
<VirtualHost *:80>
	ServerName demo.res.ch

	#ErrorLog ${APACHE_LOG_DIR}/error.log
	#CustomLog ${APACHE_LOG_DIR}/access.log combined

        #ProxyPass "/api/students/" "http://172.17.0.3:3000/"
        #ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"

        #ProxyPass "/" "http://172.17.0.2:80/"
        #ProxyPassReverse "/" "http://172.17.0.2:80/"

        #ProxyPass "/api/students/" "http://res.express:3000/"
        #ProxyPassReverse "/api/students/" "http://res.express:3000/"

        #ProxyPass "/" "http://res.http:80/"
        #ProxyPassReverse "/" "http://res.http:80/"
</VirtualHost>
````

