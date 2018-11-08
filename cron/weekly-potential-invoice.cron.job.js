var cron = require('cron');
var config = require('../configuration');
var email_service = require('../service/email.service');

var CRON_CONFIG = config.cron.weekly_potential_invoice;
var TIMEZONE = CRON_CONFIG.timezone;

const STARTED_MESSAGE = 'CRON JOB STARTED FOR WEEKLY POTENTIAL INVOICE';

/**
 * 
 */
new cron.CronJob(CRON_CONFIG.morning, 
    () => { email_service.sendStudentLatestChangesApplicationWeeklyPotentialInvoice(); }, 
    () => {},
    true, 
    TIMEZONE
);
    console.log(STARTED_MESSAGE, CRON_CONFIG.morning, TIMEZONE);