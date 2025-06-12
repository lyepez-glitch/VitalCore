# VitalSource Backend

Backend service powering the VitalSource simulation platform, enabling users to explore how genes, cells, and life factors influence aging and lifespan. Built with **Node.js**, **Express**, **Sequelize**, **GraphQL**, and **Socket.IO**.

## ⚙️ Features

- 🧬 **GraphQL API** to fetch and mutate genes, cells, and life factors
- 🔐 **User authentication** with JWT (signup & login)
- 🔁 **Real-time updates** using Socket.IO
- 💾 **MySQL database** integration using Sequelize ORM
- 📊 Support for live simulation data updates (e.g. changing lifespan)
- 🛡️ CORS configuration and .env-based config for secure deployment

---

## 📦 Tech Stack

- **Backend**: Node.js, Express
- **GraphQL**: express-graphql, graphql
- **Database**: MySQL + Sequelize ORM
- **Authentication**: bcryptjs + jsonwebtoken
- **Real-Time**: Socket.IO
- **Environment Config**: dotenv

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/vitalsource-backend.git
cd vitalsource-backend
2. Install dependencies

npm install
3. Setup .env file
Create a .env file in the root directory with the following:


FRONTEND_URL=http://localhost:3000
PORT=8080
DATABASE=your_mysql_db
USERNAME=your_mysql_user
PASSWORD=your_mysql_pass
HOST=localhost
JWT_SECRET=your_secret
4. Start the server

npm start

🧪 API Endpoints
GraphQL
Access via: http://localhost:8080/graphql

Supports queries and mutations for:

Gene

Cell

LifeFactor

REST
Method	Endpoint	Description
POST	/signup	Register a new user
POST	/login	Login and receive JWT
GET	/cells	Fetch only cell lifespan values
GET	/cellss	Fetch full cell data
GET	/genes	Fetch all genes
PUT	/cells	Update lifespans & broadcast via socket

📡 Socket.IO Events
Event Name	Description
lifespanUpdated	Emitted when cell lifespan is updated
geneAdded	Emitted when a new gene is added
geneModified	Emitted when a gene’s lifespan impact is changed

🧬 Seeded Test Data (on startup)
Automatically creates:

2 sample Cells

1 Gene named GeneA

1 LifeFactor called Radiation

📁 Project Structure
bash
Copy
Edit
├── models/           # Sequelize models (Gene, Cell, User, LifeFactor)
├── public/           # Static assets
├── db.js             # Sequelize DB connection
├── index.js          # Main server file
├── .env              # Environment config
└── package.json
⚖️ License
ISC












