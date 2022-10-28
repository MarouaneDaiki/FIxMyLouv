const express = require('express');
const { User } = require('./database');

const app = express()

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
    res.render('login.ejs')
});

app.get('/accident', function(req, res, next){
    res.render('accident.ejs')
});

//POST

app.post("/login", function(req, res) {
    if(req.body.btn == "signup"){
        if(req.body.pseudo == null || req.body.email == null || req.body.name == null || req.body.password == null) return;
        
        User.create({
            pseudo: req.body.pseudo,
            email: req.body.email,
            name: req.body.name,
            password: req.body.password
        });

    }else{
        res.send(req.body.password);
    }
});

app.post('/accident', function(req, res){
    res.send(req.body);
});


app.use(express.static('private'));
app.listen(8080);