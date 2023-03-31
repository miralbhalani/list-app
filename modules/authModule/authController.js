
var hasher = require('../../lib/hasher');
var tokenGen = require('../../lib/tokenGen');

module.exports = function authController(depObject) {
    
    let { db } = depObject;

    async function getToken(req, res) {

        let { username, password } = req.body;

        password = hasher(password);


        try {
            const user = await db().collection('users').findOne({
                user: username,
                password: password
            });
            
            if(user) {
                var token = tokenGen.generateToken({
                    username
                })
    
                res.json({
                    token: token
                });
                return 
            }
            res.status(401).json({ message: 'Wrong credintials' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    async function validateToken(req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);

            const validateResult = tokenGen.validateToken(token);
            if(validateResult) {
                next()
                return
            }
        }

        res.status(401).json({ error: 'Unauthorized' });
    }

    return {
        getToken,
        validateToken
    }
}