const dbName = process.env.MONGO_INITDB_DATABASE;
const appUser = process.env.MONGO_USER;
const appPass = process.env.MONGO_PASS;

if (!dbName || !appUser || !appPass) throw new Error('Missing mongo variables');

const targetDb = db.getSiblingDB(dbName);
console.log('creating db user');
targetDb.createUser({
  user: appUser,
  pwd: appPass,
  roles: [
    { role: 'readWrite', db: dbName }
  ]
})