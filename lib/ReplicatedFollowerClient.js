const net = require('net');
const EventEmitter = require('events').EventEmitter;

const JsonSocket = require('json-socket');
const async = require('async');

const STATE_DISCONNECTED = 1;
const STATE_CONNECTING = 2;
const STATE_CONNECTED = 3;
const STATE_RECONNECTING = 4;

const BACKOFF_DEFAULT_MS = 100;
const BACKOFF_MULTIPLIER = 0.50;

class ReplicatedFollowerClient extends EventEmitter {
    constructor(config) {
        super();

        this.host = config.host;
        this.port = config.port;
        this.queue = async.queue(this._processMessage.bind(this));
        this.backlog = [];
        this.state = STATE_DISCONNECTED;
        this.socket = new JsonSocket(new net.Socket());
        this.reconnectBackoff = BACKOFF_DEFAULT_MS;

        this._setupEvents();
        this._connect();
    }

    get name() {
        return `${this.host}:${this.port}`;
    }

    /**
     * Send a message.
     *
     * @param {Object|String} message
     */
    send(message) {
        this.queue.push(message);
    }

    close() {
        this.socket.close();
    }

    _connect() {
        this.state = STATE_CONNECTING;
        this.socket.connect(this.port, this.host)
    }

    _reconnect() {
        this.state = STATE_RECONNECTING;

        setTimeout(this._connect.bind(this), this.reconnectBackoff);

        this.reconnectBackoff += (this.reconnectBackoff * BACKOFF_MULTIPLIER);
    }

    _processMessage(message, callback) {
        // If the socket isn't ready, throw the message on the backlog.
        if (this.state !== STATE_CONNECTED) {
            this.backlog.push(message);
            return callback();
        }

        this.socket.sendMessage(message, (err) => {
            const event = err ? 'messageError' : 'messageSent';

            this.emit(event, err);

            return callback(err);
        });
    }

    _drainBacklog() {
        while (this.backlog.length) {
            this.queue.push(this.backlog.shift());
        }

        this.emit('drain');
    }

    _onConnect() {
        this.emit(this.state === STATE_RECONNECTING ? 'reconnected' : 'connected');

        // Set some state.
        this.state = STATE_CONNECTED;
        this.reconnectBackoff = BACKOFF_DEFAULT_MS;

        // Drain any backlogged messages.
        this._drainBacklog();
    }

    _onClose() {
        this.state = STATE_DISCONNECTED;

        // Attempt a reconnect.
        this._reconnect();
    }

    _onError(err) {
        this.emit('socketError', err.message);
    }

    _setupEvents() {
        this.socket
            .on('connect', this._onConnect.bind(this))
            .on('close', this._onClose.bind(this))
            .on('error', this._onError.bind(this));
    }

}

module.exports = ReplicatedFollowerClient;