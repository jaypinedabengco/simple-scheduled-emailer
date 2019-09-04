var fs = require("fs"),
  json2csv = require("json2csv"),
  moment = require("moment-timezone"),
  nodemailer = require("nodemailer"),
  smtpTransport = require("nodemailer-smtp-transport");
var config = require("./../configuration");
var student_dao = require("./../dao/student.dao"),
  agency_dao = require("./../dao/agency.dao"),
  institutionDao = require("./../dao/institution.dao");

///

// const CSV_FILE_LOCATION = __basedir + '/created-csv-files/';

///

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: config.email.service,
    host: config.email.ehost,
    port: config.email.eport,
    quitwait: config.email.quitwait,
    auth: { user: config.email.euser, pass: config.email.epass }
  })
);

////

exports.sendStudentLatestApplicationViaEmail = sendStudentLatestApplicationViaEmail;
exports.sendAllStudentsLatestDetailsViaEmail = sendAllStudentsLatestDetailsViaEmail;
exports.sendLatestApprovedAgenciesViaEmail = sendLatestApprovedAgenciesViaEmail;
exports.sendAllAgenciesViaEmail = sendAllAgenciesViaEmail;
exports.sendIntakeReportViaEmail = sendIntakeReportViaEmail;
exports.sendStudentLatestChangesApplicationWeeklyPotentialInvoice = sendStudentLatestChangesApplicationWeeklyPotentialInvoice;
exports.sendStudentApplicationWithoutInvoice = sendStudentApplicationWithoutInvoice;
exports.sendStudentLatestApplicationViaEmailEveryMonday = sendStudentLatestApplicationViaEmailEveryMonday;
exports.sendStudentsWithStudyCommencedCourseApplication = sendStudentsWithStudyCommencedCourseApplication;
exports.sendInstitutionList = sendInstitutionList;

///

/**
 *
 */
async function sendStudentsWithStudyCommencedCourseApplication() {
  const result = await student_dao.getStudentsWithStudyCommencedCourseApplication();

  // get from configuration
  const {
    timezone: email_timezone
  } = config.cron.student_with_study_commenced_application;
  const { to, cc, bcc } = config.email.student_with_study_commenced_application;

  const from  = config.email.efrom;

  const date_process = moment()
    .tz(email_timezone)
    .format("MM-DD-YYYY-hh:mm:ss");
  const csv_file_name = "student-with-study-commenced-" + date_process + ".csv";
  const csv_raw_data = await convertDBResultToDynamicCSV(result);
  const subject = "[System Generated] Commenced Students " + date_process;
  const hasAttachment = !!result.length;

  let html = `
    <div>
        <div>[SYSTEM GENERATED]</div>
        <br/><br/>
        <div>
            <b> Student Total : <b/> ${result.length}
        </div>
    </div>
    <br/><br/>
    ${hasAttachment ? 
        '' : 
        `<div>
            <b> No Data </b>
        </div>
    `}
  `

  //build email
  const email_content = {
    html,
    subject,
    from,
    to,
    cc,
    bcc,
    has_csv_attachment: hasAttachment,
    csv_filename: csv_file_name,
    csv_content: csv_raw_data
  };

  return sendEmail(email_content);
}

/**
 *
 */
