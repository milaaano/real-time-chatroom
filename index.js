//index.js file - Server Side Code

const http = require('http');
const fs = require('fs');

let chat_history = [];

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

const io = require('socket.io')(server);
const port = 4000;

io.on('connection', (socket) => {
    socket.emit('send history', chat_history);

    socket.on('send message', (msg) => {;
        const entry = {name: msg.name, message: msg.message, timestamp: new Date() };
        chat_history.push(entry);
        io.emit('send message', entry);
    });
});

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});