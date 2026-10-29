const express = require('express');
const contractRouter = require('./routes/contractRoute');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/contract', contractRouter);

// 404 for anything unmatched
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;