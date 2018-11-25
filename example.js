const Replicator = require('./lib/Replicator');
const ReplicatedFollowerClient = require('./lib/ReplicatedFollowerClient');

const readline = require('readline');
const log = console.log;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const followerData = [
    {
        host: 'localhost',
        port: 9000
   }
];
const replicator = new Replicator;

followerData.forEach((data) => {
    const follower = new ReplicatedFollowerClient(data);

    // Follower events, for debugging.
    follower
        .on('drain', () => {
            console.log(`${follower.name} drained`);
        })
        .on('messageError', (err) => {
            console.log(`${follower.name}: messageError: ${err}`);
        })
        .on('messageSent', () => {
            console.log(`${follower.name} message sent`);
        })
        .on('reconnected', () => {
            console.log(`${follower.name} reconnected`);
        })
        .on('connected', () => {
            console.log(`${follower.name} connected`);
        });

    replicator.addFollower(follower);
});

const recursiveAsyncReadLine = function () {
    rl.question('Message: ', (message) => {
        replicator.send({
            message
        });

        recursiveAsyncReadLine();
    });
};

recursiveAsyncReadLine();