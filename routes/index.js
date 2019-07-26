const express = require('express');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {User, WhitelistMAC, WhitelistIP, AllowedTraffic, OUI, sequelize} = require('../models');
const {spawn} = require('child_process');
const router = express.Router();
const kill = require('tree-kill');

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
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

router.get('/mac', async (req, res, next) => {
    try {
        const whitelistMac = await WhitelistMAC.findAll({});
        res.render('mac', {
            title: "mac",
            user: req.user,
            data: whitelistMac,
            loginError: req.flash('loginError'),
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/mac', async (req, res, next) => {
    const {mac, descr} = req.body;

    try {
        const response = await WhitelistMAC.create({
            MAC: mac,
            descr: descr,
        });
    } catch (error) {
        console.log(error);
    }
    return res.redirect('/mac');
});

router.delete('/mac/:mac', async (req, res, next) => {
    const {mac} = req.params;

    try {
        const response = await WhitelistMAC.destroy({
            where: {
                MAC: mac
            },
        });
        console.log(response);
    } catch (error) {
        console.log(error);
    }
    return res.redirect('/mac');
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

router.get('/proc', async (req, res, next) => {
    let {subprocess} = req.session;
    let pid = null;
    if (subprocess) {
        pid = subprocess.pid;
    }
    res.render('proc', {
        title: "감시 프로세스",
        user: req.user,
        procStatus: pid ? 'Running' : 'Stopped',
        pid: pid,
        loginError: req.flash('loginError'),
    });
});

router.post('/proc/:command/:args', async (req, res, next) => {
    const {command, args} = req.params;

    const subprocess = spawn(command, [args]);
    console.log(`Spawned child pid: ${subprocess.pid}`);

    req.session.subprocess = subprocess;

    subprocess.stdout.on('data', (data) => {
        console.log(`subprocess.stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.log(`subprocess.stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        req.session.subprocess = null;
    });
    return res.redirect('/proc');
});

router.delete('/proc', async (req, res, next) => {
    const {subprocess} = req.session;
    if (subprocess) {
        const {pid} = subprocess;
        kill(pid);
        req.session.subprocess = null;
        res.render('proc', {
            title: "감시 프로세스",
            user: req.user,
            procStatus: pid ? 'Running' : 'Stopped',
            pid: pid,
            loginError: req.flash('loginError'),
        });
    }
});

router.get('/alert', async (req, res, next) => {
    res.render('alert', {
        title: "알림 채널 관리",
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
