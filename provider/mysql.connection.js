var mysql = require('mysql');
var config = require('./../configuration');

var pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    acquireTimeout : (50 * 10000),
    connectTimeout : (50 * 10000)    
});

/**
 * 
 * @param {*} callback 
 */
function getConnection(callback){
    return pool.getConnection(callback);
}

module.exports.getConnection = getConnection;