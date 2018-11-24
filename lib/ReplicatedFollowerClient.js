const net = require('net');
const JsonSocket = require('json-socket');
const EventEmitter = require('events').EventEmitter;
const async = require('async');

const ReplicatedFollowerClient = require('./ReplicatedFollowerClient');

const STATE_DISCONNECTED = 1;
const STATE_CONNECTING = 2;
const STATE_CONNECTED = 3;

class ReplicatedFollowerClient extends EventEmitter {
    constructor(data) {
        super();

        this.host = data.host;
        this.port = data.port;
        this.connected = false;
        this.queue = [];
        this.state = STATE_DISCONNECTED;
        this.socket = new JsonSocket(new net.Socket());

        this._setupEvents();
    }

    _setupEvents() {
        this.socket
            .on('connect', () => {
                this.state = STATE_CONNECTED;
                this.connected = true;
                console.log(`TCP connection established with ${this.name}`);
            })
            .on('close', () => {
                this.state = STATE_DISCONNECTED;
                this.connected = false;
                console.log(`TCP connection with ${this.name} closed`);
            })
            .on('error', (err) => {
                // TODO: Check state?
                this.connected = false;
                console.log(`TCP error encountered: ${err}`);
            });

        async.whilst(() => {
            return this.state = STATE_CONNECTED;
        }, () => {

        });
    }

    get name() {
        return `${this.host}:${this.port}`;
    }

    async connect() {
        this.state = STATE_DISCONNECTED | STATE_CONNECTING;
        this.socket.connect(this.port, this.host)
    }

    async send(message) {
        // Enqueue the message to be sent.
        if (!this.connected) {
            await this.connect();
        }

        this.socket.sendMessage(message, (err) => {
            if (err) {
                console.error(`Failed to send message to follower: ${err}`);
                return;
            }

            console.log(`Sent message to follower`);
        });
    }

    _send(message, callback) {
    }

    close() {
    }
}

module.exports = ReplicatedFollowerClient;