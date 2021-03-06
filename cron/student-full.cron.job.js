var cron = require('cron');
var config = require('./../configuration');
var email_service = require('./../service/email.service');

var CRON_CONFIG = config.cron.student_full_details_email;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR STUDENT FULL DETAILS';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.afternoon, 
    () => {email_service.sendAllStudentsLatestDetailsViaEmail();} ,  //11 hours
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.afternoon, TIMEZONE);