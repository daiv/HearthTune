import mongoose from 'mongoose';
export async function initDatabase() {
  const {
    MONGO_USER: USER,
    MONGO_PASS: PASS,
    MONGO_INITDB_DATABASE: DB,
    MONGO_HOSTNAME: HOST = 'db' } = process.env;

  if (!USER || !PASS || !DB) {
    console.error('error connecting to db. Missing .env fields');
    process.exit(1);
  }
  const MONGO_URI = `mongodb://${USER}:${PASS}@${HOST}:27017/${DB}?authSource=${DB}`;
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to db');
  } catch (error) {
    const message = error instanceof (Error) ? error.message : String(error);
    console.log('error connecting db', message);
    process.exit(1);
  }
}