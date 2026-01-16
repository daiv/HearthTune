import mongoose from 'mongoose';
export async function initDatabase() {
  const {
    MONGO_INITDB_ROOT_USERNAME: USER,
    MONGO_INITDB_ROOT_PASSWORD: PASS,
    MONGO_INITDB_DATABASE: DB,
    MONGO_HOSTNAME: HOST = 'db' } = process.env;

  const MONGO_URI = `mongodb://${USER}:${PASS}@${HOST}:27017/${DB}?authSource=admin`;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to db');
  } catch (error) {
    const message = error instanceof (Error) ? error.message : String(error);
    console.log('error connecting db', message);
    process.exit(1);
  }
}