const Replicator = require('./lib/Replicator');
const readline = require('readline');
const log = console.log;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const recursiveAsyncReadLine = function () {
    rl.question('Message: ', (message) => {
        replicator.send({
            message
        });

        recursiveAsyncReadLine();
    });
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