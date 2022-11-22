// Import des packages et initalisation 
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const DBop = require('./database');
const https = require('https');
const fs = require('fs');


const DynamicFunction = require("./private/dynamicPage.js")

const app = express()

app.set('view engine', 'ejs');
app.set('views', 'private');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "fixmylouv",
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 3600000
    }
}));

//  FONCTION GET

app.get('/', async function (req, res, next) { // Page d'acceuil

    let name = "Connexion"
    // On modifie name uniquement si le user est connecter
    if (req.session.userID) name = await DBop.GetNameById(req.session.userID);

    const today = DynamicFunction.getDate();
    if (req.query.btn_search === "searching") { // Affichage des resultat de la barre de recherche
        let research = '%' + req.query.looking_for + '%';
        const researchedInfo = await DBop.GetAccInfoFromSearchBar(research);

        res.render('index.ejs', { user: name, date: today, accidentsInfoList: researchedInfo });
    } else { // Affichage des resultat 'normal'
        const accidentsInfoList = await DBop.GetAllAccidentInfo()
        const mode = DynamicFunction.getMode()
        res.render('index.ejs', { user: name, date: today, accidentsInfoList: accidentsInfoList, mode: mode });
    }
});

app.get('/login', function (req, res, next) { // Page de connexion
    if (req.session.userID) {
        let name = DBop.GetNameById(req.session.userID).then(name => {
            res.render('login.ejs', { user: name, message: "" });
        });

    } else {
        const mode = DynamicFunction.getMode()
        res.render('login.ejs', { user: "Connexion", message: "", mode: mode });
    }
});

app.get('/accident', function (req, res, next) { // Page d'accident
    if (req.session.userID) {
        const mode = DynamicFunction.getMode()
        let name = DBop.GetNameById(req.session.userID).then(name => {
            res.render('accident.ejs', { user: name, mode: mode });
        });

    } else {
        req.session.from = "accident"
        res.redirect("/login");
    };
});

//  FONCTION POST

app.post("/login", async function (req, res) {
    if (req.body.btn == "signup") {         // SIGNUP
        if (req.body.pseudo === null || req.body.email === null || req.body.name === null || req.body.password === null) {
            res.render('login.ejs', { user: "Connexion", message: "Please fill all fields" });
            return;
        }

        if (DBop.CheckEmail(req.body.email)) {
            res.render('login.ejs', { user: "Connexion", message: "Enter a valid email" });
            return;
        }

        let output = await DBop.AddUser(req.body.pseudo, req.body.email, req.body.name, req.body.password).then(userID => {
            req.session.userID = userID; // L'utilisateur est ajouter a la db et connecté directement
        });

    } else {                                // LOGIN
        if (req.body.email === null || req.body.password === null) {
            res.render('login.ejs', { user: "Connexion", message: "Please fill all fields" });
            return;
        }

        if (DBop.CheckEmail(req.body.email)) {
            res.render('login.ejs', { user: "Connexion", message: "Enter a valid email" });
            return;
        }

        let userID = await DBop.LoginUser(req.body.email, req.body.password)
        if (userID === -1) {
            res.render('login.ejs', { user: "Connexion", message: "Invalid email or password !" });
            return
        } else {
            req.session.userID = userID;
        }
    }
    // Redirection si necessaire
    let from = req.session.from
    if (from === undefined) from = "";
    res.redirect("/" + from);
});

app.post('/accident', function (req, res) { // Ajout d'un accident si utilisateur connecté
    if (req.session.userID) {
        if (req.body.number === null || req.body.street === null || req.body.district === null || req.body.description === null)
            return;

        let number = Math.abs(req.body.number);
        const today = DynamicFunction.getDate();
        let name = DBop.AddAccident(number, req.body.street, req.body.district, req.body.accident, today, req.session.userID).then(name => {
            res.redirect("/")
        });

        ;
    } else {
        res.redirect("/login")
    }
});


app.use(express.static('private'));

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'ingi'
}, app).listen(8080);