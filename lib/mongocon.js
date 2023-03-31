

const { MongoClient } = require('mongodb');
const { 
    db: { 
        mongo: { 
            uri,
            userName,
            password,
            dbName 
        } 
    } 
} = require('../config');

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, auth: { 
    username: userName, 
    password: password 
} });

async function getConnection() {

    try{
        await client.connect()
    } catch(err){
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

getConnection();


function getClient() {
    return client
}

function getDb() {
    return client.db(dbName)
}

async function onServerClose() {
    try {
        await client.close();
    } catch (err) {
    }
}


async function onSIGINT() {
    try {
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('Failed to close MongoDB connection:', err);
        process.exit(1);
    }
}

module.exports = {
    dbClient: getClient,
    db: getDb,
    onServerClose,
    onSIGINT
};
