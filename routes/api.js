const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET apis listing. */
router.get('/', function (req, res, next) {
    res.send('/api activated.');
});

router.get('/slack/send', async (req, res, next) => {
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

module.exports = router;
