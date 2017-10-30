var express = require('express');
var router = express.Router();

var email_service = require('./../service/email.service');


router.get('/student-latest-application', sendStudentLatestApplicationEmail);
router.get('/approved-agencies', sendApprovedAgenciesEmail);



/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function sendStudentLatestApplicationEmail(req, res, next) {
    email_service
        .sendStudentLatestApplicationViaEmail(1)
        .then(
            (result) => res.status(200).json(result), 
            (err) => {
                console.log('error', err);
                res.send(err)
            }
        )
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function sendApprovedAgenciesEmail(req, res, next){
    email_service
        .sendLatestApprovedAgenciesViaEmail()
        .then(
            (result) => res.status(200).json(result), 
            (err) => {
                console.log('error', err);
                res.send(err)
            }
        )
}

module.exports = router;
