var cron = require('cron');
var config = require('./configuration');
var email_service = require('./service/email.service');

var TIMEZONE = config.cron.timezone;

/**
 * 
 */

new cron.CronJob(config.cron.morning, 
    () => { email_service.sendStudentLatestApplicationViaEmail(config.cron.student_day_to_get); }, 
    () => {},
    true, 
    TIMEZONE
);
console.log('CRON JOB STARTED', config.cron.morning);

/**
 * 
 */
new cron.CronJob(config.cron.afternoon, 
    () => { email_service.sendStudentLatestApplicationViaEmail(config.cron.student_day_to_get); }, 
    () => {},
    true, 
    TIMEZONE
);
console.log('CRON JOB STARTED', config.cron.afternoon);

/**
 * 
 */
new cron.CronJob(config.cron.evening, 
    () => { email_service.sendStudentLatestApplicationViaEmail(config.cron.student_day_to_get); }, 
    () => {},
    true, 
    TIMEZONE
);
console.log('CRON JOB STARTED', config.cron.evening);