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
                sql += '    agency_principal_contact_salutation.name Principal_Contact_Title, ';
                sql += '    agency_principal_contact.firstname Principal_Contact_Firstname, ';
                sql += '    agency_principal_contact.lastname Principal_Contact_Lastname, ';
                sql += '    primary_contact_salutation.name Head_Office_Contact_Title, ';
                sql += '    primary_contact.firstname Head_Office_Contact_Firstname , ';
                sql += '    primary_contact.lastname Head_Office_Contact_Lastname, ';
                sql += '    agency.email Head_Office_Contact_Email ';

                sql += ' FROM agency ';

                sql += '    LEFT JOIN agency_address ON agency.id = agency_address.agency_id        ';
                sql += '    LEFT JOIN country ON agency_address.country_id = country.id        ';
                sql += '    LEFT JOIN agency_principal_contact ON agency.id = agency_principal_contact.agency_id       ';
                sql += '    LEFT JOIN salutation agency_principal_contact_salutation ON agency_principal_contact.salutation_id = agency_principal_contact_salutation.id     ';
                sql += '    LEFT JOIN primary_contact ON agency.id = primary_contact.agency_id        ';
                sql += '    LEFT JOIN salutation primary_contact_salutation ON primary_contact.salutation_id = primary_contact_salutation.id     ';
                sql += '    LEFT JOIN agency_status_history ON agency.agency_status_id = agency_status_history.agency_status_id AND agency.id = agency_status_history.agency_id     ';

                sql += ' WHERE agency.agency_status_id = 2 AND agency.deleted is false        ';
                sql += ' ORDER BY agency_status_history.update_date DESC        ';
            
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