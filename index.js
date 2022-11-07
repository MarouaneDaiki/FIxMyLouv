const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const DBop = require('./database');

const app = express()
const date = new Date();

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

app.get('/', function(req, res, next){
    DBop.GetAllAccidentInfo();

    if(req.session.userID){
        let name = DBop.GetNameById(req.session.userID).then(name =>{
            res.render('index.ejs', {user: name});
        });  
        
    }else{
        res.render('index.ejs', {user: "Connexion"});
    }
});

app.get('/login', function(req, res, next){
    if(req.session.userID){
        let name = DBop.GetNameById(req.session.userID).then(name =>{
            res.render('login.ejs', {user: name, message: ""});
        });  
        
    }else{
        res.render('login.ejs', {user: "Connexion", message: ""});
    }
});

app.get('/accident', function(req, res, next){
    if(req.session.userID){
        let name = DBop.GetNameById(req.session.userID).then(name =>{
            res.render('accident.ejs', {user: name});
        });  
        
    }else{
        res.render('accident.ejs', {user: "Connexion"});
    }
});

//POST

app.post("/login", function(req, res) {
    if(req.body.btn == "signup"){//SIGNUP
        if(req.body.pseudo === null || req.body.email === null || req.body.name === null || req.body.password === null){
            res.render('login.ejs', {user: "Connexion", message: "Please fill all fields"});
            return;
        } 

        if(DBop.CheckEmail(req.body.email)){
            res.render('login.ejs', {user: "Connexion", message: "Enter a valid email"});
            return;
        }

        let output = DBop.AddUser(req.body.pseudo, req.body.email, req.body.name, req.body.password).then(data => {
            res.render('login.ejs', {user: "Connexion", message : data});
        });

    }else{//LOGIN
        if(req.body.email === null || req.body.password === null){
            res.render('login.ejs', {user: "Connexion", message: "Please fill all fields"});
            return;
        } 

        if(DBop.CheckEmail(req.body.email)){
            res.render('login.ejs', {user: "Connexion", message: "Enter a valid email"});
            return;
        }

        let output = DBop.LoginUser(req.body.email, req.body.password).then(result =>{
            if(result === "Invalid email or password !"){
                res.render('login.ejs', {user: "Connexion", message: result});
            }else{
                req.session.userID = result;
                let name = DBop.GetNameById(req.session.userID).then(name =>{
                    res.render('index.ejs', {user: name});
                });
            }
        });
    }
});

app.post('/accident', function(req, res){
    if(req.session.userID){
        if(req.body.number === null || req.body.street === null || req.body.district === null || req.body.description === null) 
            return;

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let today = `${day}/${month}/${year}`;

        console.log(today);

        let name = DBop.GetNameById(req.session.userID).then(name =>{
            res.render('index.ejs', {user: name});
        });

        DBop.AddAccident(req.body.number, req.body.street, req.body.district, req.body.accident, today , req.session.userID);
    }else{
        res.render('login.ejs', {user: "Connexion", message: "Login before submitting accidents"});
    }
});


app.use(express.static('private'));
app.listen(8080);