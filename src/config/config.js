import dotenv from 'dotenv'

dotenv.config({ path: './.env', override: true });

export default {
    port: process.env.PORT || 8080,
    db: {
        mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/CoderAdoptMe'
    }
};