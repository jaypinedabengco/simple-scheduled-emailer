var database = require('./../provider/mysql.connection');

exports.getLatestStudentCourseApplication = getLatestStudentCourseApplication;
exports.getLatestStudentsWithOrWithoutCourseApplication = getLatestStudentsWithOrWithoutCourseApplication;
exports.getAllStudentsDetailedInformation = getAllStudentsDetailedInformation;
exports.getAllIntakesReport = getAllIntakesReport;
exports.getStudentLatestChangesApplicationWeeklyPotentialInvoice = getStudentLatestChangesApplicationWeeklyPotentialInvoice;
exports.getCourseApplicationsWithoutInvoice = getCourseApplicationsWithoutInvoice;
exports.getLatestStudentsWithOrWithoutCourseApplicationFromSundayToSaturday = getLatestStudentsWithOrWithoutCourseApplicationFromSundayToSaturday;
exports.getStudentsWithStudyCommencedCourseApplication = getStudentsWithStudyCommencedCourseApplication;

////

function getLatestStudentsWithOrWithoutCourseApplication(hours) {
    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            var params = [];

            var sql = `
            SELECT DISTINCT 
                CONCAT(student.firstname, " ", student.lastname) Student_Name, 
                country.name Student_Country, 
                course.course_name Applied_Course_Name, 
                provider.institution_trading_name Applied_Institution_Name, 
                course_application.date_created Date_of_Application, 
                agency.name agency_name, 
                CONCAT(agent.firstname, " ", agent.lastname) Agent_Name,
                course_application.preferred_intake expected_commencement_date,
                fee.total_annual_fee
            FROM user student 
                LEFT JOIN user_auth student_auth ON student.id = student_auth.user_id
                LEFT JOIN student_agent ON student.id = student_agent.student_id
                LEFT JOIN user agent ON student_agent.agent_id = agent.id 
                LEFT JOIN course_application ON student.id = course_application.student_id
                LEFT JOIN course ON course_application.course_id = course.course_id 
                LEFT JOIN provider ON course.provider_id = provider.provider_id 
                LEFT JOIN agency ON agent.agency_id = agency.id  
                LEFT JOIN country ON student.country_id = country.id 
                LEFT JOIN  (
                    SELECT
                      fee.* 
                    FROM
                      ( 
                        SELECT 
                          fee.*, 
                          REPLACE(CONVERT(fee_year - YEAR(CURDATE()), CHAR), "-", "a") nearest_year 
                        FROM fee 
                        ORDER BY nearest_year ASC 
                      ) fee 
                    GROUP BY fee_course_id 
                  ) fee ON course.course_id = fee.fee_course_id

            WHERE 
                student.role_id = 2 

                -- should be created either on studylane or gsp
                AND ( student_auth.created_from is NULL || student_auth.created_from IN (1,2) )
                `;

            if (hours > 0) {
                sql += `
                    AND ( 
                        course_application.date_created > timestampadd(day, -?, now()) 
                        || FROM_UNIXTIME(student.date_created/1000) >  timestampadd(day, -?, now()) 
                    )                 
                `;
                params.push(hours);
                params.push(hours);
            }

            sql += ' ORDER BY course_application.date_created, student.date_created DESC';
            return connection.query(sql, params, (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });

        });

    });
}

/**
 * If hours not provided, then return all
 * @param {*} hours 
 */
function getLatestStudentCourseApplication(hours) {
    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            var params = [];

            var sql = 'SELECT DISTINCT ';
            sql += '    CONCAT(student.firstname, " ", student.lastname) Student_Name, ';
            sql += '    country.name Student_Country, ';
            sql += '    course.course_name Applied_Course_Name, ';
            sql += '    provider.institution_trading_name Applied_Institution_Name, ';
            sql += '    course_application.date_created Date_of_Application, ';
            sql += '    agency.name agency_name, ';
            sql += '    CONCAT(agent.firstname, " ", agent.lastname) Agent_Name';

            sql += ' FROM course_application ';
            sql += '    INNER JOIN user student ON course_application.student_id = student.id ';
            sql += '    INNER JOIN user agent ON course_application.agent_id = agent.id ';
            sql += '    INNER JOIN course ON course_application.course_id = course.course_id';
            sql += '    INNER JOIN provider ON course.provider_id = provider.provider_id';
            sql += '    INNER JOIN agency ON agent.agency_id = agency.id ';
            sql += '    LEFT JOIN country ON student.country_id = country.id';

            if (hours > 0) {
                sql += ' WHERE course_application.date_created > timestampadd(hour, -?, now()) ';
                params.push(hours);
            }

            sql += ' ORDER BY  course_application.date_created DESC';

            connection.query(sql, params, (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });

        });

    });
}

