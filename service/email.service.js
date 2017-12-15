var fs = require('fs'), 
    json2csv = require('json2csv'), 
    moment = require('moment-timezone'), 
    nodemailer = require('nodemailer'), 
    smtpTransport = require('nodemailer-smtp-transport');
var config = require('./../configuration');
var student_dao = require('./../dao/student.dao'), 
    agency_dao = require('./../dao/agency.dao');

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

////

exports.sendStudentLatestApplicationViaEmail = sendStudentLatestApplicationViaEmail;
exports.sendLatestApprovedAgenciesViaEmail = sendLatestApprovedAgenciesViaEmail;

///

/**
 * 
 */
function sendStudentLatestApplicationViaEmail(elapsed_hours) {
    return new Promise((resolve, reject) => {
        student_dao
            .getLatestStudentsWithOrWithoutCourseApplication(elapsed_hours)
            .then(sendEmailWithCSVAttachmentForStudent)
            .then(resolve, reject)
            .catch(reject);
    });
}

/**
 * 
 */
function sendLatestApprovedAgenciesViaEmail(){
    return new Promise((resolve, reject) => {
        agency_dao
            .getAllApprovedAgencies()
            .then(sendEmailWithCSVAttachmentForApprovedAgencies)
            .then(resolve, reject)
            .catch(reject);
    });    
}


/**
 * 
 * @param {*} student_info 
 */
function sendEmailWithCSVAttachmentForStudent(student_info){
    return new Promise((resolve, reject) => {

        var email_timezone = config.cron.student_app_email.timezone;
        var date_process = (moment().tz(email_timezone).format('MM-DD-YYYY-hh:mm:ss'));
        var csv_file_name = 'student-applications-' + date_process + '.csv';
        var csv_mime_type = 'text/csv';

        var fields = [
            'Student_Name', 
            'Student_Country', 
            'Applied_Course_Name', 
            'Applied_Institution_Name', 
            'Date_of_Application', 
            'Agent_Name'
        ];

        convertDBResultToCSV(fields, student_info)
            .then(
                (csv_raw_data) => {

                    let email_content = {
                        html : '', 
                        subject: '[System Generated] Student Application CSV ' + date_process, 
                        from: config.email.efrom, 
                        to: config.email.student_app_email.to, 
                        cc: config.email.student_app_email.cc, 
                        bcc: config.email.student_app_email.bcc, 
                        has_csv_attachment: student_info.length > 0, 
                        csv_filename: csv_file_name, 
                        csv_content: csv_raw_data
                    }

                    //build email to send
                    email_content.html = '<div>';
                    email_content.html += '   <div>[SYSTEM GENERATED]</div>';
                    email_content.html += '   <br/><br/>';
                    email_content.html += '   <div>';
                    email_content.html += '       <b>Student Total : <b/>';
                    email_content.html += student_info.length;
                    email_content.html += '   </div>';
                    email_content.html += '</div>';
                    email_content.html += '   <br/><br/>';

                    //if has content, then attach
                    if ( !email_content.has_csv_attachment ){
                        email_content.html += '<div>';
                        email_content.html += '  <b> No New Student </b>';
                        email_content.html += '</div>';                       
                    }
                    
                    return sendEmail(email_content);
                   
                }
            )
            .then(resolve, reject)
            .catch(reject);
    });        
}

/**
 * 
 * @param {*} agencies 
 */
