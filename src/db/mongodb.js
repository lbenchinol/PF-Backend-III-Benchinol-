import mongoose from 'mongoose';
import config from '../config/config.js'

export const URI = config.db.mongodb;

export const connnectMongoDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Base de datos conectada!');
    } catch (error) {
        console.log('Ocurrio un error al conectar a la DB', error.message);
    }

}