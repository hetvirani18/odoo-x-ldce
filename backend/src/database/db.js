const mysql = require('mysql2/promise');
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = require('../config/env');

const db = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function connectToDatabase() {
    const connection = await db.getConnection();
    connection.release();
    console.log(`Connected to MySQL database "${DB_NAME}"`);
}

db.connectToDatabase = connectToDatabase;
db.db = db;

module.exports = db;
