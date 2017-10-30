module.exports = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 100,
        debug: false
    },
    email: {
        euser: process.env.EMAIL_USER || process.env.SLANE_API_EMAIL_USER,
        epass: process.env.EMAIL_PASSWORD || process.env.SLANE_API_EMAIL_PASSWORD,
        service: "amazonaws",
        ehost: "email-smtp.us-east-1.amazonaws.com",
        eport: 587,
        quitwait: "false",
        efrom: "<noreply@globalstudypartners.com>",
        student_app_email: {
            to: process.env.CSV_REPORT_EMAILER_STUDENT_APP_TO,
            cc: process.env.CSV_REPORT_EMAILER_STUDENT_APP_CC,
            bcc: process.env.CSV_REPORT_EMAILER_STUDENT_APP_BCC
        }, 
        approved_agencies_email: {
            to: process.env.CSV_REPORT_EMAILER_APPROVED_AGENCY_TO,
            cc: process.env.CSV_REPORT_EMAILER_APPROVED_AGENCY_CC,
            bcc: process.env.CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC            
        }
    },
    cron: {
        student_app_email : {
            timezone: 'Australia/Brisbane',
            morning: '00 00 08 * * *',  //8 AM
            afternoon: '00 00 16 * * *',  //3 PM
            evening: '00 00 21 * * *',  //9 PM
            fetch_in_hours: {
                morning: 11, 
                afternoon: 7, 
                evening: 6
            }
        }, 
        approved_agencies_email : {
            timezone: 'Australia/Brisbane',
            every_friday : '00 00 17 * * 5' //every friday, 5pm
        }
    }


}