var express = require('express');
var router = express.Router();

var email_service = require('./../service/email.service');

/* GET users listing. */
router.get('/', function(req, res, next) {
    email_service
        .sendStudentLatestApplicationViaEmail(1)
        .then(
            (result) => res.status(200).json(result), 
            (err) => {
                console.log('error', err);
                res.send(err)
            }
        )
});

module.exports = router;
