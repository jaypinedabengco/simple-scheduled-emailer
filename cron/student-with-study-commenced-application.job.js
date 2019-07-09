var cron = require('cron');
var config = require('../configuration');
var email_service = require('../service/email.service');

var CRON_CONFIG = config.cron.student_with_study_commenced_application;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR STUDENT WITH STUDY COMMENCED APPLICATION INVOICE';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.morning, 
    () => { email_service.sendStudentsWithStudyCommencedCourseApplication() }, 
    () => {},
    true, 
    TIMEZONE
);
    console.log(STARTED_MESSAGE, CRON_CONFIG.morning, TIMEZONE);