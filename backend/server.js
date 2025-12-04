const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Test endpoint
app.get('/api/hello', (req, res) => {
    console.log('Received request:', req.query);
    res.send(`Hello ${req.query.name || 'World'}!`);
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', error);
    }
});
