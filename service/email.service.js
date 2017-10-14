var fs = require('fs'), 
    json2csv = require('json2csv'), 
    moment = require('moment'), 
    nodemailer = require('nodemailer'), 
    smtpTransport = require('nodemailer-smtp-transport');
var config = require('./../configuration');
var student_dao = require('./../dao/student.dao');

///

const CSV_FILE_LOCATION = __basedir + '/created-csv-files/';

///

var transporter = nodemailer.createTransport(smtpTransport({
	service		: config.email.service,
	host		: config.email.ehost,
	port		: config.email.eport,
	quitwait	: config.email.quitwait,
	auth		: { user: config.email.euser, pass: config.email.epass }
}));

exports.sendStudentLatestApplicationViaEmail = sendStudentLatestApplicationViaEmail;

///

/**
 * 
 */
function sendStudentLatestApplicationViaEmail(elapsed_day) {
    return new Promise((resolve, reject) => {
        student_dao
            .getLatestStudentCourseApplication(elapsed_day)
            .then(sendEmailWithCSVAttachment)
            .then(resolve, reject)
            .catch(reject);
    });
}

/**
 * 
 * @param {*} student_info 
 */
function sendEmailWithCSVAttachment(student_info){
    return new Promise((resolve, reject) => {

        var date_process = (moment().format('MM-DD-YYYY-hh_mm_ss'));
        var csv_file_name = 'student-applications-' + date_process + '.csv';
        var csv_mime_type = 'text/csv';

        convertDBResultToCSV(student_info)
            .then(
                (csv_raw_data) => {

                    //build email to send
                    var html_content = '<div>';
                        html_content += '   <div>[SYSTEM GENERATED]</div>';
                        html_content += '   <br/><br/>';
                        html_content += '   <div>';
                        html_content += '       <b>Student Total : <b/>';
                        html_content += student_info.length;
                        html_content += '   </div>';
                        html_content += '</div>';
                        html_content += '   <br/><br/>';

                    let subject = '[System Generated] Student Application CSV ' + date_process;
                    console.log(config.email);
                    let mail_options = {
                        from : config.email.efrom, 
                        to : config.email.student_app_email.to, 
                        cc : config.email.student_app_email.cc,
                        bcc : config.email.student_app_email.bcc,
                        subject: subject, // Subject line
                        html: html_content, // plain text body, 
                        attachments : [
                            {
                                filename: csv_file_name, 
                                content: csv_raw_data, 
                                contentType : csv_mime_type
                            }
                        ]
                    }
                    
                    // send mail with defined transport object
                    transporter.sendMail(mail_options, (error, info) => {
                        console.log(error, info);
                    });

                    return csv_raw_data;
                }
            )
            .then(resolve, reject)
            .catch(reject);

    });        
    


}

/**
 * 
 * @param {*} student_info 
 */
function convertDBResultToCSV(student_info) {
    return new Promise((resolve, reject) => {
        
        var fields = [
            'Student_Name', 
            'Student_Country', 
            'Applied_Course_Name', 
            'Applied_Institution_Name', 
            'Date_of_Application', 
            'Agent_Name'
        ];

        var csv = json2csv({ data: student_info, fields: fields });

        return resolve(csv);

    });

}

/**
 * 
 * @param {*} student_info 
 */
function convertDBResultToCSVAndSaveToFile(student_info) {
    return new Promise((resolve, reject) => {
        
        var fields = [
            'Student_Name', 
            'Student_Country', 
            'Applied_Course_Name', 
            'Applied_Institution_Name', 
            'Date_of_Application', 
            'Agent_Name'
        ];

        //create location
        if ( !fs.existsSync(CSV_FILE_LOCATION) ){
            fs.mkdirSync(CSV_FILE_LOCATION);
        }

        var file = CSV_FILE_LOCATION + 'student-applications-' + (moment().format('MM-DD-YYYY-hh:mm:ss')) + '.csv';
        var csv = json2csv({ data: student_info, fields: fields });

        console.log(csv);

        fs.writeFile(file, csv, function(err) {
            if ( err ){
                return reject(err);
            }
            return resolve(file);
        });

    });

}