class Replicator {
    constructor() {
        this.followers = [];
    }

    addFollower(followerOpts) {
        this.followers.push(new ReplicatedFollowerClient(followerOpts));
    }

    sendToFollowers(data) {
        this.followers.forEach((follower) => {
            follower.send(data);
        })
    }

    closeFollowers() {
        this.followers.forEach(follower => follower.close());
    }
}

module.exports = Replicator;