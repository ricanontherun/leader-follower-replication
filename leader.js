const Replicator = require('./lib/Replicator');

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

const replicator = new Replicator;

followerData.forEach((data) => {
    replicator.addFollower(data);
});

replicator.sendToFollowers(data);
