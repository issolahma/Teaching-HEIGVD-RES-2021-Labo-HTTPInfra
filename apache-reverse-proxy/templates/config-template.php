<?php
   $ip_static = getenv('STATIC_APP');
   $ip_dyn = getenv('DYNAMIC_APP');
?>

<VirtualHost *:80>
	ServerName demo.res.ch

        ProxyPass "/api/students/" "http://<?php print "$ip_dyn" ?>/"
        ProxyPassReverse "/api/students/" "http://<?php print "$ip_dyn" ?>/"

        ProxyPass "/" "http://<?php print "$ip_static" ?>/"
        ProxyPassReverse "/" "<?php print "$ip_static" ?>/"

        #ProxyPass "/api/students/" "http://res.express:3000/"
        #ProxyPassReverse "/api/students/" "http://res.express:3000/"

        #ProxyPass "/" "http://res.http:80/"
        #ProxyPassReverse "/" "http://res.http:80/"
</VirtualHost>
