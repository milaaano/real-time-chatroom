//index.js file - Server Side Code

import * as http from 'http';
import * as fs from 'fs';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(__dirname + '/index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/style.css') {
        fs.readFile(__dirname + '/style.css', (err, css) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading style.css');
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(css);
        });
    } else if (req.url === '/message.css') {
        fs.readFile(__dirname + '/message.css', (err, css) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading message.css');
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(css);
        });
    }

});

const io = new Server(server);
const port = 4000;

io.on('connection', async (socket) => {
    try {
        const query = {
            text: 'SELECT name, message, timestamp, socket_id FROM messages',
        }
        const res = await pool.query(query);
        socket.emit('send history', res.rows);
    } catch (err) {
        console.error("Error fetchig history:", err);
    }

    socket.on('send message', async (msg) => {
        const entry = {name: msg.name, message: msg.message, timestamp: new Date(), socket_id: socket.id };
        console.log(msg);
        try {
            const query = {
                text: 'INSERT INTO messages (name, message, timestamp ,socket_id) VALUES($1, $2, $3, $4)',
                values: [msg.name, msg.message, entry.timestamp, socket.id],
            }
            await pool.query(query);
            console.log("Message saved to DB");
        } catch (err) {
            console.error("Error inserting message: ", err);
        }

        io.emit('send message', entry);
    });
});

const shutdown = async (code = 0) => {
    try {
        console.log('\nShutting down...');
        await io.close();
        await pool.end();
        console.log("Cleanup complete.");
    } catch (err) {
        console.error("Error during shutdown:", err);
    } finally {
        process.exit(code);
    }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("unhandledRejection", (err) => {console.error(err); shutdown(1); });
process.on("uncaughtException", (err) => {console.error(err); shutdown(1); });

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});