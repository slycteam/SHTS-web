const express = require('express');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {User, sequelize} = require('../models');

const router = express.Router();

/* GET home page. */
// router.get('/', function (req, res, next) {
//     return sequelize
//         .authenticate()
//         .then(() => {
//             console.log('Sequelize connection has been established successfully.');
//             res.render('index', {
//                 title: 'Express',
//                 sequelizeConnection: "Sequelize connection has been established successfully."
//             });
//         })
//         .catch(err => {
//             console.error('Unable to connect to the database:', err);
//         });
// });

router.get('/', async (req, res, next) => {
    res.render('home', {
        title: "Home",
        user: req.user || null,
        loginError: req.flash('loginError'),
    });
});

router.get('/mac', async (req, res, next) => {
    res.render('mac', {
        title: "mac",
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/ip', async (req, res, next) => {
    res.render('ip', {
        title: "ip",
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/macip', async (req, res, next) => {
    res.render('macip', {
        title: "macip",
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/slyc', async (req, res, next) => {
    res.render('slyc', {
        title: "slyc",
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login', {
        title: '로그인',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

module.exports = router;
