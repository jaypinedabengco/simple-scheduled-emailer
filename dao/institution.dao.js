var database = require('../provider/mysql.connection');

exports.getInstitutionList = getInstitutionList;

////


/**
 * 
 */
function getInstitutionList(){
    return new Promise((resolve, reject) => {
        database.getConnection((err, connection) => {
            if ( err ){
                return reject(err);
            }

            var params = [];
            var sql = `
                SELECT DISTINCT 
                    provider.provider_id 'Provider_ID', 
                    institution.id 'Institution_ID',
                    institution.name 'Institution_Name', 
                    institution_address.state 'State',
                    institution_address.city 'City',
                    country.name AS 'Country',
                    provider.provider_type 'Provider_Type',
                    institution_grouping.label 'Group',
                    institution_engagement_status.label 'Engagement_Status',
                    DATE_FORMAT(institution_agreement.start_date_agreement, "%M %d, %Y") AS 'Start_Date',
                    DATE_FORMAT(institution_agreement.end_date_agreement, "%M %d, %Y") AS 'End_Date',
                    DATE_FORMAT(IF(institution_institution_engagement_status.date_modified IS NULL, institution_institution_engagement_status.date_created, institution_institution_engagement_status.date_modified), "%M %d, %Y") 'Date_Status_Changed',
                    IF(institution.is_direct IS NULL, '', IF(institution.is_direct, 'Direct', 'Indirect')) 'Direct_Agreement',
                    (
                        SELECT IF(count(*) = 0, 'Global', 'Not Global') FROM provider_territory_rules WHERE provider_id = institution_provider.provider_id
                    ) 'Territory',
                    CONCAT(created_by.firstname, ' ',created_by.lastname) 'Created_By' ,
                    DATE_FORMAT(institution.date_created, "%M %d, %Y") AS 'Date_Created',
                    CONCAT(modified_by.firstname, ' ',modified_by.lastname) 'Modified_By' ,
                    DATE_FORMAT(institution.date_modified, "%M %d, %Y") AS 'Date_Modified'
                    
                    
                FROM institution
                    LEFT JOIN institution_provider ON institution_provider.institution_id = institution.id
                    LEFT JOIN provider ON institution_provider.provider_id = provider.provider_id
                    LEFT JOIN institution_address ON institution_address.institution_id = institution.id
                    LEFT JOIN country ON country.id = institution_address.country_id
                    LEFT JOIN institution_institution_grouping ON institution_institution_grouping.institution_id = institution.id
                    LEFT JOIN institution_grouping ON institution_grouping.id = institution_institution_grouping.institution_grouping_id
                    LEFT JOIN institution_institution_engagement_status ON  institution_institution_engagement_status.institution_id = institution.id
                    LEFT JOIN institution_engagement_status ON  institution_engagement_status.id = institution_institution_engagement_status.institution_engagement_status_id
                    LEFT JOIN institution_agreement ON institution_agreement.institution_id = institution.id
                    LEFT JOIN user as created_by ON created_by.id = institution.created_by
                    LEFT JOIN user as modified_by ON modified_by.id = institution.modified_by
                WHERE institution.is_deleted = 0
                ORDER BY institution.name ASC;
            `;
            
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