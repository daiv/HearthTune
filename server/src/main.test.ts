import mongoose from "mongoose";

describe('TDD tests', () => {
  beforeAll(async () => {
    const {
      MONGO_INITDB_ROOT_USERNAME,
      MONGO_INITDB_ROOT_PASSWORD,
      MONGO_INITDB_DATABASE,
      MONGO_HOSTNAME = 'db' } = process.env;
    const MONGO_URI = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOSTNAME}:27017/${MONGO_INITDB_DATABASE}?authSource=admin`;
    await mongoose.connect(MONGO_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  })
  it('initial check', () => {
    const suma = 1 + 1;
    expect(suma).toBe(2);
  });
  it('should see dotenv vars', () => {
    expect(process.env).toBeTruthy();
  });
  it('should be connected to the db', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  })

});