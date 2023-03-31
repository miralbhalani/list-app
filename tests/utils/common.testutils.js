

const path = require('path');
const request = require('supertest');
const fs = require('fs');
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const { MongoClient } = require('mongodb');

const dbName = "list-app";

async function prepareMongoConnectionAsync() {

    var mongoServer = await MongoMemoryServer.create({
        instance: {
            dbName: dbName
        }
    });

    return mongoServer;
}

function prepareTestConfigFile(mongoServer) {
    const mongoUri = mongoServer.getUri();

    // Read the config file
    const configFile = path.resolve(__dirname, '../../config', 'config.test.json');
    const configData = fs.readFileSync(configFile, 'utf8');
    const config = JSON.parse(configData);
    
    // Modify the URI property
    config.db.mongo.uri = mongoUri;

    // Write the modified config back to the file
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

async function prepareDatabase(mongoServer) {

      // Create admin user
    const client = new MongoClient(mongoServer.getUri());

    const dbAdmin = client.db('admin');
    const adminUser = { user: 'listappdbuser001', pwd: 'TKD5jOZpcjy3kBap', roles: ['root'] };
    await dbAdmin.addUser(adminUser.user, adminUser.pwd, { roles: adminUser.roles });

    
    await client.connect()
    var db = client.db(dbName)
    await db.collection('users').insertOne({
        user: "listuser1",
        password: "c2f9e98c394d4fcc379da919df4254e7d73176271e0930fa7cdb0033b60a85cd"
    });
    await client.close();
}

async function getConnection(mongoServer) {

    
    const client = new MongoClient(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true, auth: { 
        username: 'listappdbuser001', 
        password: 'TKD5jOZpcjy3kBap' 
    } });

    await client.connect()

    return {
        db: client.db(dbName),
        client: client
    }
}

module.exports = {
    prepareTestConfigFile,
    prepareMongoConnectionAsync,
    prepareDatabase,
    getConnection
}