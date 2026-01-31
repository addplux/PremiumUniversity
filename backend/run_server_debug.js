const { spawn } = require('child_process');
const fs = require('fs');

console.log('Spawning server...');
const server = spawn('node', ['server.js']);

const logStream = fs.createWriteStream('server_debug.log');

server.stdout.on('data', (data) => {
    process.stdout.write(data);
    logStream.write(data);
});

server.stderr.on('data', (data) => {
    process.stderr.write(data);
    logStream.write(data);
});

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    logStream.write(`\nEXIT CODE: ${code}\n`);
    logStream.end();
});
