var cron = require('cron');
var config = require('../configuration');
var email_service = require('../service/email.service');

var CRON_CONFIG = config.cron.student_application_without_invoice;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR STUDENT APPLICATION WITHOUT INVOICE';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.every_friday, 
    () => { email_service.sendStudentApplicationWithoutInvoice(); },  //8am friday
    () => {},
    true, 
    TIMEZONE
);
console.log(STARTED_MESSAGE, CRON_CONFIG.every_friday, TIMEZONE);