/**
 * 
 */
function getAllStudentsDetailedInformation() {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            const sql = `
            SELECT DISTINCT 
                student.firstname Student_First_Name, 
                student.lastname Student_Last_Name, 
                student_country.name Student_Country, 
                agency.name Agency_Name, 
                agency_location.name Agency_Location, 
                CONCAT(agent.firstname, ' ', agent.lastname) Counsellor_Full_Name, 
                FROM_UNIXTIME(student.date_created/1000) Date_Student_Created, 
                timestampdiff(DAY, FROM_UNIXTIME(student.date_created/1000), NOW()) Elapsed_Time_in_Days_Student_Created,
                student_status.name Student_Status, 
                course.course_name Application_Course_Name, 
                provider.provider_name Application_Institution_Name, 
                -- Application_Immediate_Prior_Status (do on code)
                course_application.date_created Date_Application_Created, 
                timestampdiff(DAY, course_application.date_created, NOW()) Elapsed_Time_in_Days_Date_of_Application,
                course_application_status.label Application_Current_Status, 
                course_application_latest_history.update_date Date_Change_of_Application_Status,
                CONCAT(course_application_latest_history_updated_by.firstname, ' ', course_application_latest_history_updated_by.lastname) Application_Status_Changed_By,
                student_application_latest_change_status_note.note Most_Recent_Application_Status_Change_Note,
                student_latest_note.note Most_Recent_Student_Note, 
                student_latest_note.date_created Date_of_Most_Recent_Note,
                CONCAT(student_latest_note_creator.firstname, ' ', student_latest_note_creator.lastname) Person_Who_Made_the_Note, 
                student_reassignment_latest_note.note Most_Recent_Counsellor_Change_Note, 
                student_reassignment_latest_note.date_created Date_of_Most_Recent_Counsellor_Change,
                CONCAT(student_reassignment_latest_note_creator.firstname, ' ', student_reassignment_latest_note_creator.lastname) Person_Who_Made_the_Counsellor_Change,
                student_grouped_files_passport_photo.grouped_files Student_Documents_Passport_Photo,
                student_grouped_files_passport_address.grouped_files Student_Documents_Passport_Address, 
                student_grouped_files_academic_records.grouped_files Student_Documents_Academic_Records, 
                student_grouped_files_agent_declaration.grouped_files Student_Documents_Agent_Declaration, 
                student_grouped_files_english_language_test_results.grouped_files Student_Documents_English_Language_Test, 
                student_grouped_files_esos_declaration.grouped_files Student_Documents_ESOS_Declaration, 
                student_grouped_files_proof_of_financial_capacity.grouped_files Student_Documents_Proof_Of_Financial_Capacity, 
                student_grouped_files_scanned_signature.grouped_files Student_Documents_Scanned_Signature, 
                student_grouped_files_financials.grouped_files Student_Documents_Financials, 
                student_grouped_files_prior_learning.grouped_files Student_Documents_Prior_Learning, 
                student_grouped_files_statement_of_purpose.grouped_files Student_Documents_Statement_of_Purpose, 
                student_grouped_files_scholarship_certificate.grouped_files Student_Documents_Scholarship_Certificate,      
                student_grouped_files_others.grouped_files Student_Documents_Others,
                fee.total_annual_fee Annual_Fee
            FROM user student 
                LEFT JOIN user_auth student_auth ON student.id = student_auth.user_id 
                LEFT JOIN country student_country ON student.country_id = student_country.id
                LEFT JOIN student_status ON student.student_status_id = student_status.id 
                LEFT JOIN student_agent ON student.id = student_agent.student_id 
                LEFT JOIN user agent ON student_agent.agent_id = agent.id 
                LEFT JOIN agency_location ON agent.location_id = agency_location.id 
                LEFT JOIN agency ON agency_location.agency_id = agency.id 
                LEFT JOIN course_application ON student.id = course_application.student_id 
                LEFT JOIN course ON course_application.course_id = course.course_id 
                LEFT JOIN provider ON course.provider_id = provider.provider_id 
                LEFT JOIN course_application_status ON course_application.course_application_status_id = course_application_status.id 
                LEFT JOIN  (
                    SELECT
                      fee.* 
                    FROM
                      ( 
                        SELECT 
                          fee.*, 
                          REPLACE(CONVERT(fee_year - YEAR(CURDATE()), CHAR), "-", "a") nearest_year 
                        FROM fee 
                        ORDER BY nearest_year ASC 
                      ) fee 
                    GROUP BY fee_course_id 
                  ) fee ON course.course_id = fee.fee_course_id

                -- course application status change history
                LEFT JOIN ( -- get latest application change history
                    SELECT * FROM (
                        SELECT 
                            * 
                        FROM course_application_history 
                        ORDER BY id DESC ) course_application_history GROUP BY course_application_id ) course_application_latest_history ON course_application.id = course_application_latest_history.course_application_id
                LEFT JOIN user course_application_latest_history_updated_by ON course_application_latest_history.updated_by_user_id = course_application_latest_history_updated_by.id
                
                -- student notes
                LEFT JOIN (
                    SELECT * FROM 
                    (
                        SELECT DISTINCT
                            student_note_course_application.course_application_id course_application_id,
                            student_note.* 
                                FROM student_note 
                                    INNER JOIN student_note_course_application ON student_note.id = student_note_course_application.student_note_id
                                    WHERE note like 'Status change from %'
                                    ORDER BY id DESC 
                    ) student_note_with_course_application GROUP BY student_note_with_course_application.course_application_id
                ) student_application_latest_change_status_note ON course_application.id = student_application_latest_change_status_note.course_application_id
                
                
                LEFT JOIN (  -- get latest student notes
                    SELECT * FROM (
                        SELECT * FROM student_note ORDER BY id DESC 
                    ) student_note GROUP BY student_id 
                ) student_latest_note ON student.id = student_latest_note.student_id
                
                -- student_latest_note_creator 
                LEFT JOIN user student_latest_note_creator ON student_latest_note.created_by_user_id = student_latest_note_creator.id
                
                LEFT JOIN ( -- get latest reassign counsellor notes
                    SELECT * 
                        FROM ( -- set order
                            SELECT * 
                                FROM student_note 
                                WHERE note LIKE '%re-assigned student from%' 
                                ORDER BY id DESC
                        ) student_note GROUP BY student_note.student_id    
                ) student_reassignment_latest_note ON student.id = student_reassignment_latest_note.student_id
                
                LEFT JOIN user student_reassignment_latest_note_creator ON student_reassignment_latest_note.created_by_user_id = student_reassignment_latest_note_creator.id
                
                -- Documents
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_passport_photo ON student.id = student_grouped_files_passport_photo.student_id AND student_grouped_files_passport_photo.student_file_type_id = 1
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_passport_address ON student.id = student_grouped_files_passport_address.student_id AND student_grouped_files_passport_address.student_file_type_id = 2
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_others ON student.id = student_grouped_files_others.student_id AND student_grouped_files_others.student_file_type_id =  3     
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_academic_records ON student.id = student_grouped_files_academic_records.student_id AND student_grouped_files_academic_records.student_file_type_id = 4   
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_agent_declaration ON student.id = student_grouped_files_agent_declaration.student_id AND student_grouped_files_agent_declaration.student_file_type_id = 5
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_english_language_test_results ON student.id = student_grouped_files_english_language_test_results.student_id AND student_grouped_files_english_language_test_results.student_file_type_id = 6
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_esos_declaration ON student.id = student_grouped_files_esos_declaration.student_id AND student_grouped_files_esos_declaration.student_file_type_id = 7
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_proof_of_financial_capacity ON student.id = student_grouped_files_proof_of_financial_capacity.student_id AND student_grouped_files_proof_of_financial_capacity.student_file_type_id = 8
                
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_scanned_signature ON student.id = student_grouped_files_scanned_signature.student_id AND student_grouped_files_scanned_signature.student_file_type_id = 9
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_financials ON student.id = student_grouped_files_financials.student_id AND student_grouped_files_financials.student_file_type_id = 10
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_prior_learning ON student.id = student_grouped_files_prior_learning.student_id AND student_grouped_files_prior_learning.student_file_type_id = 11
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_statement_of_purpose ON student.id = student_grouped_files_statement_of_purpose.student_id AND student_grouped_files_statement_of_purpose.student_file_type_id = 12
                
                LEFT JOIN (
                    SELECT 
                        student_id, 
                        student_file_type_id, 
                        GROUP_CONCAT(DISTINCT student_file.filename SEPARATOR ' | ') grouped_files 
                    FROM student_file 
                    WHERE deleted is false 
                    GROUP BY student_id
                ) student_grouped_files_scholarship_certificate ON student.id = student_grouped_files_scholarship_certificate.student_id AND student_grouped_files_scholarship_certificate.student_file_type_id = 13    
                
            WHERE 
                student.role_id = 2 -- should only be students
                AND student.deleted = 0 
                AND ( student_auth.id IS NULL || student_auth.created_from IN (1,2) ) -- user created in studylane or gsp
                
            ORDER BY student.date_created DESC

            `;

            connection.query(sql, [], (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });
        });
    });
}

