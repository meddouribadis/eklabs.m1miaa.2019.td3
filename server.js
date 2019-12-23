// --- INIT DEPENDENCIES
let express = require('express'),
    app = express(),
    path = require('path');

// --
let axios = require('axios');
let http = require('http').Server(app);
let async = require('async')
let io = require('socket.io')(http);


//app.use('/js/',express.static(config.root + '/public'));
// ------------------------
// ROUTE
// ------------------------
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'))
});

// ------------------------
//
// ------------------------

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    io.emit('cool', "Entrez votre numéro de SSN : ");

	socket.emit('message', 'Vous êtes bien connecté !');
	socket.broadcast.emit('message', 'Un autre client vient de se connecter !');

    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
    });

    socket.on('message', function (message) {
        //let secu = new SSN(message)
        io.emit('cool', message);

        if(true == true){
            console.log("Yeaaaah")
            postSSN(message);

        }
        else {
            io.emit('cool', "Merci d'entrer un numéro de SSN valide ! ");
        }

    });

});

async function postSSN(number){
  
    axios({
        method: 'post',
        url: 'http://localhost:3011/people',
        data: {
            firstName: 'Jean',
            lastName: 'Dujardin',
            ssn: ""+number
        }
    })
    .then(function (reponse) {
        //On traite la suite une fois la réponse obtenue 
        console.log(reponse.data);
    })
    .catch(function (erreur) {
        //On traite ici les erreurs éventuellement survenues
        //console.log(erreur);
    });

};

// ------------------------
// START SERVER
// ------------------------
http.listen(3010,function(){
    console.info('HTTP server started on port 3010');
});