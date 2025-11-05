export default {
    port: process.env.PORT || 8080,
    db: {
        mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/CoderAdoptMe'
    }
};