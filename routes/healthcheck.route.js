var express = require('express');
var router = express.Router();

var healthcheck_service = require('./../service/healthcheck.service');

////

router.get('/healthcheck', healthcheck);

//////

function healthcheck(req, res, next) {
    return healthcheck_service
        .getHealthCheck()
        .then(
            result => { 
                //prettify
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result, null, 3));
            }
        ).catch(err => res.status(500).json(err));
}

module.exports = router;
