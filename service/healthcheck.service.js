var config = require('./../configuration');
var healthcheck_dao = require('./../dao/healthcheck.dao');

///

exports.getHealthCheck = getHealthCheck;

///

/**
* 
*/
function getHealthCheck() {

    var healthcheck = JSON.parse(JSON.stringify(config));

    //remove sensitive data
    delete healthcheck.db.password;
    delete healthcheck.email.euser;
    delete healthcheck.email.epass;

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
        });

}