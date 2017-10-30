var cron = require('cron');
var config = require('./../configuration');
var email_service = require('./../service/email.service');

var CRON_CONFIG = config.cron.student_app_email;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR STUDENT';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.morning, 
    () => { email_service.sendStudentLatestApplicationViaEmail(CRON_CONFIG.fetch_in_hours.morning); },  //11 hours
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.morning);

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.afternoon, 
    () => { email_service.sendStudentLatestApplicationViaEmail(CRON_CONFIG.fetch_in_hours.afternoon); },  //7 hours
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.afternoon); //6 hours

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.evening, 
    () => { email_service.sendStudentLatestApplicationViaEmail(CRON_CONFIG.fetch_in_hours.evening); }, 
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.evening);