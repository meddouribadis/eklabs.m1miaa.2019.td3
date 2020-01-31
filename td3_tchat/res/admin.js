let axios = require('axios');
let async = require('async');

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