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