/**
 * 
 * @param {*} connection 
 */
function getAllIntakesReport() {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            let sql = `
                SELECT DISTINCT 
                    student.firstname Student_First_Name, 
                    student.lastname Student_Last_Name, 
                    IFNULL(student_address_country.name, student_country.name) Student_Country, 
                    course.course_name Course_Name, 
                    course_application.preferred_intake Preferred_Intake_Date, 
                    provider.provider_name Institution_Name, 
                    course_application_status.name Application_Status, 
                    counsellor.firstname Counsellor_First_Name, 
                    counsellor.lastname Counsellor_Last_Name, 
                    agency.name Agency
                FROM course_application 
                    INNER JOIN user student ON course_application.student_id = student.id 
                    INNER JOIN course ON course_application.course_id = course.course_id 
                    INNER JOIN provider ON course.provider_id = provider.provider_id 
                    INNER JOIN student_agent ON student.id = student_agent.student_id 
                    INNER JOIN user counsellor ON student_agent.agent_id = counsellor.id 
                    INNER JOIN agency ON counsellor.agency_id = agency.id
                    LEFT JOIN course_application_status ON course_application.course_application_status_id = course_application_status.id 
                    LEFT JOIN country student_country ON student.country_id = student_country.id 
                    LEFT JOIN user_address student_address ON student.id = student_address.user_id 
                    LEFT JOIN country student_address_country  ON student_address.country_id = student_address_country.id 
                    LEFT JOIN user_auth ON student.id = user_auth.user_id 
                WHERE 
                    student.deleted IS FALSE && course_application.active = 1 && 
                    ( user_auth.created_from is NULL || user_auth.created_from IN (1, 2) )
                ORDER BY course_application.preferred_intake DESC        
                `;
            connection.query(sql, [], (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });
        });
    });
}



