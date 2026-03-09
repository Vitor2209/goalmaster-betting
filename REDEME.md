⚽ GoalMaster

GoalMaster is a virtual football betting platform built for learning and development purposes. Users can place bets using virtual coins on football matches and compete in a leaderboard.

This project is designed to simulate the core mechanics of a sports betting system while focusing on backend architecture, APIs, and scalable system design.

The platform does not involve real money.

🚀 Project Purpose

The goal of this project is to practice building a real-world backend system that includes:

Authentication

User management

Match data

Betting logic

Leaderboards

API architecture

It is also intended to serve as a portfolio project demonstrating full-stack development skills.

🧠 Core Features

User registration and authentication

Virtual coin balance system

Football match listing

Betting system

Bet history tracking

Leaderboard ranking users by coins

REST API for frontend integration

🏗 Project Architecture

The backend follows a modular architecture separating responsibilities into different layers.

src 
│ 
├── controllers 
├── routes 
├── services 
├── models 
├── middleware 
├── config 
├── utils 
└── server.js Controllers

Handle incoming HTTP requests and responses.

Routes

Define API endpoints.

Services

Contain the main business logic.

Models

Represent database entities.

Middleware

Authentication and error handling.

Config

Configuration files such as database connections.

Utils

Utility functions like odds calculations.

⚙️ Tech Stack

Backend:

Node.js

Express.js

PostgreSQL (planned)

JWT Authentication

bcrypt

Frontend (planned):

Modern frontend framework (React / Next.js or similar)

🔌 API Overview Authentication POST /api/auth/register POST /api/auth/login GET /api/user Matches GET /api/matches GET /api/matches/live GET /api/matches/:id Bets POST /api/bets GET /api/bets/history Leaderboard GET /api/leaderboard 💰 Betting Flow

User registers an account

The user receives virtual coins

Matches are fetched from the API

The user selects a bet

The system calculates potential winnings

After the match ends, the system updates results and rewards winners

📦 Installation

Clone the repository:

git clone https://github.com/yourusername/goalmaster.git

Install dependencies:

npm install

Run the development server:

npm run dev 🔐 Environment Variables

Create a .env file in the root directory:

PORT=3000 JWT_SECRET=your_secret_key DATABASE_URL=your_database_connection 📈 Future Improvements

Live match updates

Real football API integration

Odds calculation engine

Advanced statistics

Admin dashboard

Real-time betting with WebSockets

⚠️ Disclaimer

This project is for educational purposes only and does not support real money betting.

👨‍💻 Author

Vitor Dutra Melo

Software development student building projects focused on backend systems and web applications.