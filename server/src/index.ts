import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import router from './router';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(router);


(async function startServer() {
  try {
    checkEnvFile();
    const { MONGO_USER, MONGO_PASS, MONGO_DB_NAME } = process.env;
    const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@db:27017/${MONGO_DB_NAME}?authSource=admin`;
    await mongoose.connect(MONGO_URI);
    console.log('Connected to db');
    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });

  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to connect to database', error.message);
    process.exit(1);
  }
})();

function checkEnvFile() {
  console.log('Checking env file...');
  const mandatoryVar = [
    'MONGO_DB_NAME',
    'MONGO_USER',
    'MONGO_PASS',
  ];
  const missingEnvVariables = mandatoryVar.filter(envVar => {
    const value = process.env[envVar];
    return !value || value.trim() === "";
  });
  if (missingEnvVariables.length > 0) throw new Error(`The next .env variables are missing: ${missingEnvVariables.join(', ')}`);
  else console.log('env file is ok');
}