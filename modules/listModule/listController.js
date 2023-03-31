
var hasher = require('../../lib/hasher');
var tokenGen = require('../../lib/tokenGen');
const { ObjectId } = require('mongodb');

module.exports = function listController(depObject) {
    
    let { db } = depObject;

    
    // get: /list
    async function getLists(req, res) {
        
        const lists = await db().collection('lists').find().toArray();

        res.json(lists)
    }

    // post: /list
    async function createList(req, res) {
        
        try {
            var response = await db().collection('lists').insertOne(req.body);
            res.send({
                status: true,
                id: response.insertedId
            })
        } catch (error) {
            next(error);
        }
    }

    async function getOneList(req, res) {
        
        const id = new ObjectId(req.params.id);

        try {
            await db().collection('lists').find({ _id: id });
    
            res.send({
                status: true
            })
        } catch (error) {
            next(error);
        }
    }

    // patch: /list/:id
    async function updateListTitle(req, res) {
        
        const id = new ObjectId(req.params.id);
        const title = req.body.title;

        try {
            
            await db().collection('lists').updateOne({ _id: id }, { $set: { title: title } });
            
            res.send({
                status: true
            })
        } catch (error) {
            next(error);
        }
    }

    // delete: /list/:id
    async function deleteList(req, res) {
        
        const id = new ObjectId(req.params.id);
        
        try {
            
            await db().collection('lists').deleteOne({ _id: id });
            
            res.send({
                status: true
            })
        } catch (error) {
            next(error);
        }
    }

    // post: /list/:id/items
    async function addListItem(req, res) {
        
        const id = new ObjectId(req.params.id);
        const body = {
            id: new ObjectId(),
            ...req.body
        };

        console.log(id, body)
        try {
            
            await db().collection('lists').updateOne({ _id: id },  { $push: { items: body } });
            
            res.send({
                status: true,
                id: id
            })
        } catch (error) {
            next(error);
        }
    }

    // put: /list/:id/items/:itemId
    async function updateListItem(req, res, next) {
        
        const id = new ObjectId(req.params.id);
        const itemId = new ObjectId(req.params.itemId);
        const body = {
            id: new ObjectId(itemId),
            ...req.body
        };

        try {
            
            await db().collection('lists').updateOne({ _id: id, [`items.id`]: itemId },  
                { $set: { 'items.$': body } });
            res.send({
                status: true
            })
        } catch (error) {
            next(error);
        }
    }

    // delete: /list/:id/items/:itemId
    async function deleteListItem(req, res, next) {
        
        const id = new ObjectId(req.params.id);
        const itemId = new ObjectId(req.params.itemId);

        try {
            await db().collection('lists').updateOne({ _id: id}, { $pull: { items: { "id":  itemId} } });
            
            res.send({
                status: true
            })
        } catch (error) {
            next(error);
        }
    }

    return {
        getLists,
        getOneList,
        createList,
        deleteList,
        updateListTitle,
        addListItem,
        updateListItem,
        deleteListItem,
    }
}