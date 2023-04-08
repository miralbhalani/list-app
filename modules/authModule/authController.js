
var hasher = require('../../lib/hasher');
var tokenGen = require('../../lib/tokenGen');

module.exports = function authController(depObject, dependancyResolver) {
    
    // dependancies
    let { db } = depObject;

    // post: /token
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
                    username,
                    id: user._id
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

    // auth middleware
    async function validateToken(req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);

            const validateResult = tokenGen.validateToken(token);
            if(validateResult) {

                dependancyResolver.addDependancy("userInfo", {
                    id: validateResult.id,
                    username: validateResult.username
                })

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