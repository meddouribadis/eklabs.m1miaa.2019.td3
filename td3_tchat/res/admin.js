let axios = require('axios');
let async = require('async');

// Getting some data
let mountains = [
    { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
    { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
    { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
    { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
    { name: "Monte Amiata", height: 1738, place: "Siena" }
];

function generateTableHead(table) {
    let thead = table.createTHead();
    let row = thead.insertRow();

    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

let table = document.querySelector("table");
generateTableHead(table);

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