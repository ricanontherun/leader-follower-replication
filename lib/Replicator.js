const ReplicatedFollowerClient = require('./ReplicatedFollowerClient');

class Replicator {
    constructor() {
        this.followers = [];
    }

    addFollower(followerOpts) {
        this.followers.push(new ReplicatedFollowerClient(followerOpts));
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