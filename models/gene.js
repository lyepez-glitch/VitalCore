const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Import the sequelize instance from db.js

// Define the 'Gene' model
const Gene = sequelize.define('Gene', {
    gene_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mutation_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    impact_on_lifespan: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

// Export the model for use in other files
module.exports = Gene;