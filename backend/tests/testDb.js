const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function setupMemoryDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function dropData() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

async function closeMemoryDB() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

module.exports = { setupMemoryDB, dropData, closeMemoryDB };
