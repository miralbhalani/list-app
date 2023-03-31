module.exports = {
    env: process.env.NODE_ENV,
    db: {
        mongo: {
            uri: process.env.MONGO_URI,
            userName: process.env.MONGO_USERNAME,
            password: process.env.MONGO_PASSWORD,
            dbName: process.env.MONGO_DBNAME,
        },
    },
    token: {
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h',
        },
    }
};