var database = require('./../provider/mysql.connection');

exports.getAllApprovedAgencies = getAllApprovedAgencies;

////

/**
 * 
 */
function getAllApprovedAgencies(){

    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if ( err ){
                return reject(err);
            }

            var params = [];
 
            var sql = 'SELECT DISTINCT ';
                sql += '    agency.name Company_Name, ';
                sql += '    country.name Head_Office_Address_Country, ';
                sql += '    primary_contact_salutation.name Head_Office_Contact_Title, ';
                sql += '    primary_contact.firstname Head_Office_Contact_Firstname , ';
                sql += '    primary_contact.lastname Head_Office_Contact_Lastname, ';
                sql += '    agency.email Head_Office_Contact_Email ';

                sql += ' FROM agency ';

                sql += '    LEFT JOIN agency_address ON agency.id = agency_address.agency_id        ';
                sql += '    LEFT JOIN country ON agency_address.country_id = country.id        ';
                sql += '    LEFT JOIN primary_contact ON agency.id = primary_contact.agency_id        ';
                sql += '    LEFT JOIN salutation primary_contact_salutation ON primary_contact.salutation_id = primary_contact_salutation.id     ';
                sql += '    LEFT JOIN agency_status_history ON agency.agency_status_id = agency_status_history.agency_status_id AND agency.id = agency_status_history.agency_id     ';
                sql += '    LEFT JOIN user agent ON agency.id = agent.agency_id ';
                sql += '    LEFT JOIN user_auth ON agent.id = user_auth.user_id ';

                sql += ' WHERE ';
                sql += '    agency.agency_status_id = 2 '; /* should be approved */
                sql += '    AND agency.deleted is false '; /* should not be deleted */
                sql += '    AND agency.id <> 10000 '; /* do not include virtual agency */
                sql += '    AND agent.role_id IN (3,4,5)  '; /* should be agent, master agent and location agent */
                sql += '    AND ( user_auth.created_from is NULL || user_auth.created_from IN (1, 2) )'; /* Studylane/GSP Only */
                
                sql += ' ORDER BY agency_status_history.update_date DESC ';
            
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