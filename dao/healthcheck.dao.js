var database = require('./../provider/mysql.connection');

exports.isDBWorking = isDBWorking;

////

/**
 * If days not provided, then return all
 * @param {*} days 
 */
function isDBWorking(days){
    return new Promise((resolve, reject) => {

        database.getConnection((err, connection) => {
            if ( err ){
                return reject(err);
            }

            var sql = 'SELECT 1 + 1 ';
            
            connection.query(sql, [], (err, result_set) => {
                if ( err ){
                    connection.release();
                    return reject(err);
                }
                connection.release();
                return resolve(result_set);
            });

        });

    });

}