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

COPY templates/ /var/apache2/

# copy content to
COPY conf/ /etc/apache2/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
````

- Configuration du reverse proxy

````
<VirtualHost *:80>
	ServerName demo.res.ch

	#ErrorLog ${APACHE_LOG_DIR}/error.log
	#CustomLog ${APACHE_LOG_DIR}/access.log combined

        ProxyPass "/api/students/" "http://172.17.0.3:3000/"
        ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"

        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
````



## Step 4 - Requêtes AJAX avec JQuery

- Fichier addresses.js

````javascript
$(function() {
   console.log("Loading addresses");

   function loadAddresses() {
      $.getJSON("/api/students/", function(addresses) {
         console.log(addresses);
         var message = "No addresses";
         if (addresses.length > 0 ) {
            message = addresses[0].street + " street in " + addresses[0].city;
         }
         $(".skills").text(message);
      });
   };
loadAddresses();
setInterval(loadAddresses, 2000);
});
````

- Modification du template Bootstrap

  Pour pouvoir recopier le code exemple du cours, nous avons ajouté une clases `skills` au paragraphe qui affiche les addresses.

  Nous avons aussi du ajouter un lien vers les libs JQuery pour que notre script puisse fonctionner.

  Notre choix s'est porté sur un téléchargement des librairies pour limiter le poids de notre container.

````html
<div class="text-center">
   <h1 class="mx-auto my-0 text-uppercase">RES</h1>
   <h2 class="text-white-50 mx-auto mt-2 mb-5">HTTP infra lab</h2>
    <!-- Ajout classe skills -->
   <p class="skills text-white-50 mx-auto mt-2 mb-5">Addresses</p>
   <a class="btn btn-primary" href="#about">Get Started</a>
</div>

(...)

<!-- Custom script to load addresses-->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="js/addresses.js"></script>
````



## Step 5 - Reverse proxy dynamique

A ce stade nous avons décider de créer un fichier docker-compose pour faciliter la création des containers.

Pour suivre l'exemple du cours et utiliser des variables d'environnement, nous avons assigné une ip fixe a chaques container.

- Fichier docker-compose.yml

````
version: '3.9'

services:
    http:
        privileged: true
        container_name : res_http
        hostname: res.http
        build: docker-images/apache-php-image/
        networks:
            default:
                ipv4_address: 172.18.0.3

    express:
        privileged: true
        container_name : res_express
        hostname : res.express
        build: express-image/
        networks:
            default:
                ipv4_address: 172.18.0.5

    reverse-proxy:
        privileged: true
        container_name : res_proxy
        hostname : res.proxy
        build: apache-reverse-proxy/
        networks:
            default:
                ipv4_address: 172.18.0.2   
        environment: 
            - STATIC_APP=172.18.0.3:80
            - DYNAMIC_APP=172.18.0.5:3000 
````



- Modification du fichier `Dockerfile` 

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



Une autre option que nous avions utilisé était l'utilisation du dns de Docker pour la résolution des nom.

Cette solution ne nécessite rien d'autre que le remplacement des adresses IP par les noms d'hôtes des containers cibles.

````
<VirtualHost *:80>
	ServerName demo.res.ch

        ProxyPass "/api/students/" "http://res.express:3000/"
        ProxyPassReverse "/api/students/" "http://res.express:3000/"

        ProxyPass "/" "http://res.http:80/"
        ProxyPassReverse "/" "http://res.http:80/"
</VirtualHost>
````



## Bonus - Load balancing et sticky session

- Arborescence du dossier

````
apache-reverse-proxy/
├── apache2-foreground
├── conf
│   ├── conf-enabled  
│   │   ├── loadbalancer_dynamic.conf
│   │   ├── loadbalancer-manager.conf
│   │   └── loadbalancer_static.conf
│   └── sites-available
│       ├── 000-default.conf
│       └── 001-reverse-proxy.conf
├── Dockerfile
└── templates
    └── config-template.php
````

Les fichiers de configurations pour le load balancing sont dans le dossiers conf-enabled.



Nous avons choisis de repartir sur l'idée d'utiliser le dns de Docker plutôt qu'un script php.

- Fichier `loadbalancer_static.conf` 

````
security/privileged-identity-manager/12-8-01/implementing/how-to-configure-the-apache-load-balancer.html

Header add Set-Cookie "ROUTEID1=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
<Proxy "balancer://staticCluster">
    BalancerMember "http://res.http1:80" route=1
    BalancerMember "http://res.http2:80" route=2
    ProxySet stickysession=ROUTEID1
</Proxy>
ProxyPass        "/" "balancer://staticCluster/"
ProxyPassReverse "/" "balancer://staticCluster/"

ProxyPass "/lb-manager" "!"
````



- Fichier `loadbalancer_dynamique.conf`

````
security/privileged-identity-manager/12-8-01/implementing/how-to-configure-the-apache-load-balancer.html

Header add Set-Cookie "ROUTEID2=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
<Proxy "balancer://dynamicCluster">
    BalancerMember "http://res.express1:3000" route=3
    BalancerMember "http://res.express2:3000" route=4
    ProxySet stickysession=ROUTEID2
</Proxy>
ProxyPass        "/api/students/" "balancer://dynamicCluster/"
ProxyPassReverse "/api/students/" "balancer://dynamicCluster/"

ProxyPass "/lb-manager" "!"
````



- Modification du fichier `001-reverse-proxy.conf`

````
<VirtualHost *:80>
	ServerName demo.res.ch
</VirtualHost>
````

- Modification du fichier `Dockerfile`

````
FROM php:7.2-apache

RUN apt update && apt install -y vim

COPY apache2-foreground /usr/local/bin
COPY templates/ /var/apache2/

# copy content to
COPY conf/ /etc/apache2/

RUN a2enmod proxy proxy_http proxy_balancer lbmethod_bytraffic lbmethod_byrequests headers
RUN a2ensite 000-* 001-*
````



### Load balancer manager

Ce manager nous permet d'avoir des statistiques sur l'utilisation des différents containers.

Il est possible de le configurer pour limiter son accès avec un login (voir le deuxième lien de la webographie de cette partie). Nous ne l'avons pas implémenté dans le carde de ce projet pour nous faciliter la vie.

- Fichier `loadbalancer-manager.conf`

````
<location "/lb-manager">
        SetHandler balancer-manager
        allow from all
</location>
````


![](figures/lb-manager.png)



- Webographie

  https://httpd.apache.org/docs/2.4/fr/mod/mod_proxy_balancer.html

  https://www.inmotionhosting.com/support/server/apache/apache-load-balancer/

  

## Bonus - Management UI

Portainer.io permet de gerer facilement son environnement Docker.

https://www.portainer.io/

![](figures/portainer.png)
