const sequelize = require('./models/db');
const Cell = require('./models/cell');
const Gene = require('./models/gene');
const LifeFactor = require('./models/lifeFactor');


// Sync models and check connection
async function initializeApp() {
    try {
        await sequelize.sync(); // Sync the models with the database
        console.log('Models synchronized successfully.');

        // Create some test records
        await Cell.create({
            cell_type: 'Muscle',
            age: 5,
            repair_rate: 0.95,
            mutation_rate: 0.02,
            lifespan: 100,
        });

        await Gene.create({
            gene_name: 'GeneA',
            mutation_rate: 0.1,
            impact_on_lifespan: 20,
        });

        await LifeFactor.create({
            factor_name: 'Radiation',
            factor_impact: 0.5,
            lifespan_change: -5,
        });

        console.log('Test records created.');
    } catch (error) {
        console.error('Error initializing the app:', error);
    }
}

initializeApp();