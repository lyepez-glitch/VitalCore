const sequelize = require('./models/db');
const Cell = require('./models/cell');
const Gene = require('./models/gene');
const LifeFactor = require('./models/lifeFactor');
const mysql = require("mysql2");
const cors = require("cors");
// Import required modules
const express = require('express');
const path = require('path');

// Initialize the app
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
}));
const PORT = process.env.PORT || 3000;
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


// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up a basic route
app.get('/', (req, res) => {
    res.send('Welcome to your Express app!');
});
// Define an API route to fetch cells
// Define an API route to fetch cells
app.get("/cells", async(req, res) => {
    try {
        const query = "SELECT lifespan FROM Cells"; // Adjust query to match your table structure
        const [results] = await sequelize.query(query); // Use Sequelize's query method

        // Map the results to extract the 'lifespan' field
        const lifespanData = results.map((row) => row.lifespan);

        // Send the data as a JSON response
        res.json({ lifespan: lifespanData });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get("/cellss", async(req, res) => {
    try {
        const query = "SELECT * FROM Cells"; // Adjust query to match your table structure
        const [results] = await sequelize.query(query); // Use Sequelize's query method

        // Map the results to extract the 'lifespan' field


        // Send the data as a JSON response
        res.json({ cells: results });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.put("/cells", async(req, res) => {
    const { lifespan } = req.body; // Get the lifespan data from the request body

    if (!Array.isArray(lifespan)) {
        return res.status(400).json({ error: "Invalid lifespan data" });
    }

    try {
        // Assuming that the lifespan array matches the order of the cells
        for (let i = 0; i < lifespan.length; i++) {
            const currentLifespan = lifespan[i];
            const cellId = i + 1; // Assuming you know the ID or use an index for each cell

            // Update each cell individually
            await sequelize.query(
                "UPDATE Cells SET lifespan = :lifespan WHERE id = :id", {
                    replacements: { lifespan: currentLifespan, id: cellId },
                    type: sequelize.QueryTypes.UPDATE,
                }
            );
        }

        res.status(200).json({ message: "Lifespan data updated successfully" });
    } catch (error) {
        console.error("Error updating lifespan:", error);
        res.status(500).json({ error: "Failed to update lifespan data" });
    }
});


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send('404 - Page Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});