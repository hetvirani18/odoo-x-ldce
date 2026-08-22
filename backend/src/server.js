const app = require('./app');
const { PORT } = require('./config/env');
const { connectToDatabase } = require('./database/db');

async function start() {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`GlobeTrotter API listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