function getStudentLatestChangesApplicationWeeklyPotentialInvoice() {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            let sql = `
                SELECT
                    student_first_name,
                    student_last_name,
                    student_country,
                    institution,
                    course,
                    expected_commencement_date,
                    previous_application_status,
                    current_application_status,
                    date_changed_to_current_status,
                    agency_name,
                    counsellor_name
                    FROM  (
                        SELECT  DISTINCT
                            student.firstname AS student_first_name,
                            student.lastname AS student_last_name,
                            country.name AS student_country,
                            provider.provider_name AS institution,
                            course.course_name AS course,
                            DATE_FORMAT(course_application.preferred_intake, "%M %d %Y")AS expected_commencement_date,
                
                           (
                                SELECT DISTINCT 
									prev_course_application_status.label
								FROM course_application_history AS prev_course_application_history
                                LEFT JOIN course_application_status AS prev_course_application_status ON prev_course_application_status.id = prev_course_application_history.course_application_status_id
								WHERE prev_course_application_history.course_application_id = course_application.id AND prev_course_application_history.update_date < current_course_status.update_date
                                ORDER BY update_date DESC LIMIT 1
                           ) AS previous_application_status,
                
                            course_application_status.label AS current_application_status,
                            DATE_FORMAT(current_course_status.update_date, "%M %d %Y") AS date_changed_to_current_status,
                            agency.name AS agency_name,
                            CONCAT(counsellor.firstname, ' ', counsellor.lastname )AS counsellor_name,
                            current_course_status.update_date AS update_date,
                            current_course_status.course_application_id
                        FROM course_application_history AS current_course_status
                        LEFT JOIN course_application ON current_course_status.course_application_id = course_application.id
                        LEFT JOIN user AS student ON course_application.student_id = student.id
                        LEFT JOIN user AS counsellor ON course_application.agent_id = counsellor.id
                        LEFT JOIN country ON country.id = student.country_id
                        LEFT JOIN agency ON agency.id = counsellor.agency_id
                        LEFT JOIN course ON course.course_id = course_application.course_id
                        LEFT JOIN provider ON provider.provider_id = course.provider_id
                        LEFT JOIN course_application_status ON course_application_status.id = current_course_status.course_application_status_id
                        WHERE current_course_status.update_date > DATE( CURDATE() ) - INTERVAL 7 DAY
                        AND current_course_status.update_date < CURDATE()
                        AND current_course_status.course_application_status_id IN (6, 7, 8, 12)
                            -- Confirmation of Enrolment Issued 6 
                            -- Visa has been Applied For 7
                            -- Visa has been Issued 8
                            -- Study Commenced 12
                        ORDER BY update_date DESC
                ) student_info
                GROUP BY student_info.course_application_id;
            `;
            return connection.query(sql, [], (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });

        });
    });
}

