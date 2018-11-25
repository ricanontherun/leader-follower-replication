const ReplicatedFollowerClient = require('./ReplicatedFollowerClient');

class Replicator {
    constructor() {
        this.followers = [];
    }

    addFollower(follower) {
        this.followers.push(follower);
    }

    send(data) {
        this.followers.forEach((follower) => {
            follower.send(data);
        })
    }

    closeFollowers() {
        this.followers.forEach(follower => follower.close());
    }
}

module.exports = Replicator;