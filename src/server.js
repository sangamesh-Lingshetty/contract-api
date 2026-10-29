require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Contract API running on port ${PORT}`));

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err.message));