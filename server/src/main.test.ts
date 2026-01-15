import mongoose from "mongoose";
import { MockProvider } from "./mocks/MockProvider";
import { SongService } from "./services/SongService";

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
describe('Songs service', () => {
  const provider = new MockProvider();
  const service = new SongService(provider);
  const spy = jest.spyOn(provider, 'searchSongs');

  beforeEach(spy.mockClear);

  it('song/search -> Should clamp the limit of songs searched between 1 and provider.MAX_LIMIT', async () => {

    await service.search('rock', 70);
    expect(spy).toHaveBeenCalledWith('rock', 10);
    await service.search('rock', -1);
    expect(spy).toHaveBeenCalledWith('rock', 1);
    await service.search('rock', 0);
    expect(spy).toHaveBeenCalledWith('rock', 1);

  });
  it('song/search -> Should sanitize the query', async () => {
    const testCases: { query: string, limit: number, expected: string }[] = [
      { query: 'rock', limit: 0, expected: 'rock' },
      { query: 'rock    ', limit: 0, expected: 'rock' },
      { query: '   rock', limit: 0, expected: 'rock' },
      { query: 'rock-', limit: 0, expected: 'rock-' },
      { query: 'r@ock-', limit: 0, expected: 'rock-' },
      { query: 'r@oc\k-', limit: 0, expected: 'rock-' },
      { query: 'Linkin @@@@ Park', limit: 0, expected: 'Linkin Park' },
      { query: '<script> ../etc/passwd', limit: 0, expected: 'script ..etcpasswd' },
      { query: 'Ke$ha & P!nk', limit: 0, expected: 'Ke$ha & P!nk' },
      { query: 'Rock 🎸 Metal', limit: 0, expected: 'Rock Metal' },
      { query: 'La Fuga', limit: 0, expected: 'La Fuga' },
    ];

    const spy = jest.spyOn(provider, 'searchSongs');

    for (const test of testCases) {
      await service.search(test.query, test.limit);
      expect(spy).toHaveBeenLastCalledWith(test.expected, 1);
    }
  });

  it('song/play/:id', async () => {
    const songId = "9Yp3lc3PsjA";
    const spy = jest.spyOn(provider, 'getAudioStream');
    await service.getAudioStream(songId, async () => { }, () => { });
    expect(spy).toHaveBeenCalledWith(songId);
  });

});