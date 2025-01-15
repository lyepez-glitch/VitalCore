require('dotenv').config();
const { ENDPOINT, PORT, USERNAME, PASSWORD, HOST } = process.env;
console.log('process env ' + ENDPOINT + ' ' + ' ' + PORT + ' ' + USERNAME + ' ' + PASSWORD)
const { Sequelize } = require('sequelize');

// Create a Sequelize instance and connect to the database
const sequelize = new Sequelize('vitalsource', USERNAME, PASSWORD, {
    host: HOST, // Your RDS endpoint
    dialect: 'mysql', // Specify MySQL dialect
    port: PORT, // MySQL port
    logging: false, // Optional: Disable logging for cleaner output
});

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate(); // Attempt to authenticate with the database
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

module.exports = sequelize;