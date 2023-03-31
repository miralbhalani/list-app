
var hasher = require('../../lib/hasher');
var tokenGen = require('../../lib/tokenGen');
const { ObjectId } = require('mongodb');

module.exports = function listController(depObject) {
    
    let { db } = depObject;

    async function getLists(req, res) {
        
        const lists = await db().collection('lists').find().toArray();

        res.json(lists)
    }

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
            // console.log(error)
            next(error);
        }
    }

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