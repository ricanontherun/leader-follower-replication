const net = require('net');
const JsonSocket = require('json-socket');
const EventEmitter = require('events').EventEmitter;

const data = {
    name: "Christian",
    ttl: 70
};

const followerData = [
    {
        host: 'localhost',
        port: 9000
    }
];

class Replicator extends EventEmitter {
    constructor() {
        this.followers = [];
    }

    addFollower(data) {
        this.followers.push(new ReplicatedFollowerClient(data));
    }

    sendToFollowers(data) {
        this.followers.forEach((follower) => {
            follower.send(data);
        })
    }
}

class ReplicatedFollowerClient extends EventEmitter {
    constructor(data) {
        this.host = data.host;
        this.port = data.port;
        this.connected = false;

        this.socket = new JsonSocket(new net.Socket());

        // Setup event handlers.
        this._setupEvents();

        // Perhaps don't do this in the constructor?
        this.connect();
    }

    _setupEvents() {
        this.socket
            .on('connect', () => {
                this.connected = true;
                console.log(`TCP connection established with ${this.name}`);
            })
            .on('close', () => {
                this.connected = false;
                console.log(`TCP connection with ${this.name} closed`);
            })
            .on('error', (err) => {
                this.connected = false;
                console.log(`TCP error encountered: ${err}`);
            });
    }

    get name() {
        return `${this.host}:${this.port}`;
    }

    async connect() {
        this.socket.connect(this.port, this.host)
    }

    async send(data) {
        if (!this.connected) {
            console.log('Not connected, connecting...');
            // Attempt to connect.
            // What happens when a follower continually fails to connect?
            await this.connect();
        }

        this.socket.sendMessage(data, (err) => {
            if (err) {
                console.error(`Failed to send message to follower: ${err}`);
                return;
            }

            console.log(`Sent message to follower`);
        });
    }
}

const replicator = new Replicator;

followerData.forEach((data) => {
    replicator.addFollower(data);
});

replicator.on('ready')

replicator.sendToFollowers(data);