function getCourseApplicationsWithoutInvoice(){
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            let sql = `
                SELECT 

                CONCAT(student.firstname,  " " ,student.lastname) Student_Name,
                provider.institution_trading_name Institution_Name, 
                course.course_name AS Course_Application,
                course_application_status.label AS Application_Status,
                IF(course.active ,'Yes','No') AS Course_Active
                
                FROM course_application 
                
                LEFT JOIN user AS student ON student.id = course_application.student_id
                LEFT JOIN course ON course.course_id = course_application.course_id
                LEFT JOIN course_application_status ON course_application_status.id = course_application.course_application_status_id
                LEFT JOIN provider ON provider.provider_id = course.provider_id
                
                WHERE course_application.student_id NOT IN (SELECT student_id FROM invoice_request_form)
                AND course_application.course_id NOT IN (SELECT course_id FROM invoice_request_form)
                AND course_application.course_application_status_id IN (4, 5, 6, 7, 8, 10, 11, 12)
                AND student.deleted = false;
            `;
            return connection.query(sql, [], (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });
        });
    });
}

/**
 * 
 */
async function getStudentsWithStudyCommencedCourseApplication() {
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            const sql = `
                SELECT DISTINCT 
                IFNULL(student.firstname, '') 'Student First Name',
                IFNULL(student.lastname, '') 'Student Last Name',
                IFNULL(student.email, '') 'Email',
                IFNULL(telephone.number, '') 'Contact No.',
                IFNULL(course.course_name, '') 'Course Name',
                IFNULL(provider.provider_name, '') 'Institution',                    
                IFNULL(campus.campus_name, '') 'Campus Name',
                IFNULL(campus_location_details.country_code, '') 'Campus Country',
                IFNULL(campus_location_details.state, '') 'Campus State',
                IFNULL(campus_location_details.city, '') 'Campus City',
                IFNULL(student_passport_detail.passport_nationality, '') 'Student Nationality',
                IFNULL(agency.name, '') 'Agency',
                IFNULL(CONCAT(agent.firstname, ' ', agent.lastname), '') 'Counsellor',
                IFNULL(latest_course_application_history_status.update_date, '') 'Date Status Changed to Study Commenced',
                IFNULL(course_application.preferred_intake, '') 'Expected Commencement Date',
                IF(course_application.active > 0, 'Yes', 'No')  'Course Active'
            FROM course_application 
                INNER JOIN (SELECT * 
                            FROM   (SELECT * 
                                    FROM   course_application_history 
                                    ORDER  BY update_date DESC) 
                                    ordered_course_application_history 
                            GROUP  BY course_application_id) 
                latest_course_application_history_status 
                        ON course_application.id = 
                            latest_course_application_history_status.course_application_id 
                            AND course_application.course_application_status_id = 
                latest_course_application_history_status.course_application_status_id 
                INNER JOIN user student 
                        ON course_application.student_id = student.id 
                INNER JOIN course 
                        ON course_application.course_id = course.course_id 
                INNER JOIN provider 
                        ON course.provider_id = provider.provider_id 
                INNER JOIN campus 
                        ON course_application.campus_id = campus.campus_id 
                INNER JOIN campus_location_details 
                        ON campus.campus_id = campus_location_details.campus_id 
                INNER JOIN student_agent 
                        ON course_application.student_id = student_agent.student_id 
                INNER JOIN user agent 
                        ON student_agent.agent_id = agent.id 
                INNER JOIN agency_location 
                        ON agent.location_id = agency_location.id 
                INNER JOIN agency 
                        ON agency_location.agency_id = agency.id 
                LEFT JOIN user_phone telephone 
                        ON student.id = telephone.user_id 
                            AND telephone.phone_type_id = 1 
                LEFT JOIN student_passport_detail 
                        ON student.id = student_passport_detail.student_id 
            WHERE  student.deleted IS FALSE 
                AND student.user_status_id = 1 
                AND course_application.course_application_status_id = 14 
                AND ( latest_course_application_history_status.update_date >= 
                        '2018-01-01 00:00:00' 
                        OR course_application.preferred_intake >= '2018-01-01 00:00:00' )
            `;

            return connection.query(sql, [], (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });
        });
    });
}


