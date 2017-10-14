var database = require('./../provider/mysql.connection');

exports.getLatestStudentCourseApplication = getLatestStudentCourseApplication;

////

/**
 * If days not provided, then return all
 * @param {*} days 
 */
function getLatestStudentCourseApplication(days){
    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if ( err ){
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

                if ( days > 0 ){
                    sql += ' WHERE course_application.date_created > timestampadd(day, -?, now()) ';
                    params.push(days);
                }

                sql += ' ORDER BY  course_application.date_created DESC';
            
            connection.query(sql, params, (err, resultSet) => {
                if ( err ){
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(resultSet);
            });

        });

    });

}