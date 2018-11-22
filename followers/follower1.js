const ReplicatedFollowerServer = require('./follower');

const follower1 = new ReplicatedFollowerServer(9000);
follower1.listen();