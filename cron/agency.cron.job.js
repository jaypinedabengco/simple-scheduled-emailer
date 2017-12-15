var cron = require('cron');
var config = require('./../configuration');
var email_service = require('./../service/email.service');

var CRON_CONFIG = config.cron.approved_agencies_email;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR AGENCY';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.every_friday, 
    () => { email_service.sendLatestApprovedAgenciesViaEmail(); },  //11 hours
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.every_friday);