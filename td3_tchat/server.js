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

app.get('/res/style.css',(req,res)=>{
    res.sendFile(path.join(__dirname+"/res/",'style.css'))
});

// ------------------------
//
// ------------------------

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    io.emit('system', "Entrez votre numéro de SSN : ");

	socket.emit('message', 'Vous êtes bien connecté !');
	socket.broadcast.emit('message', 'Un autre client vient de se connecter !');

    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
    });

    socket.on('message', function (message) {
        //let secu = new SSN(message)
        if(message !== ""){
            io.emit('cool', message);
            
            console.log("Un message a été reçu, nous allons le traiter :")
            postSSN(message).then(data => {
                console.log("SSN valide.")
                setTimeout(function(){io.emit('system', "Votre département : " + data.departement);}, 400);

                setTimeout(function(){io.emit('system', "Votre Commune : " + data.commune)}, 500);

                console.log(data);
            })
            .catch(err => {
                console.log("SSN invalide.")
                setTimeout(function(){io.emit('system', "Merci d'entrer un numéro de SSN valide ! ");}, 700);
                
            })
        }
    });

});

async function postSSN(number){

    return new Promise(function (resolve, reject) {

        axios({
            method: 'post',
            url: 'http://api_td2:3011/people',
            data: {
                firstName: 'Jean',
                lastName: 'Dujardin',
                ssn: ""+number
            }
        })
        .then(function (reponse) {
            console.log("Post successful" + reponse)
        })
        .catch(function (erreur) {
            reject(erreur);
        });

        axios({
            method: 'get',
            url: 'http://api_td2:3011/extra/'+number,
            data: {
            }
        })
        .then(function (reponse) {
            resolve(reponse.data);
        })
        .catch(function (erreur) {
            reject(erreur);
        });

    })

};

// ------------------------
// START SERVER
// ------------------------
http.listen(3010,function(){
    console.info('HTTP server started on port 3010');
});