function generateAddresses() {
   var numberOfAdresses = chance.integer({
      min: 0,
      max: 10
   });
   console.log(numberOfAdresses);

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
}

var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req, res) {
   res.send( generateAddresses() );
});

app.listen(3000, function() {
   console.log('Accepting HTTP requests on port 3000');
});
