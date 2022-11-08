const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const DBop = require('./database');

const Date = require("./private/date.js")

const app = express()

const today = Date.date();

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

app.get('/', async function (req, res, next) {
    let name = "Connexion"
    // On modifie name uniquement si le user est co
    if (req.session.userID) name = await DBop.GetNameById(req.session.userID);
    const accidentsInfoList = await DBop.GetAllAccidentInfo()

    res.render('index.ejs', { user: name, date: today, accidentsInfoList: accidentsInfoList });
});

app.get('/login', function (req, res, next) {
    if (req.session.userID) {
        let name = DBop.GetNameById(req.session.userID).then(name => {
            res.render('login.ejs', { user: name, message: "" });
        });

    } else {
        res.render('login.ejs', { user: "Connexion", message: "" });
    }
});

app.get('/accident', function (req, res, next) {
    if (req.session.userID) {
        let name = DBop.GetNameById(req.session.userID).then(name => {
            res.render('accident.ejs', { user: name });
        });

    } else {
        req.session.from = "accident"
        res.redirect("/login");
    };
});

//POST

app.post("/login", async function (req, res) {
    // console.log(req.session.from)
    if (req.body.btn == "signup") {//SIGNUP
        if (req.body.pseudo === null || req.body.email === null || req.body.name === null || req.body.password === null) {
            res.render('login.ejs', { user: "Connexion", message: "Please fill all fields" });
            return;
        }

        if (DBop.CheckEmail(req.body.email)) {
            res.render('login.ejs', { user: "Connexion", message: "Enter a valid email" });
            return;
        }

        let output = await DBop.AddUser(req.body.pseudo, req.body.email, req.body.name, req.body.password).then(userID => {
            // le user est valide et ajouter a la DB, on le connect directement
            req.session.userID = userID;
        });

    } else {//LOGIN
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
    let from = req.session.from
    if (from === undefined) from = "";
    console.log("---->", from);
    res.redirect("/" + from);
});

app.post('/accident', function (req, res) {
    if (req.session.userID) {
        if (req.body.number === null || req.body.street === null || req.body.district === null || req.body.description === null)
            return;

        let name = DBop.AddAccident(req.body.number, req.body.street, req.body.district, req.body.accident, today, req.session.userID).then(name => {
            res.redirect("/")
        });

        ;
    } else {
        res.redirect("/login")
    }
});


app.use(express.static('private'));
app.listen(8080);