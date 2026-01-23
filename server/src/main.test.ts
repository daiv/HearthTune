import mongoose from "mongoose";
import { MockProvider } from "./mocks/MockProvider";
import { SongRepository, SongService } from "./services";
import express from 'express';
import { initGraphqlMiddleware } from "./graphql/graphqlServer";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import { YtDlpProvider } from "./providers";
import { Server } from "node:http";
import { Song } from "@/common/types";
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
  });

  it('initial check', () => {
    const suma = 1 + 1;
    expect(suma).toBe(2);
  });
  it('should see dotenv vars', () => {
    expect(process.env).toBeTruthy();
  });
  it('should be connected to the db', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  describe('Songs service', () => {
    const provider = new MockProvider();
    const repo = new SongRepository();
    const service = new SongService(provider, repo);
    const spy = jest.spyOn(provider, 'searchSongs');

    beforeEach(spy.mockClear);

    it('song/search -> Should clamp the limit of songs searched between 1 and provider.MAX_LIMIT', async () => {
      let limit = 70;
      const MAX_LIMIT = service.MAX_LIMIT;
      await service.search('rock', limit);
      expect(spy).toHaveBeenCalledWith('rock', (limit <= MAX_LIMIT ? limit : MAX_LIMIT));
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
      await service.getAudioStream(songId);
      expect(spy).toHaveBeenCalledWith(songId);
    });
  });

  describe('Graphql', () => {
    let request: TestAgent;
    const provider = new MockProvider();
    // const provider = new YtDlpProvider();
    const repo = new SongRepository();
    const service = new SongService(provider, repo);

    let httpServer: Server;

    beforeAll(async () => {
      let server = express();
      server.use(express.json());

      const graphql = await initGraphqlMiddleware(service);
      server.use('/graphql', graphql);
      httpServer = server.listen();
      request = supertest(httpServer);

    });
    afterAll(async () => {
      await new Promise<void>(resolve => {
        httpServer.close(() => { resolve() });
      });
    })

    it('Should call the search function with the right args', async () => {
      const searchQuery = `
    query find($searchString:String!, $max: Int){
    search(query:$searchString, limit:$max){
    id,
    title, 
    description,
    duration}
    }`;

      const vars = { searchString: '9Yp3lc3PsjA', max: 1 }
      const spy = jest.spyOn(service, 'search');
      const response = await request.post('/graphql')
        .send({ query: searchQuery, variables: vars });
      expect(spy).toHaveBeenCalledWith(vars.searchString, vars.max);
    });

    it('Should call getRelated and get results', async () => {
      const relatedQuery = `
    query related($searchString:String!){
    getRelated(id:$searchString){
    id,title}
    }`;

      const vars = { searchString: '3LA8hq9plTY' };
      const response = await request.post('/graphql')
        .send({ query: relatedQuery, variables: vars });
      const { getRelated: songs } = response.body.data;
      expect(songs[0]).toHaveProperty("id");
      expect(songs[0]).toHaveProperty("title");
      expect(songs).toHaveLength(10);

    });

  });
  describe('Repository Tests', () => {
    const now = new Date();
    const song: Song = {
      id: '12345678901',
      title: 'mocktitle',
      description: '',
      duration: 10,
      played: 0,
      lastPlayed: now
    };
    const repo = new SongRepository();
    beforeAll(() => {
      mongoose.connection.collection('songs').deleteMany({});
    });

    it('Should check if song is already stored', async () => {
      await repo.delete(song.id);
      expect(await repo.exists(song.id)).toBe(false);
    });

    it('Should save the song to db', async () => {
      await repo.save(song);
      expect(await repo.exists(song.id)).toBe(true);
    });

    it('Should get the song details', async () => {
      const response: Song | null = await repo.getSongDetails(song.id);
      expect(response).toBeTruthy();
      expect(response).toMatchObject(song);
      if (response) {
        (Object.keys(song) as Array<keyof Song>).forEach(key => {
          expect(song[key]).toEqual(response[key]);
        });
        expect(response.played).toEqual(0);
      }
    });

    it('Should increase played times when needed', async () => {
      await repo.addOneMorePlayed(song.id);
      const response = await repo.getSongDetails(song.id);
      expect(response).toBeTruthy();
      response && expect(response.played).toEqual(1);
    });
  });
});