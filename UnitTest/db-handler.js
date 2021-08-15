const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();

    const uri = await mongoServer.getUri();
    const mongooseOpts = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    };

    await mongoose.connect(uri, mongooseOpts, err => {
        if (err) {
            console.error(err);
        }
    });
};

const close = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

// Remove all data from collections
const clear = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany();
    }
};
module.exports = {
    connect,
    close,
    clear,
};