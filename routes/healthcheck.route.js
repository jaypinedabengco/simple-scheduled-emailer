var express = require('express');
var router = express.Router();

var healthcheck_service = require('./../service/healthcheck.service');

/* GET users listing. */
router.get('/healthcheck', function(req, res, next) {
    return healthcheck_service
        .getHealthCheck()
        .then(
            result => res.status(200).json(result)
        ).catch(err => res.status(500).json(err))
});

module.exports = router;
