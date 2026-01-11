import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import router from './router';
import { checkEnvFile } from './helpers';

const app = express();
const PORT = 4000;
app.use(express.json());
app.use(router);

(async function startServer() {
  try {
    checkEnvFile();

    const {
      MONGO_INITDB_ROOT_USERNAME: USER,
      MONGO_INITDB_ROOT_PASSWORD: PASS,
      MONGO_INITDB_DATABASE: DB,
      MONGO_HOSTNAME: HOST = 'db' } = process.env;

    const MONGO_URI = `mongodb://${USER}:${PASS}@${HOST}:27017/${DB}?authSource=admin`;
    await mongoose.connect(MONGO_URI);
    console.log('Connected to db');
    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });

  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to connect to database', error.message);
    process.exit(1);
  }
})();

