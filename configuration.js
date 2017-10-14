module.exports = {
    db: {
        host               : process.env.DB_HOST,
        user               : process.env.DB_USER,
        password           : process.env.DB_PASSWORD,
        database           : process.env.DB_NAME, 
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
        student_app_email : {
            to : process.env.CSV_REPORT_EMAILER_TO, 
            cc : process.env.CSV_REPORT_EMAILER_CC, 
            bcc : process.env.CSV_REPORT_EMAILER_BCC
        }
    }, 
    cron : {
        timezone : 'Australia/Brisbane', 
        morning : '00 00 08 * * *',  //8 AM
        afternoon : '00 00 16 * * *',  //3 PM
        evening : '00 00 21 * * *',  //9 PM
        student_day_to_get : 1
    }


}