function getLatestStudentsWithOrWithoutCourseApplicationFromSundayToSaturday() {
    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            var params = [];

            var sql = `
            SELECT DISTINCT 
                CONCAT(student.firstname, " ", student.lastname) Student_Name, 
                country.name Student_Country, 
                course.course_name Applied_Course_Name, 
                provider.institution_trading_name Applied_Institution_Name, 
                course_application.date_created Date_of_Application, 
                agency.name agency_name, 
                CONCAT(agent.firstname, " ", agent.lastname) Agent_Name,
                course_application.preferred_intake expected_commencement_date,
                fee.total_annual_fee
            FROM user student 
                LEFT JOIN user_auth student_auth ON student.id = student_auth.user_id
                LEFT JOIN student_agent ON student.id = student_agent.student_id
                LEFT JOIN user agent ON student_agent.agent_id = agent.id 
                LEFT JOIN course_application ON student.id = course_application.student_id
                LEFT JOIN course ON course_application.course_id = course.course_id 
                LEFT JOIN provider ON course.provider_id = provider.provider_id 
                LEFT JOIN agency ON agent.agency_id = agency.id  
                LEFT JOIN country ON student.country_id = country.id 
                LEFT JOIN  (
                    SELECT
                      fee.* 
                    FROM
                      ( 
                        SELECT 
                          fee.*, 
                          REPLACE(CONVERT(fee_year - YEAR(CURDATE()), CHAR), "-", "a") nearest_year 
                        FROM fee 
                        ORDER BY nearest_year ASC 
                      ) fee 
                    GROUP BY fee_course_id 
                  ) fee ON course.course_id = fee.fee_course_id

            WHERE 
                student.role_id = 2 

                -- should be created either on studylane or gsp
                AND ( student_auth.created_from is NULL || student_auth.created_from IN (1,2) )
                
                AND ( 
                    ( course_application.date_created >= timestampadd(day, -8, now()) AND  course_application.date_created <= timestampadd(day, -2, now()) )
                    || 
                    ( FROM_UNIXTIME(student.date_created/1000) >= timestampadd(day, -8, now()) AND FROM_UNIXTIME(student.date_created/1000) <= timestampadd(day, -2, now()) )
                ) 
                `;

        

            sql += ' ORDER BY course_application.date_created, student.date_created DESC';
            return connection.query(sql, params, (err, resultSet) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });

        });

    });
}