function sendEmailWithCSVAttachmentForApprovedAgencies(agencies){
    return new Promise((resolve, reject) => {
        
        var email_timezone = config.cron.approved_agencies_email.timezone;
        var date_process = (moment().tz(email_timezone).format('MM-DD-YYYY-hh:mm:ss'));
        var csv_file_name = 'approved-master-agencies-' + date_process + '.csv';
        var csv_mime_type = 'text/csv';

        var fields = [
            'Company_Name', 
            'Head_Office_Address_Country', 
            'Head_Office_Contact_Title', 
            'Head_Office_Contact_Firstname', 
            'Head_Office_Contact_Lastname', 
            'Head_Office_Contact_Email' 
        ];

        convertDBResultToCSV(fields, agencies)
            .then(
                (csv_raw_data) => {

                    let email_content = {
                        html : '', 
                        subject: '[System Generated] Approved Master Agencies ' + date_process, 
                        from: config.email.efrom, 
                        to: config.email.approved_agencies_email.to, 
                        cc: config.email.approved_agencies_email.cc, 
                        bcc: config.email.approved_agencies_email.bcc, 
                        has_csv_attachment: agencies.length > 0, 
                        csv_filename: csv_file_name, 
                        csv_content: csv_raw_data
                    }

                    //build email to send
                    email_content.html = '<div>';
                    email_content.html += '   <div>[SYSTEM GENERATED]</div>';
                    email_content.html += '   <br/><br/>';
                    email_content.html += '   <div>';
                    email_content.html += '       <b>Approved Agencies Total : <b/>';
                    email_content.html += agencies.length;
                    email_content.html += '   </div>';
                    email_content.html += '</div>';
                    email_content.html += '   <br/><br/>';

                    //if has content, then attach
                    if ( !email_content.has_csv_attachment ){
                        email_content.html += '<div>';
                        email_content.html += '  <b> No New Approved Agencies </b>';
                        email_content.html += '</div>';                       
                    }
                    
                    return sendEmail(email_content);
                    
                }
            )
            .then(resolve, reject)
            .catch(reject);
    });    
}

/**
 * 
 * * email_content
 *  * html
 *  * subject
 *  * from
 *  * to
 *  * cc
 *  * bcc
 *  * has_csv_attachment
 *  * csv_filename
 *  * csv_content
 * 
 * @param {*} email_content 
 */
function sendEmail(email_content){
    return new Promise((resolve, reject) => {

        let html = email_content.html, 
            subject = email_content.subject, 
            from = email_content.from, 
            to = email_content.to, 
            cc = email_content.cc, 
            bcc = email_content.bcc;
            
        let has_csv_attachment = email_content.has_csv_attachment,
            csv_filename = email_content.csv_filename, 
            csv_content = email_content.csv_content, 
            csv_mime_type = 'text/csv';
         
         //set content   
        let mail_options = {
            from : from, 
            to : to, 
            cc : cc,
            bcc : bcc,
            subject: subject, // Subject line
            html: html // plain text body, 
        }

        //if has content, then attach
        if ( has_csv_attachment ){
            mail_options.attachments = [
                {
                    filename: csv_filename, 
                    content: csv_content, 
                    contentType : csv_mime_type
                }
            ]
        }
        
        // send mail with defined transport object
        transporter.sendMail(mail_options, (error, info) => {
            console.log(error, info);
        });

        return resolve(csv_content);
        
    });
}


/**
 * 
 * @param {*} data 
 */
function convertDBResultToCSV(fields, data) {
    return new Promise((resolve, reject) => {
        var csv = json2csv({ data: data, fields: fields });
        return resolve(csv);
    });
}

// /**
//  * 
//  * @param {*} student_info 
//  */
// function convertDBResultToCSVAndSaveToFile(student_info) {
//     return new Promise((resolve, reject) => {
        
//         var fields = [
//             'Student_Name', 
//             'Student_Country', 
//             'Applied_Course_Name', 
//             'Applied_Institution_Name', 
//             'Date_of_Application', 
//             'Agent_Name'
//         ];

//         //create location
//         if ( !fs.existsSync(CSV_FILE_LOCATION) ){
//             fs.mkdirSync(CSV_FILE_LOCATION);
//         }

//         var file = CSV_FILE_LOCATION + 'student-applications-' + (moment().format('MM-DD-YYYY-hh:mm:ss')) + '.csv';
//         var csv = json2csv({ data: student_info, fields: fields });

//         console.log(csv);

//         fs.writeFile(file, csv, function(err) {
//             if ( err ){
//                 return reject(err);
//             }
//             return resolve(file);
//         });

//     });

// }