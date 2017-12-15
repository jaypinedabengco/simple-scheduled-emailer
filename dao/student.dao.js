var database = require('./../provider/mysql.connection');

exports.getLatestStudentCourseApplication = getLatestStudentCourseApplication;
exports.getLatestStudentsWithOrWithoutCourseApplication = getLatestStudentsWithOrWithoutCourseApplication;

////

function getLatestStudentsWithOrWithoutCourseApplication(hours){
    return new Promise((resolve, reject) => {
        
        database.getConnection((err, connection) => {
            if ( err ){
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
                    CONCAT(agent.firstname, " ", agent.lastname) Agent_Name
                FROM user student 
                    LEFT JOIN student_agent ON student.id = student_agent.student_id
                    LEFT JOIN user agent ON student_agent.agent_id = agent.id 
                    LEFT JOIN course_application ON student.id = course_application.student_id
                    LEFT JOIN course ON course_application.course_id = course.course_id 
                    LEFT JOIN provider ON course.provider_id = provider.provider_id 
                    LEFT JOIN agency ON agent.agency_id = agency.id  
                    LEFT JOIN country ON student.country_id = country.id 

                WHERE 
            `;

            if ( hours > 0 ){
                sql += `
                    course_application.date_created > timestampadd(day, -?, now()) 
                    || FROM_UNIXTIME(student.date_created/1000) >  timestampadd(day, -?, now())                 
                `;
                params.push(hours);
                params.push(hours);
            }

            sql += ' ORDER BY course_application.date_created, student.date_created DESC';
            
            return connection.query(sql, params, (err, resultSet) => {
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

/**
 * If hours not provided, then return all
 * @param {*} hours 
 */
function getLatestStudentCourseApplication(hours){
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

                if ( hours > 0 ){
                    sql += ' WHERE course_application.date_created > timestampadd(hour, -?, now()) ';
                    params.push(hours);
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