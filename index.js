const express = require('express');
const BDop = require('./database');

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
    res.render('login.ejs', {output : ""});
});

app.get('/accident', function(req, res, next){
    res.render('accident.ejs')
});

//POST

app.post("/login", function(req, res) {
    if(req.body.btn == "signup"){
        if(req.body.pseudo == null || req.body.email == null || req.body.name == null || req.body.password == null) return;

        let output = BDop.AddUser(req.body.pseudo, req.body.email, req.body.name, req.body.password).then(data => {
            res.render('login.ejs', {output : JSON.stringify(data)});
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