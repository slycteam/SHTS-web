const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET apis listing. */
router.get('/', function (req, res, next) {
    res.send('/api activated.');
});

router.post('/slack/send', async (req, res, next) => {
    const text = req.body.text || "Hello world!";
    console.log("text", text);
    try {
        await axios.post('https://hooks.slack.com/services/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', {
            text
        });
    } catch (error) {
        console.log(error);
    }
    res.send('Slack message sent to #s-hts-alerts.\n');
});

router.post('/line/send_notify', async (req, res, next) => {
    const token = 'jqbeEbXRn1CahprTGElYVroQTQ2EJkx864pOgtYMHPd';
    const msg = req.body.text || "Line msg test";
    console.log("text", msg);
    try {
        axios({
            method: 'post',
            url: 'https://notify-api.line.me/api/notify',
            headers: { 
                'Content-Type' : "application/x-www-form-urlencoded",
                'Cache-Control' : "no-cache",
                'Authorization' : "Bearer " + token 
            },
            data: 'message=' + msg
          });
    } catch (error) {
        console.log(error);
    }
    res.send('Slack message sent to line notify.\n');
});

module.exports = router;
