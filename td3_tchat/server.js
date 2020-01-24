// --- INIT DEPENDENCIES
let express = require('express'),
    app = express(),
    path = require('path');

// --
let axios = require('axios');
let http = require('http').Server(app);
let async = require('async');
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

    let step = 1;
    let save = false;
    let msgTemp = "";

    io.emit('system', "Voulez vous sauvegardez vos informations ? ");

	socket.emit('message', 'Vous êtes bien connecté !');
	socket.broadcast.emit('message', 'Un autre client vient de se connecter !');

    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
    });

    socket.on('message', function (message) {
        io.emit('cool', message);
        msgTemp = message;

        if(step == 1 && (msgTemp == "oui" || msgTemp == "non")){
            step += 1;
            msgTemp = "";
            msgTemp == "oui" ? save = true : save = false;
            console.log("Var save = " + save);
            setTimeout(function(){io.emit('system', "Quel est votre nom ?");}, 400);
        }

        if(step == 2 && msgTemp !== ""){
            socket.pseudo = msgTemp;
            msgTemp = "";
            setTimeout(function(){io.emit('system', "Merci "+ socket.pseudo +" ! Quel est votre SSN ?");}, 400);
            step += 1;
        }

        if(msgTemp !== "" && step == 3){
            
            console.log("Un message a été reçu, nous allons le traiter :")
            postSSN(message, socket.pseudo, save).then(data => {
                console.log("SSN valide.");
                setTimeout(function(){io.emit('system', "Votre département : " + data.departement);}, 400);

                setTimeout(function(){io.emit('system', "Votre Commune : " + data.commune)}, 500);

                console.log(data);
                if(save == false){
                    deleteSSN(data.idPers);
                }
            })
            .catch(err => {
                console.log("SSN invalide.")
                console.log(err)
                setTimeout(function(){io.emit('system', "Merci d'entrer un numéro de SSN valide ! ");}, 700);
                
            })
        }
    });

});

async function postSSN(number, name, save){

    return new Promise(function (resolve, reject) {
        let idPersonne;

        axios({
            method: 'post',
            url: 'http://td2api_web:3011/people',
            data: {
                firstName: ""+name,
                lastName: 'Dujardin',
                ssn: ""+number
            }
        })
        .then(function (reponse) {
            idPersonne = reponse.data.result._id;
            console.log("Post successful " + JSON.stringify(reponse.data))
        })
        .catch(function (erreur) {
            reject(erreur);
        });

        axios({
            method: 'get',
            url: 'http://td2api_web:3011/extra/'+number,
            data: {
            }
        })
        .then(function (reponse) {
            reponse.data["idPers"] = idPersonne;
            console.log("ID = "+idPersonne);
            resolve(reponse.data);
        })
        .catch(function (erreur) {
            reject(erreur);
        });

    })

};

async function deleteSSN(id){

    return new Promise(function (resolve, reject) {

        axios({
            method: 'delete',
            url: 'http://td2api_web:3011/people/'+id,
            data: {
            }
        })
            .then(function (reponse) {
                console.log("Supression avec succès");
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