function sendStudentLatestApplicationViaEmail(elapsed_hours) {
  return new Promise((resolve, reject) => {
    student_dao
      .getLatestStudentsWithOrWithoutCourseApplication(elapsed_hours)
      .then(sendEmailWithCSVAttachmentForStudentApplications)
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 */
function sendAllStudentsLatestDetailsViaEmail() {
  return new Promise((resolve, reject) => {
    student_dao
      .getAllStudentsDetailedInformation()
      .then(sendEmailWithCSVAttachmentForStudentFullDetails)
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 */
function sendLatestApprovedAgenciesViaEmail() {
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
 */
function sendAllAgenciesViaEmail() {
  return new Promise((resolve, reject) => {
    agency_dao
      .getAllAgencies()
      .then(sendEmailWithCSVAttachmentForAllAgencies)
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 */
function sendIntakeReportViaEmail() {
  return new Promise((resolve, reject) => {
    student_dao
      .getAllIntakesReport()
      .then(sendEmailWithCSVAttachmentForIntakeDetails)
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 * @param {*} elapsed_hours
 */
function sendStudentLatestChangesApplicationWeeklyPotentialInvoice() {
  return new Promise((resolve, reject) => {
    student_dao
      .getStudentLatestChangesApplicationWeeklyPotentialInvoice()
      .then(result =>
        sendEmailWithCSVAttachmentForStudentLatestChangesApplicationWeeklyPotentialInvoice(
          result
        )
      )
      .then(resolve, reject)
      .catch(reject);
  });
}



function sendStudentApplicationWithoutInvoice() {
    return new Promise((resolve, reject) => {
        student_dao
            .getCourseApplicationsWithoutInvoice()
            .then(result => sendEmailWithCSVAttachmentForStudentApplicationWithoutInvoice(result))
            .then(resolve, reject)
            .catch(reject);
    });
}

/**
 *
 * @param {*} student_info
 */
function sendEmailWithCSVAttachmentForStudentApplications(student_info) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.student_app_email.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("MM-DD-YYYY-hh:mm:ss");
    var csv_file_name = "student-applications-" + date_process + ".csv";
    var csv_mime_type = "text/csv";

    convertDBResultToDynamicCSV(student_info)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject: "[System Generated] Student Application CSV " + date_process,
          from: config.email.efrom,
          to: config.email.student_app_email.to,
          cc: config.email.student_app_email.cc,
          bcc: config.email.student_app_email.bcc,
          has_csv_attachment: student_info.length > 0,
          csv_filename: csv_file_name,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = "<div>";
        email_content.html += "   <div>[SYSTEM GENERATED]</div>";
        email_content.html += "   <br/><br/>";
        email_content.html += "   <div>";
        email_content.html += "       <b>Student Total : <b/>";
        email_content.html += student_info.length;
        email_content.html += "   </div>";
        email_content.html += "</div>";
        email_content.html += "   <br/><br/>";

        //if has content, then attach
        if (!email_content.has_csv_attachment) {
          email_content.html += "<div>";
          email_content.html += "  <b> No New Student </b>";
          email_content.html += "</div>";
        }

        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 * @param {*} student_info
 */
function sendEmailWithCSVAttachmentForStudentLatestChangesApplicationWeeklyPotentialInvoice(
  student_info
) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.weekly_potential_invoice.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("DD MMM YYYY hh:mmA");
    var csv_file_name = `[System Generated] Weekly Potential Invoicing CSV ${date_process} Syd.csv`;
    var csv_mime_type = "text/csv";

    // let student_info = [
    //     {
    //         firsname: 'test FN',
    //         lastname: 'test LN',
    //         counsellor: 'test counsellor'
    //     }
    // ]

    convertDBResultToDynamicCSV(student_info)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject: `[System Generated] Weekly Potential Invoicing ${date_process} Syd`,
          from: config.email.efrom,
          to: config.email.weekly_potential_invoicing.to,
          cc: config.email.weekly_potential_invoicing.cc,
          bcc: config.email.weekly_potential_invoicing.bcc,
          has_csv_attachment: student_info.length > 0,
          csv_filename: csv_file_name,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = `
                    <div>
                        <div>[SYSTEM GENERATED]</div>
                        <br/><br/>
                        <div>
                        <b>Student Total : <b/>
                        ${student_info.length}
                        </div>
                    </div>
                    <br/><br/>
                `;

        //if has content, then attach
        if (!email_content.has_csv_attachment) {
          email_content.html = `
                        <div>
                          <b> No New Student </b>
                        </div>
                    `;
        }
        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 * 
 * @param {*} student_info 
 */
function sendEmailWithCSVAttachmentForStudentApplicationWithoutInvoice(student_info) {
    return new Promise((resolve, reject) => {

        var email_timezone = config.cron.student_application_without_invoice.timezone;
        var date_process = (moment().tz(email_timezone).format('DD MMM YYYY hh:mmA'));
        var csv_file_name = `[System Generated] Applications without Invoices CSV ${date_process} Syd.csv`;
        var csv_mime_type = 'text/csv';


        convertDBResultToDynamicCSV(student_info)
            .then(
            (csv_raw_data) => {
                let email_content = {
                    html: '',
                    subject: `[System Generated] Applications without Invoices CSV ${date_process} Syd` ,
                    from: config.email.efrom,
                    to: config.email.student_application_without_invoice.to,
                    cc: config.email.student_application_without_invoice.cc,
                    bcc: config.email.student_application_without_invoice.bcc,
                    has_csv_attachment: student_info.length > 0,
                    csv_filename: csv_file_name,
                    csv_content: csv_raw_data
                };

                //build email to send
                email_content.html = `
                    <div>
                        <div>[SYSTEM GENERATED]</div>
                        <br/><br/>
                        <div>
                        <b>Student Course Application for Invoicing Total : <b/>
                        ${student_info.length}
                        </div>
                    </div>
                    <br/><br/>
                `;

                //if has content, then attach
                if (!email_content.has_csv_attachment) {
                    email_content.html = `
                        <div>
                          <b> No Student Course Application for Invoicing </b>
                        </div>
                    `;
                }
                return sendEmail(email_content);

            }
            )
            .then(resolve, reject)
            .catch(reject);
    })
}


/**
 *
 * @param {*} data
 */
function sendEmailWithCSVAttachmentForStudentFullDetails(data) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.student_full_details_email.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("DMMMYYYY-hh:mmA");
    var csv_file_name = "student-records-" + date_process + ".csv";
    var csv_mime_type = "text/csv";
    var email_config = config.email.student_full_details_email;

    convertDBResultToDynamicCSV(data)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject: "[System Generated] Student Records CSV " + date_process,
          from: config.email.efrom,
          to: email_config.to,
          cc: email_config.cc,
          bcc: email_config.bcc,
          csv_filename: csv_file_name,
          has_csv_attachment: !!data.length,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = `
                    <div>
                        <div>[SYSTEM GENERATED]</div>
                        <br/><br/>
                        <div>
                            <b>No. of Entries : ${data.length}<b/>
                        </div>
                    </div>
                `;
        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 * @param {*} data
 */
function sendEmailWithCSVAttachmentForIntakeDetails(data) {
    return new Promise((resolve, reject) => {

        var email_timezone = config.cron.preferred_intake_details_email.timezone;
        var date_process = (moment().tz(email_timezone).format('DMMMYYYY-hh:mmA'));
        var csv_file_name = 'preferred-intake-' + date_process + '.csv';
        var csv_mime_type = 'text/csv';
        var email_config = config.email.preferred_intake_email;

        convertDBResultToDynamicCSV(data)
            .then(
            (csv_raw_data) => {
                let email_content = {
                    html: '',
                    subject: '[System Generated] Preferred Intake CSV  ' + date_process,
                    from: config.email.efrom,
                    to: email_config.to,
                    cc: email_config.cc,
                    bcc: email_config.bcc,
                    csv_filename: csv_file_name,
                    has_csv_attachment: !!data.length,
                    csv_content: csv_raw_data
                };

                //build email to send
                email_content.html = `
                    <div>
                        <div>[SYSTEM GENERATED]</div>
                        <br/><br/>
                        <div>
                            <b>No. of Entries : ${data.length}<b/>
                        </div>
                    </div>
                `;
        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}

/**
 *
 * @param {*} agencies
 */
function sendEmailWithCSVAttachmentForApprovedAgencies(agencies) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.approved_agencies_email.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("MM-DD-YYYY-hh:mm:ss");
    var csv_file_name = "approved-master-agencies-" + date_process + ".csv";
    var csv_mime_type = "text/csv";

    var fields = [
      "Company_Name",
      "Head_Office_Address_Country",
      "Head_Office_Contact_Title",
      "Head_Office_Contact_Firstname",
      "Head_Office_Contact_Lastname",
      "Head_Office_Contact_Email"
    ];

    convertDBResultToCSV(fields, agencies)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject:
            "[System Generated] Approved Master Agencies " + date_process,
          from: config.email.efrom,
          to: config.email.approved_agencies_email.to,
          cc: config.email.approved_agencies_email.cc,
          bcc: config.email.approved_agencies_email.bcc,
          has_csv_attachment: agencies.length > 0,
          csv_filename: csv_file_name,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = "<div>";
        email_content.html += "   <div>[SYSTEM GENERATED]</div>";
        email_content.html += "   <br/><br/>";
        email_content.html += "   <div>";
        email_content.html += "       <b>Approved Agencies Total : <b/>";
        email_content.html += agencies.length;
        email_content.html += "   </div>";
        email_content.html += "</div>";
        email_content.html += "   <br/><br/>";

        //if has content, then attach
        if (!email_content.has_csv_attachment) {
          email_content.html += "<div>";
          email_content.html += "  <b> No New Approved Agencies </b>";
          email_content.html += "</div>";
        }

        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}

function sendEmailWithCSVAttachmentForAllAgencies(data) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.all_agencies.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("DMMMYYYY-hh:mmA");
    var csv_file_name = "master-agencies-list-" + date_process + ".csv";
    var csv_mime_type = "text/csv";
    var email_config = config.email.all_agencies_email;

    convertDBResultToDynamicCSV(data)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject: "[System Generated] Master Agencies CSV " + date_process,
          from: config.email.efrom,
          to: email_config.to,
          cc: email_config.cc,
          bcc: email_config.bcc,
          csv_filename: csv_file_name,
          has_csv_attachment: !!data.length,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = `
                    <div>
                        <div>[SYSTEM GENERATED]</div>
                        <br/><br/>
                        <div>
                            <b>No. of Entries : ${data.length}<b/>
                        </div>
                    </div>
                `;
        return sendEmail(email_content);
      })
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
function sendEmail(email_content) {
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
      csv_mime_type = "text/csv";

    //set content
    let mail_options = {
      from: from,
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject, // Subject line
      html: html // plain text body,
    };

    //if has content, then attach
    if (has_csv_attachment) {
      mail_options.attachments = [
        {
          filename: csv_filename,
          content: csv_content,
          contentType: csv_mime_type
        }
      ];
    }

    // send mail with defined transport object
    transporter.sendMail(mail_options, (error, info) => {
      console.log(error, info);
    });

    return resolve(csv_content);

    // send mail with defined transport object
    // transporter.sendMail(mail_options, (error, info) => {
    //     console.log(info)
    //     if (error) {
    //         return reject();
    //     }
    //     console.log('FROM SENDEMAIL' , csv_content)
    //     return resolve(csv_content);
    // });
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

/**
 * Headers will be based on data sent,
 * if empty, then will return an empty ''
 * @param {*} data
 */
function convertDBResultToDynamicCSV(data) {
  return new Promise((resolve, reject) => {
    if (!data || !(data instanceof Array) || !data[0]) {
      return resolve("");
    }

    //create headers from object structure
    var fields = Object.keys(data[0]);
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

function sendStudentLatestApplicationViaEmailEveryMonday() {
    return new Promise((resolve, reject) => {
        student_dao
            .getLatestStudentsWithOrWithoutCourseApplicationFromSundayToSaturday()
            .then(sendEmailWithCSVAttachmentForStudentApplications)
            .then(resolve, reject)
            .catch(reject);
    });
}


function sendInstitutionList(){
  return new Promise((resolve, reject) => {
    institutionDao
        .getInstitutionList()
        .then(sendEmailWithCSVAttachmentForInstitution)
        .then(resolve, reject)
        .catch(reject);
  });
}



/**
 *
 * @param {*} student_info
 */
function sendEmailWithCSVAttachmentForInstitution(institution_list) {
  return new Promise((resolve, reject) => {
    var email_timezone = config.cron.institution.timezone;
    var date_process = moment()
      .tz(email_timezone)
      .format("MM-DD-YYYY-hh:mm:ss");
    var csv_file_name = "institution-" + date_process + ".csv";
    var csv_mime_type = "text/csv";

    convertDBResultToDynamicCSV(institution_list)
      .then(csv_raw_data => {
        let email_content = {
          html: "",
          subject: "[System Generated] Institution CSV " + date_process,
          from: config.email.efrom,
          to: config.email.student_app_email.to,
          cc: config.email.student_app_email.cc,
          bcc: config.email.student_app_email.bcc,
          has_csv_attachment: institution_list.length > 0,
          csv_filename: csv_file_name,
          csv_content: csv_raw_data
        };

        //build email to send
        email_content.html = "<div>";
        email_content.html += "   <div>[SYSTEM GENERATED]</div>";
        email_content.html += "   <br/><br/>";
        email_content.html += "   <div>";
        email_content.html += "       <b>Institution Total : <b/>";
        email_content.html += institution_list.length;
        email_content.html += "   </div>";
        email_content.html += "</div>";
        email_content.html += "   <br/><br/>";

        //if has content, then attach
        if (!email_content.has_csv_attachment) {
          email_content.html += "<div>";
          email_content.html += "  <b> No New Institution </b>";
          email_content.html += "</div>";
        }

        return sendEmail(email_content);
      })
      .then(resolve, reject)
      .catch(reject);
  });
}