const ReplicatedFollowerServer = require('../lib/ReplicatedFollowerServer');

const follower1 = new ReplicatedFollowerServer(9000);
follower1.listen();