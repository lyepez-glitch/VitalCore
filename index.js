const sequelize = require('./models/db');
const Cell = require('./models/cell');
const Gene = require('./models/gene');
const LifeFactor = require('./models/lifeFactor');
const mysql = require("mysql2");
const cors = require("cors");
// Import required modules
const express = require('express');
const path = require('path');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
// Initialize the app
// Step 3: Define the GraphQL schema
const schema = buildSchema(`
    type Gene {
        id: ID!
        gene_name: String!
        mutation_rate: Float!
        impact_on_lifespan: Int
    }

    type Cell {
        id: ID!
        cell_type: String!
        age: Int!
        repair_rate: Float!
        mutation_rate: Float!
        lifespan: Int!
    }

    type LifeFactor {
        id: ID!
        factor_name: String!
        factor_impact: Float!
        lifespan_change: Int
    }

    type Query {
        getGenes: [Gene]
        getGeneById(id: ID!): Gene
        getCells: [Cell]
        getLifeFactors: [LifeFactor]
    }

    type Mutation {
        addGene(gene_name: String!, mutation_rate: Float!, impact_on_lifespan: Int): Gene
        modifyGeneActivity(id: String!, impact_on_lifespan: Int!): Gene
    }
`);


// // Step 4: Create an in-memory database (just for simplicity)
// let genes = [
//     { id: "1", name: "Gene A", impact_on_lifespan: 0.1 },
//     { id: "2", name: "Gene B", impact_on_lifespan: 0.2 },
// ];

// Step 5: Define resolvers
const root = {
    getGenes: async() => {
        return await Gene.findAll(); // Fetch all genes from the database
    },
    getGeneById: async({ id }) => {
        return await Gene.findByPk(id); // Fetch a specific gene by ID
    },
    getCells: async() => {
        return await Cell.findAll(); // Fetch all cells from the database
    },
    getLifeFactors: async() => {
        return await LifeFactor.findAll(); // Fetch all life factors
    },
    addGene: async({ gene_name, mutation_rate, impact_on_lifespan }) => {
        return await Gene.create({ gene_name, mutation_rate, impact_on_lifespan }); // Create a new gene
    },
    modifyGeneActivity: async({ id, impact_on_lifespan }) => {
        const gene = await Gene.findByPk(id); // Find the gene by ID
        if (!gene) throw new Error("Gene not found");
        gene.impact_on_lifespan = impact_on_lifespan; // Update the gene's impact on lifespan
        await gene.save(); // Save changes
        return gene;
    },
};

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
}));

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true, // Enables the GraphiQL UI
    })
);

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

app.get("/genes", async(req, res) => {
    try {
        const query = "SELECT * FROM Genes"; // Adjust query to match your table structure
        const [results] = await sequelize.query(query); // Use Sequelize's query method

        // Map the results to extract the 'lifespan' field


        // Send the data as a JSON response
        res.json({ genes: results });
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