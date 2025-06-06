require('dotenv').config();
const sequelize = require('./models/db');
const Cell = require('./models/cell');
const Gene = require('./models/gene');
const LifeFactor = require('./models/lifeFactor');
const mysql = require("mysql2");
// Import required modules
const express = require('express');
const app = express();
const path = require('path');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
console.log(process.env.FRONTEND_URL);
const corsOptions = {

    origin: [
        process.env.FRONTEND_URL
    ],
    // Allow only this origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers

    optionsSuccessStatus: 204, // Status for preflight requests
};

app.use(cors(corsOptions));


const { join } = require('node:path');
const http = require('http');
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL
        ]
    }
});
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('lifespanUpdated', (data) => {
        socket.broadcast.emit('lifespanUpdated', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});






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
    addGene: async({ gene_name, mutation_rate, impact_on_lifespan }, context) => {
        const { socket } = context; // Extract socket from context
        if (!socket) {
            throw new Error("Socket instance is missing");
        }

        const gene = await Gene.create({ gene_name, mutation_rate, impact_on_lifespan }); // Create a new gene
        socket.emit('geneAdded', gene);
        return gene
    },
    modifyGeneActivity: async({ id, impact_on_lifespan }, context) => {
        const gene = await Gene.findByPk(id); // Find the gene by ID
        if (!gene) throw new Error("Gene not found");
        gene.impact_on_lifespan = impact_on_lifespan; // Update the gene's impact on lifespan
        const { socket } = context; // Extract socket from context
        if (!socket) {
            throw new Error("Socket instance is missing");
        }
        socket.emit('geneModified', gene);
        await gene.save(); // Save changes
        return gene;
    },
};

app.use(
    "/graphql",
    graphqlHTTP((req, res) => ({
        schema: schema,
        rootValue: root,
        graphiql: true,
        context: { socket: io }, // Pass the socket instance here
    }))
);














const PORT = process.env.PORT || 8080;

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

        await Cell.create({
            cell_type: 'test',
            age: 7,
            repair_rate: 0.100,
            mutation_rate: 0.02,
            lifespan: 200,
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
        console.error('Error initializing the app:');
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
app.post('/signup', async(req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: 'Failed to sign up' });
    }
});

app.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {

        res.status(500).json({ error: 'Failed to log in' });
    }
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
        console.error("Error fetching data:");
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
        console.error("Error fetching data:");
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
        console.error("Error fetching data:");
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
        // Emit an event to clients after updating data
        io.emit('lifespanUpdated', lifespan); // This sends data to all connected clients
        res.status(200).json({ message: "Lifespan data updated successfully" });
    } catch (error) {
        console.error("Error updating lifespan:");
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
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});