const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Import the sequelize instance from db.js

// Define the 'Cell' model
const Cell = sequelize.define('Cell', {
    cell_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    repair_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    mutation_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    lifespan: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// Export the model for use in other files
module.exports = Cell;