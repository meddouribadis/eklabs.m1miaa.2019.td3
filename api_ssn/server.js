// ---- EXPRESS JS - Framework
let express = require('express'),
    app = express();
var SSN = require("./models/SSN");
var async = require('async');
var axios = require('axios');
const fs = require('fs');

// ------------------------
// middleware
// ------------------------
// - body-parser needed to catch and to treat information inside req.body
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// --- Base de donnees
let mongoose = require('mongoose');

let database  = mongoose.connect("mongodb://db/demo",{
    promiseLibrary: require('bluebird'),
    useNewUrlParser: true
});

// ---- Creation du schema
//--- Module dependencies
const Schema	= mongoose.Schema;

//-- Resources Schema
let Person = new Schema({
    lastName     : String,
    firstName    : String,
    ssn : String
});

// ========================
// Schema methods
// ========================

Person.methods.toWebFormat = function() {
    return new Promise( (resolve, reject) => {
        let num_secu = new SSN(this.ssn)
        let dept = null;
        let nom = this.lastName;
        let prenom = this.firstName;
        let ssn = this.ssn;

        if(num_secu.extractBirthPlace().dept === "Etranger"){
            
            let pays = num_secu.extractBirthPlace().pays;
            let rawdata = fs.readFileSync("pays.json");
            let listePays = JSON.parse(rawdata);
            pays = listePays[num_secu  .extractBirthPlace().pays];

            let toWeb = {
                lastName : nom,
                firstName : prenom,
                ssn : ssn,
                departement : 'Etranger',
                pays : pays
            }
            resolve(toWeb);

        } else {

            axios.get('https://geo.api.gouv.fr/departements/'+num_secu .extractBirthPlace().dept).then((response) => {
                    dept = response.data.nom;
                    axios.get('https://geo.api.gouv.fr/communes/'+num_secu .extractBirthPlace().dept+num_secu.extractBirthPlace().commune)
                    .then(function (response) {
                        com = response.data.nom;
                        console.log(nom);
                        console.log(this.nom);
                        let toWeb = {
                            lastName : nom,
                            firstName : prenom,
                            ssn : ssn,
                            departement : dept,
                            commune : com
                        }
                        resolve(toWeb);
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                    });
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                });
        }
    })
}

mongoose.model('Person', Person);

// ------------------------
// LIST ROUTE
// ------------------------
app.get('/people', (req, res)=> {
    mongoose.model('Person').find({}).then((result)=>{
        res.status(200).json(result)
    },(err)=>{
        res.status(400).json(err)
    })
});

app.get('/extra', (req, res) => {
    mongoose.model('Person').find({}).then((people) => {
        let arrayPeople = [];

        async.each(people, (person, callback) => {
            person.toWebFormat().then(personUpdated => {
                arrayPeople.push(personUpdated)
                callback()
            }),(err) => {
                Utils.error("failed to WebFormat")
            }
        },() => {res.status(200).json(arrayPeople)})
    },(err) => {
        res.status(400).json(err)
    })
})

app.get('/extra/:ssn', (req, res) => {

    mongoose.model('Person').findOne({'ssn' : req.params.ssn}).then((result) => {
        let arrayPeople = [];

        result.toWebFormat().then(resultNew =>{ 
                console.log(resultNew)
                arrayPeople.push(resultNew)
                res.status(200).json(resultNew)
            }),(err) => {
                utils.error("Failed");
                res.status(400).json(err)
            }
        },(err) => {
            res.status(400).json(err) 
        })

})

app.post('/people', (req, res)=> {
    const myModel = mongoose.model('Person');
    let people = new  myModel();
    people.firstName = req.body.firstName;
    people.lastName = req.body.lastName;
    people.ssn = req.body.ssn;
    var secu_number = new SSN(people.ssn);
    if(secu_number.isValid()){
        people.save().then((result)=>{
            res.status(200).json({result : result, jayson : people})
        },(err)=>{
            res.status(400).json(err)
        })
    } else {
        return res.status(400).json({"message": "Numéro sécu invalide !"})
    }
});

app.get('/people/:id', (req, res)=> {
    mongoose.model('Person').findById(req.params.id).then((result)=>{
        res.status(200).json(result)
    },(err) => {
        res.status(400).json(err)
    })
});

app.delete('/people/:id', (req, res) => {
    mongoose.model('Person').deleteOne({_id : req.params.id}).then((result) => {
        res.status(200).json(result)
    },(err) => {
        res.status(400).json(err)
    })
});

app.put('/people/:id', (req, res) => {
    mongoose.model('Person').findById(req.params.id).then((result) => {
        result.firstName = req.body.firstName;
        result.lastName = req.body.lastName;
        result.ssn = req.body.ssn;
        var secu_number = new SSN(result.ssn);
        if(secu_number.isValid()){
            result.save().then((result)=>{
                res.status(200).json({result : result, jayson : result})
            },(err)=>{

                res.status(400).json(err)
            })
        } else {
            return res.status(400).json({"message": "SSN invalide !"})
        }
    },(err)=>{
        res.status(400).json(err)
    })
});

// ------------------------
// START SERVER
// ------------------------
app.listen(3011,function(){
    console.info('HTTP server started on port 3011');
});