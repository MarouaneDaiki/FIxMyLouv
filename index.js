const express = require('express');
const BDop = require('./database');

const app = express()
const date = new Date();

app.set('view engine', 'ejs');
app.set('views', 'private');

app.use(express.urlencoded());

app.get('/', function(req, res, next){
    res.render('index.ejs')
});

app.get('/index', function(req, res, next){
    res.render('index.ejs')
});

app.get('/login', function(req, res, next){
    res.render('login.ejs', {message : ""});
});

app.get('/accident', function(req, res, next){
    res.render('accident.ejs')
});

//POST

app.post("/login", function(req, res) {
    if(req.body.btn == "signup"){
        if(req.body.pseudo === null || req.body.email === null || req.body.name === null || req.body.password === null){
            res.render('login.ejs', {message: "Please fill all fields"});
            return;
        } 

        let output = BDop.AddUser(req.body.pseudo, req.body.email, req.body.name, req.body.password).then(data => {
            res.render('login.ejs', {message : data});
        });

    }else{
        if(req.body.email === null || req.body.password === null){
            res.render('login.ejs', {message: "Please fill all fields"});
            return;
        } 

        //login
        let output = BDop.LoginUser(req.body.email, req.body.password).then(result =>{
            res.render('login.ejs', {message: result});
        });
    }
});

app.post('/accident', function(req, res){
    res.send(req.body);
    if(req.body.number === null || req.body.street === null || req.body.district === null || req.body.description === null) console.log("empty");

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let today = `${day}/${month}/${year}`;

    console.log(today);

    //BDop.AddAccident(req.body.number, req.body.street, req.body.district, req.body.accident, today ,11);

});


app.use(express.static('private'));
app.listen(8080);