const request = require('supertest');
const testConfig = require('./testConfig');
const {getTokenedRoute} = require('./utils/common.testutils');
var app;
var server;
const TestEnvCreator = require('./lib/TestEnvCreator');

var testEnv = new TestEnvCreator()

beforeAll(async () => {  
  await testEnv.create()
  var appOb = require('../index');
  app = appOb.app;
  server = appOb.server;
  testEnv.registerApp(app)
});

afterAll(async () => {
  await testEnv.destroy()
  await server.close()
});

describe('GET /token', function() {
  it('responds with JWT TOKEN', function(done) {

    request(app)
      .post('/token')
      .send({
        ...testConfig.mongo
      })      
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        
        const { validateToken } = require('../lib/tokenGen');

        var g = validateToken(res.body.token);

        try {
          expect(g).not.toBeNull();
          done();
        } catch (error) {
          done(error);
        }
      });


  });

  it('only authorized access to /list post', async () => {

    await request(app).post('/list')
      .send({title: "NEW TITLE 1"})
      .expect(401)
  });
  
  it('only authorized access to /list GET', async () => {

    await request(app).get('/list')
      .expect(401)
  });
  
  it('only authorized access to /list/:id UPDATE', async () => {

    await request(app).patch('/list/4343334').send({})
      .expect(401)
  });
  
  it('only authorized access to /list/:id delete', async () => {

    await request(app).delete('/list/4343334')
      .expect(401)
  });

  

  it('only authorized access to /list/:id/items post', async () => {

    await request(app).post('/list/123/items')
      .send({title: "NEW TITLE 1"})
      .expect(401)
  });
  
  it('only authorized access to /list/:id/items/:itemId post', async () => {

    await request(app).put('/list/123/items/3233')
      .send({title: "NEW TITLE 1"})
      .expect(401)
  });
  
  it('only authorized access to /list/:id/items/:itemId delete', async () => {

    await request(app).delete('/list/123/items/3233')
      .send({title: "NEW TITLE 1"})
      .expect(401)
  });
  
});


describe('list CRUD', function() {
  it('create new list', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "NEW TITLE 1"})
    expect(response.body.status).toBe(true)
    var result = await testEnv.getDb().collection('lists').findOne({title: "NEW TITLE 1"})
    expect(result).not.toBeNull() 
    var result = await testEnv.getDb().collection('lists').deleteOne({title: "NEW TITLE 1"})

  });

  it('update list', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "update list test title 1"})
    
    var insertedObj = await testEnv.getDb().collection('lists').findOne({title: "update list test title 1"})

    response = await testEnv.attachToken(request(app).patch(`/list/${insertedObj._id}`), token).send({title: "update list test title 2"})

    expect(response.body.status).toBe(true)

    response = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id, title: "update list test title 2"})
    expect(response).not.toBeNull() 
    response = await testEnv.getDb().collection('lists').deleteOne({_id: insertedObj._id})

  });

  it('delete list', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "delete list test title 1"})
    
    var insertedObj = await testEnv.getDb().collection('lists').findOne({title: "delete list test title 1"})

    response = await testEnv.attachToken(request(app).delete(`/list/${insertedObj._id}`), token)

    expect(response.body.status).toBe(true)

    response = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})
    expect(response).toBeNull() 
  });
});


describe('list item CRUD', function() {
  it('create new list item', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "NEW TITLE FOR LIST ITEM 1"})

    var insertedObj = await testEnv.getDb().collection('lists').findOne({title: "NEW TITLE FOR LIST ITEM 1"})

    response = await testEnv.attachToken(request(app).post(`/list/${insertedObj._id}/items`), token).send({
      title: "update list test title 2",
      dateAdded: new Date(),
      detail: "details"
    })

    expect(response.body.status).toBe(true)

    insertedObj = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})

    expect(insertedObj.items).toHaveLength(1)
    response = await testEnv.getDb().collection('lists').deleteOne({_id: insertedObj._id})

  });
  
  it('update list item', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "Update list item 1"})

    var insertedObj = await testEnv.getDb().collection('lists').findOne({title: "Update list item 1"})

    response = await testEnv.attachToken(request(app).post(`/list/${insertedObj._id}/items`), token).send({
      title: "Update list item 1 item insert 1",
      dateAdded: new Date(),
      detail: "details"
    })

    insertedObj = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})

    response = await testEnv.attachToken(request(app).put(`/list/${insertedObj._id}/items/${insertedObj.items[0].id}`), token).send({
      title: "Update list item 1 item insert 2",
      dateAdded: new Date(),
      detail: "details"
    })

    insertedObj = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})

    expect(insertedObj.items[0].title).toBe("Update list item 1 item insert 2")
    response = await testEnv.getDb().collection('lists').deleteOne({_id: insertedObj._id})

  });
  
  it('delete list item', async () => {

    let token = await testEnv.getToken();
    let response = await testEnv.attachToken(request(app).post('/list'), token).send({title: "delete list item"})

    var insertedObj = await testEnv.getDb().collection('lists').findOne({title: "delete list item"})

    response = await testEnv.attachToken(request(app).post(`/list/${insertedObj._id}/items`), token).send({
      title: "delete list item insert 1",
      dateAdded: new Date(),
      detail: "details"
    })

    insertedObj = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})

    response = await testEnv.attachToken(request(app).delete(`/list/${insertedObj._id}/items/${insertedObj.items[0].id}`), token).send({
      title: "delete list item insert 2",
      dateAdded: new Date(),
      detail: "details"
    })

    insertedObj = await testEnv.getDb().collection('lists').findOne({_id: insertedObj._id})

    expect(insertedObj.items).toHaveLength(0)
    response = await testEnv.getDb().collection('lists').deleteOne({_id: insertedObj._id})

  });
});