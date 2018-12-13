var cron = require('cron');
var config = require('./../configuration');
var email_service = require('./../service/email.service');

var CRON_CONFIG = config.cron.preferred_intake_details_email;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR INTAKE';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.afternoon, 
    () => { email_service.sendIntakeReportViaEmail(); },  //11 hours
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.afternoon, TIMEZONE);

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.morning_monday, 
    () => { email_service.sendIntakeReportViaEmail(); },  //9AM Monday
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.morning_monday, TIMEZONE);