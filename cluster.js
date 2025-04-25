const cluster = require('node:cluster');
const os = require('node:os');
const express = require('express');

cluster.schedulingPolicy = cluster.SCHED_RR; // Use round-robin scheduling

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master Process ID: ${process.pid}`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code) => {
        if (code !== 0 && !worker.exitedAfterDisconnected) {
            console.log(`Worker ${worker.process.pid} exited. Spawning a new worker.`);
            cluster.fork();
        }
    });
} else {
    console.log(`Worker Process ID: ${process.pid}`);
    const app = express();

    // Home Route
    app.get('/', (req, res) => {
        res.status(200).send(`Home page, Process ID: ${process.pid}`);
    });

    // Slow Page Route
    app.get('/slow-page', (req, res) => {
        for (let i = 0; i < 6000000000000000000000; i++) {} // Simulate heavy computation
        res.status(200).send(`Slow page, Process ID: ${process.pid}`);
    });

    // Start the server
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
