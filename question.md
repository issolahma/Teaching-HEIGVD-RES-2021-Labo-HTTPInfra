## Step 1: Static HTTP server with apache httpd

### Acceptance criteria

* You have a GitHub repo with everything needed to build the Docker image.

  ok

* You can do a demo, where you build the image, run a container and access content from a browser.

  ok

* You have used a nice looking web template, different from the one shown in the webcast.

  ok

* You are able to explain what you do in the Dockerfile.

  ok

* You are able to show where the apache config files are located (in a running container).

  ```bash
  root@bfd6bd8816ed:/var/www/html# ls /etc/apache2/
  apache2.conf  conf-available  conf-enabled  envvars  magic  mods-available  mods-enabled  ports.conf  sites-available  sites-enabled
  
  ```

  

  `/etc/httpd/`

* You have **documented** your configuration in your report.

  <mark>TODO</mark>

  

## Step 2: Dynamic HTTP server with express.js

### Acceptance criteria

* You have a GitHub repo with everything needed to build the Docker image.
* You can do a demo, where you build the image, run a container and access content from a browser.
* You generate dynamic, random content and return a JSON payload to the client.
* You cannot return the same content as the webcast (you cannot return a list of people).
* You don't have to use express.js; if you want, you can use another JavaScript web framework or event another language.
* You have **documented** your configuration in your report.



## Step 3

a2enmod enable module

a2ensite enable site

<mark>ip dynamique</mark>

````
root@bfd6bd8816ed:/etc/apache2/sites-available# cat 001-reverse-proxy.conf 
<VirtualHost *:80>
	ServerName demo.res.ch

	#ServerAdmin webmaster@localhost
	#DocumentRoot /var/www/html

	# Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
	# error, crit, alert, emerg.
	# It is also possible to configure the loglevel for particular
	# modules, e.g.
	#LogLevel info ssl:warn

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

        ProxyPass "/api/students/" "http://172.17.0.3:3000/"
        ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"

        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"
	
        # For most configuration files from conf-available/, which are
	# enabled or disabled at a global level, it is possible to
	# include a line for only one particular virtual host. For example the
	# following line enables the CGI configuration for this host only
	# after it has been globally disabled with "a2disconf".
	#Include conf-available/serve-cgi-bin.conf
</VirtualHost>

````

activer site: `/etc/apache2# a2ensite 001*`

activer modules necésaires: `a2enmod proxy_http (et proxy)`