# RES - Labo HTTPInfra

Par: Godi Matthieu et Issolah Maude



````
docker-compose up --detach
docker exec -it <nom_de_la_machine> /bin/bash
````



## Step 1 -  Serveur HTTP statique avec apache httpd

Arborescence du projet http.

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



# Step 2

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

