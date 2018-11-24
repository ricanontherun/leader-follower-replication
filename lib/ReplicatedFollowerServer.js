const net = require('net');
const JsonSocket = require('json-socket');

class ReplicatedFollowerServer {
    constructor(port) {
        this.port = port;
        this.server = net.createServer();

        this._setupEvents();
    }

    _setupEvents() {
        this.server.on('listening', () => {
            console.log(`TCP server listening on ${this.name}`);
        });

        this.server.on('connection', this._accept.bind(this));
    }

    get name() {
        return `localhost:${this.port}`;
    }

    listen() {
        this.server.listen(this.port);
    }

    _accept(tcpSocket) {
        console.log(`TCP client connection established, accepting messages.`);

        const socket = new JsonSocket(tcpSocket);

        socket.on('message', (message) => {
            console.log(`Received message ${JSON.stringify(message)}`);
        });
    }
}

module.exports = ReplicatedFollowerServer;