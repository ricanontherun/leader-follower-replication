const net = require('net');
const JsonSocket = require('json-socket');
const async = require('async');

const STATE_DISCONNECTED = 1;
const STATE_CONNECTING = 2;
const STATE_CONNECTED = 3;

const BACKOFF_DEFAULT_MS = 100;
const BACKOFF_MULTIPLIER = 0.50;

class ReplicatedFollowerClient {
    constructor(config) {
        this.host = config.host;
        this.port = config.port;
        this.queue = async.queue(this._processMessage.bind(this));
        this.backlog = [];
        this.state = STATE_DISCONNECTED;
        this.socket = new JsonSocket(new net.Socket());
        this.reconnectBackoff = BACKOFF_DEFAULT_MS;

        this._setupEvents();
        this.connect();
    }

    _setupEvents() {
        this.socket
            .on('connect', this._onConnect.bind(this))
            .on('close', this._onClose.bind(this))
            .on('error', this._onError.bind(this));
    }

    get name() {
        return `${this.host}:${this.port}`;
    }

    connect() {
        this.state = STATE_CONNECTING;
        this.socket.connect(this.port, this.host)
    }

    send(message) {
        this.queue.push(message);
    }

    close() {
        this.socket.close();
    }

    _reconnect() {
        this.reconnectBackoff += (this.reconnectBackoff * BACKOFF_MULTIPLIER);

        console.log(`Attempting reconnect in ${this.reconnectBackoff}`);

        setTimeout(this.connect.bind(this), this.reconnectBackoff);
    }

    _processMessage(message, callback) {
        // If the socket isn't ready, throw the message on the backlog.
        if (this.state !== STATE_CONNECTED) {
            this.backlog.push(message);
            return;
        }

        this.socket.sendMessage(message, (err) => {
            if (err) {
                console.error(`Failed to send message to follower: ${err}`);
                return callback(err);
            }

            console.log('Sent message');
            return callback();
        });
    }

    _drainBacklog() {
        console.log(`Draining backlog: ${this.backlog.length} items`);

        for (let i = 0; i < this.backlog.length; i++) {
            this.queue.push(this.backlog.shift());
        }
    }

    _onConnect() {
        console.log(`TCP connection established with ${this.name}`);

        // Set some state.
        this.state = STATE_CONNECTED;
        this.reconnectBackoff = BACKOFF_DEFAULT_MS;

        // Drain any backlogged messages.
        this._drainBacklog();
    }

    _onClose() {
        console.log(`TCP connection with ${this.name} closed`);

        this.state = STATE_DISCONNECTED;

        // Attempt a reconnect.
        this._reconnect();
    }

    _onError(err) {
        console.log(`TCP error encountered: ${err}`);
    }
}

module.exports = ReplicatedFollowerClient;