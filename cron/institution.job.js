var cron = require('cron');
var config = require('../configuration');
var email_service = require('../service/email.service');

var CRON_CONFIG = config.cron.institution;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR INSTITUTION';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.morning, 
    () => { email_service.sendInstitutionList() }, 
    () => {},
    true, 
    TIMEZONE
);
    console.log(STARTED_MESSAGE, CRON_CONFIG.morning, TIMEZONE);