var {
    prepareMongoConnectionAsync,
    prepareTestConfigFile,
    prepareDatabase,
    getConnection
} = require('../utils/common.testutils');
const testConfig = require('../testConfig');
const request = require('supertest');

module.exports = class TestEnvCreator {

    db
    client
    app
    mongoConnectionServer
    constructor() {

    }

    async create() {
        this.mongoConnectionServer = await prepareMongoConnectionAsync()
        prepareTestConfigFile(this.mongoConnectionServer)
        await prepareDatabase(this.mongoConnectionServer)
        var connection = await getConnection(this.mongoConnectionServer)
        this.db = connection.db
        this.client = connection.client
    }

    async destroy() {
        await this.mongoConnectionServer.stop();
        await this.client.close();
    }

    registerApp(app) {
        this.app = app
    }

    getDb() {
        return this.db
    }

    async getToken() {

        var response = await request(this.app)
            .post('/token')
            .send({
                ...testConfig.mongo
            })

        return response.body.token
    }

    attachToken(inputReq, token) {
        return inputReq.set('Authorization', `Bearer ${token}`)
    }
}