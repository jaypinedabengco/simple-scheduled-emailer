var config = require('./../configuration');
var healthcheck_dao = require('./../dao/healthcheck.dao');

///

exports.getHealthCheck = getHealthCheck;

///

/**
* 
*/
function getHealthCheck() {

    var healthcheck = {
        db : {
            host: config.db.host,
            name: config.db.database,
            status : "0"
        }, 
        cron : config.cron, 
        email : {
            host : config.email.ehost, 
            uname : config.email.euser
        },
        email_to : config.email.student_app_email
    }

    return healthcheck_dao
        .isDBWorking()
        .then( 
            () => {
                healthcheck.db.status = "1";
                return Promise.resolve(healthcheck);
            }
        ).catch((err) => {
            healthcheck.error = err;
            return healthcheck;
        })

}