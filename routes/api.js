const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET apis listing. */
router.get('/', function (req, res, next) {
    res.send('/api activated.');
});

router.post('/slack/send', async (req, res, next) => {
    const text = req.body.text || "Hello slack!";
    try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text
        });
    } catch (error) {
        console.log(error);
    }
    res.send('Slack message sent to #s-hts-alerts.\n');
});

router.post('/line/send', async (req, res, next) => {
    const text = req.body.text || "Hello line!";
    const token = process.env.LINE_TOKEN;
    try {
        axios({
            method: 'post',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                'Content-Type' : "application/x-www-form-urlencoded",
                'Cache-Control' : "no-cache",
                'Authorization' : "Bearer " + token
            },
            data: 'message=' + text
          });
    } catch (error) {
        console.log(error);
    }
    res.send('Slack message sent to line notify.\n');
});

module.exports = router;
