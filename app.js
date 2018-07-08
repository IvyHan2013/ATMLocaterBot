
var restify = require('restify');
var builder = require('botbuilder');
var locationDialog = require('botbuilder-location');
var rp = require('request-promise');
var request = require('request');
var apikey = "AIzaSyBH9HsS72_5aTNjZ4h8rovRFsLQCxKBASA"
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_API_ID,
    appPassword: process.env.MICROSOFT_API_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// var inMemoryStorage = new builder.MemoryBotStorage();

// // This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
// var bot = new builder.UniversalBot(connector, [
//     function (session) {
//         session.send("Hi! I can help you find the ATM you want!");
//         session.beginDialog('Location');
//     },
//     function (session, results) {
//         session.dialogData.type = results.response;
//         session.send(session.dialogData.type);
//         session.endDialog();
//     }
//     // function (session, results) {
//     //     session.dialogData.partySize = results.response;
//     //     builder.Prompts.text(session, "Whose name will this reservation be under?");
//     // },
//     // function (session, results) {
//     //     session.dialogData.reservationName = results.response;

//     //     // Process request and display reservation details
//     //     session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
//     //     session.endDialog();
//     // }
// ]).set('storage', inMemoryStorage); // Register in-memory storage

// //Get user's input location 
// bot.dialog('Location',[
//     function(session){
//         builder.Prompts.text(session,"Please entry the place you want to find an ATM");
//     },
//     function (session,results){
//         // var url = "https://maps.googleapis.com/maps/api/place/textsearch/xml?query=restaurants+in+Sydney&key="+apikey;
//         // session.endDialogWithResult(getLocation(url));
//         var url = "https://www.google.com"
//         session.send(url);
//         session.send(getLocation(url));
//         session.endDialogWithResult(results);


//     }
// ]);

// function getLocation(url){
//     // request(url, {json:true,family:6},(err,res,body) =>{
//     //     if(err) {return console.log(err);}
//     //     return console.log(body.explanation);
//     // });
    
//     var requestData = {
//         uri : url,
//         "family": 4,
//         json : true
//     };
//     rp(requestData)
//         .then(function(body){
//             return typeof body;
//         });
// }

var bot = new builder.UniversalBot(connector)
bot.library(locationDialog.createLibrary('AkMQ9XeyyIrHEUv1XAhz7b2y-qmCE1n5SBHQIWohleylbQnuE1XFeLoBzC6ZrrvU'));
// bot.library(locationDialog.createLibrary(process.env.BING_MAPS_API_KEY, process.env.GOOGLE_MAPS_API_KEY));


bot.dialog("/", [
    function (session) {
        var options = {
            prompt: "Where you want to find an ATM?",
            useNativeControl: true,
            reverseGeocode: true,
			skipFavorites: false,
			skipConfirmationAsk: true,
            requiredFields:
                locationDialog.LocationRequiredFields.streetAddress |
                locationDialog.LocationRequiredFields.locality |
                locationDialog.LocationRequiredFields.region |
                locationDialog.LocationRequiredFields.postalCode |
                locationDialog.LocationRequiredFields.country
        };

        locationDialog.getLocation(session, options);
    },
    function (session, results) {
        if (results.response) {
            var place = results.response;
			var formattedAddress =  getFormattedAddressFromPlace(place, ", ");
            session.send("OK, I would find the ATM near " +formattedAddress);
        }
    }
]);

function getFormattedAddressFromPlace(place, separator) {
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country];
    return addressParts.filter(i => i).join(separator);
}