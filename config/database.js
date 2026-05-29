function getMongoUrl() {
    return process.env.DATABASE
        || process.env.MONGO_URL
        || process.env.MONGODB_URI
        || process.env.DATABASE_URL;
}

module.exports = { getMongoUrl };
