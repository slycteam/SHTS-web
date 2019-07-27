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

router.post('/channels/send', async (req, res, next) => {

    const prot = req.protocol;
    const host = req.get('host');

    const text = req.body.text || "Hello channels!";
    try {
        const res = await axios.all(
            [
                axios.post(`${prot}://${host}/api/slack/send`, {
                    text
                }),
                axios.post(`${prot}://${host}/api/line/send`, {
                    text
                }),
            ]);
    } catch (error) {
        console.log(error);
    }
    res.send('Multi-platform message sent to slack and line messenger.\n');
});

router.post('/line/send', async (req, res, next) => {
    const text = req.body.text || "Hello line!";
    const token = process.env.LINE_TOKEN;
    try {
        axios({
            method: 'post',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Cache-Control': "no-cache",
                'Authorization': "Bearer " + token
            },
            data: 'message=' + text
        });
    } catch (error) {
        console.log(error);
    }
    res.send('Slack message sent to line notify.\n');
});

router.get('/reg', async (req, res, next) => {
    const prot = req.protocol;
    const host = req.get('host');

    const ip = req.query.ip;
    const descr = "User registered IP.";

    try {
        await axios.post(`${prot}://${host}/ip`, {
            ip,
            descr
        });
    } catch (error) {
        console.log(error);
    }
    res.send(`New ip ${ip} registered by user!`);
});
module.exports = router;
