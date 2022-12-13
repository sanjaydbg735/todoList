const mysql = require('mysql');
// create connection
const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1234567890',
    database: 'TODO'

});

db.connect( (err) => {
    if(err){
        throw err;
    }
    console.log('Mysql Conneted...');
});
module.exports = db;