// Vercel Serverless Function entry point
const app = require('../backend/server.js');

// Ensure the app handles paths correctly
// When Vercel hits /api/auth/login, it passes it to this function.
// The backend/server.js expects the path with /api prefix.
module.exports = app;
