const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Import the sequelize instance from db.js

// Define the 'LifeFactor' model
const LifeFactor = sequelize.define('LifeFactor', {
    factor_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    factor_impact: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    lifespan_change: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

// Export the model for use in other files
module.exports = LifeFactor;