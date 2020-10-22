const express = require('express');
const route = express.Router();
const users = require('../model/userModel');
const posts = require('../model/postModel');
const jwt = require('jsonwebtoken');

var session = ''

const authenticate = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = users.find(user => user.username === username);

    if(user) {
        if(user.password === password ) {
            req.user = user;
            next();
        }
        else {
            res.json({message: 'Invalid password.'})
        }
    }
    else {
        res.json({message: 'No username found.'})
    }
}

route.get('/', authenticateToken, (req, res) => {
    const authUser = req.user;

    const post = posts.find(post => post.user_id === authUser.id);

    // res.json(post);
    res.render('home.ejs', {user: authUser, post});
});

route.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

route.get('/login',isLogin, (req, res) => {
    res.render('login.ejs', {users});
});

route.post('/login', authenticate , (req, res) => {
    // res.json(req.body);
    const authUser = req.user;
    const user = authUser;

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    // res.json({accessToken: accessToken });
    const oneDayToSeconds = 24 * 60 * 60;
    const cookieConfig = {
        maxAge: oneDayToSeconds,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'? true: false
    }
    res.cookie('token', accessToken, cookieConfig);
    res.redirect('/');
});


function authenticateToken(req, res, next){
   if(req.headers.cookie) {
        const token = req.headers.cookie.split('=')[1];
        if (token === null) return res.sendsStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
   }
   else {
       res.redirect('/login');
   }
}

function isLogin(req, res, next){
    if(req.headers.cookie) {
        res.redirect('/');
    }
    else {
        next();
    }
}

module.exports = route;