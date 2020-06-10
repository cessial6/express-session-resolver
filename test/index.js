const express = require("express"), 
    app = express(),
    passport = require('passport');

var mysqlSetting = {
    host: "localhost",
    port: "3308",
    user: "system",
    password: "systempass",
    database: "db"
}

const debug = require("debug")('socketio-express-session-test')

const cookieName = "SESSION_COOKIE"
const secret = "3fh74dgw8583wo75h6o8w759w73hd46758w3o485f"

const createSessionMiddleware = function() {
    const session = require("express-session"),
        MySQLStore = require('express-mysql-session')(session);
    return session({
        key:  cookieName,
        secret: secret,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: false, // HTTP接続 なので false
            maxAge: 1000 * 10, // 10 seconds
            httpOnly: false // Use Javascript to show on browser.
        },
        store: new MySQLStore(mysqlSetting)
    })
}

const createPassportLogic = function() {
    const LocalStrategy = require('passport-local').Strategy
    passport.serializeUser(function(username, done) {
        done(null, username);
    });
      
    passport.deserializeUser(function(username, done) {
        done(null, {name:username});
    });

    passport.use(new LocalStrategy(
        {username: "username", password: "password"},
        function(username, password, done){
        
          if(username == "demo" && password == "demo"){
            return done(null, username);
          }
          return done(null, false, {message: "invalid"});
        }
    ))
}
app.use(require('body-parser').json())
app.use(createSessionMiddleware())
app.use(passport.initialize())
app.use(passport.session())
createPassportLogic();

// login api
app.post("/", passport.authenticate('local'), function(req, res, next){
    res.json("login success.");
});

app.get("/", function(req, res, next){
    res.sendFile(__dirname + '/index.html')
});

// import Resolver from '../../index.js';
const Resolver = require('../index');
const resolver = new Resolver({
    mysql: mysqlSetting,
    name: cookieName,
    secret: secret
});
// re-convert-to-session-id api
app.get("/sessionid", function(req, res, next){
     if (req.isAuthenticated()) {
        resolver.findSession(req.headers.cookie).then(result=>{
            debug("result: " + JSON.stringify(result))
            res.send(result.session_id);
        }).catch(error=>{
            res.send(error.message)
        })
     } else {
        res.send("you dont have cookie. please login.");
     }
});

const port = 5555
app.listen(port, () => {
    debug(`listen to localhost:${port}`)
})