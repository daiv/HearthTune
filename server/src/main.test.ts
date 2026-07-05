import mongoose from "mongoose";
import { MockProvider } from "./mocks/MockProvider";
import express from 'express';
import { initGraphqlMiddleware } from "./graphql/graphqlServer";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import { Server } from "node:http";
import { DownloadStatus, Song } from "@/common/types";
import { AuthService, SongService, UserService } from "./services";
import { describe, it, expect, afterAll, beforeAll, jest, beforeEach, afterEach } from '@jest/globals';
import { Role, Session, User } from "./types/types";
import { UserRepository, SongRepository } from "./repositories/";
import { UserModel } from "./models/userModel";
import { createValidationCredentials, hashData } from "./helpers";
import { SessionRepository } from "./repositories/SessionRepository";
import { SessionModel } from "./models/sessionModel";

describe('TDD tests', () => {
  beforeAll(async () => {
    const {
      MONGO_INITDB_ROOT_USERNAME,
      MONGO_INITDB_ROOT_PASSWORD,
      MONGO_INITDB_DATABASE,
      MONGO_HOSTNAME = 'db' } = process.env;
    const MONGO_URI = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOSTNAME}:27017/${MONGO_INITDB_DATABASE}?authSource=admin&retryWrites=false`;
    await mongoose.connect(MONGO_URI);

    await mongoose.connection.collection('users').deleteMany({});
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('initial check', () => {
    const suma = 1 + 1;
    expect(suma).toBe(2);
  });

  it('Should see dotenv vars', () => {
    expect(process.env).toBeTruthy();
  });

  it('Should be connected to the db', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  describe('Songs service', () => {
    const providers = [new MockProvider()];
    const mockProvider = providers[0];
    const repo = new SongRepository();
    const service = new SongService(providers, repo);
    const spy = jest.spyOn(mockProvider, 'searchSongs');


    beforeEach(() => { spy.mockClear(); });

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

      const spy = jest.spyOn(mockProvider, 'searchSongs');

      for (const test of testCases) {
        await service.search(test.query, test.limit);
        expect(spy).toHaveBeenLastCalledWith(test.expected, 1);
      }

    });

    /* it('song/play/:id', async () => {
      const songId = "9Yp3lc3PsjA";
      const spy = jest.spyOn(provider, 'getAudioSource');
      await service.getAudioSource(songId);
      expect(spy).toHaveBeenCalledWith(songId);
    }); */

  });

  describe('Graphql', () => {
    let request: TestAgent;
    const providers = [new MockProvider()];
    // const provider = new YtDlpProvider();
    const repo = new SongRepository();
    const songService = new SongService(providers, repo);
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);
    const authService = new AuthService(userRepository);

    let httpServer: Server;

    beforeAll(async () => {
      let server = express();
      server.use(express.json());

      const graphql = await initGraphqlMiddleware(songService, userService, authService,

        async () => ({
          user: { id: 'test-user', role: 'basic' } as User,
          services: {
            songs: songService,
            user: userService,
            auth: authService
          }
        })
      );
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

      const spy = jest.spyOn(songService, 'search').mockResolvedValue([
        { id: '9Yp3lc3PsjA', title: 'Test Song', description: 'desc', duration: 100 }
      ]);
      const vars = { searchString: '9Yp3lc3PsjA', max: 1 }
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


  describe('Song Repository Tests', () => {
    const now = new Date();
    const song: Song = {
      id: '12345678901',
      title: 'mocktitle',
      description: '',
      duration: 10,
      played: 0,
      downloadStatus: DownloadStatus.DownloadPending,
      lastPlayed: now
    };
    const repo = new SongRepository();
    beforeAll(async () => {
      await mongoose.connection.collection('songs').deleteMany({});
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
  describe('User tests', () => {
    const mockUser: User & { emailHash: string } = {
      email: 'a@a.com',
      emailHash: '23423423',
      id: 'mockId',
      nick: 'testuser',
      password: '1234',
      role: 'basic',
      status: "active"
    };
    describe('User repository tests', () => {
      beforeAll(async () => {
        await mongoose.connection.collection('users').deleteMany({});
      });

      const userRepo = new UserRepository();

      it('Should save users', async () => {
        await userRepo.save(mockUser);
        const response = await userRepo.getUserByEmailHash(mockUser.emailHash);
        expect(response).toBeTruthy();
        expect(response?.id).toEqual(mockUser.id);
      });

      it('Should get the users by id', async () => {
        const idUser = { ...mockUser, email: 'id@id.com', id: 'idid', emailHash: '3322' };
        await userRepo.save(idUser);
        const response = await userRepo.getUserById(idUser.id);
        expect(idUser.id).toEqual(response?.id);
      });

      it('Should verify real email hashing', async () => {
        const encryptedUser = { ...mockUser };
        await userRepo.save(encryptedUser);
        const rawUser = await UserModel.findOne({ _id: encryptedUser.id }).lean();
        expect(rawUser?.email).not.toBe(encryptedUser.email);
      });

    });

    describe('User service test', () => {

      let userRepo: UserRepository;
      let userService: UserService;
      let authService: AuthService;
      const uniqueEmails: string[] = []
      for (let i = 0; i < 10; i++) uniqueEmails.push(i + "@email.com");

      beforeAll(async () => {
        await UserModel.deleteMany({});
        userRepo = new UserRepository();
        userService = new UserService(userRepo);
        authService = new AuthService(userRepo);

      });

      it('Should create users', async () => {
        const createdUser = await userService.createUser({ email: uniqueEmails.pop()!, password: 'password', nick: 'nick' });
        expect(createdUser).toBeTruthy();
      });

      it('Should hash the email', async () => {
        const email = 'emailTobeHashed';
        const createdUser = await userService.createUser({ email, password: 'password', nick: 'nick' });
        const rawCreatedUser = await UserModel.findOne({ nick: 'nick' }).lean();
        expect(createdUser.email).not.toBe(rawCreatedUser?.email);
      });

      it('Should encrypt email field', async () => {
        const { email, password, nick } = mockUser;
        const createdUser = await userService.createUser({ email, password, nick });
        expect(password).not.toBe(createdUser.password);
      });

      it('Should find users by emailHash', async () => {
        const [email, password, nick] = [uniqueEmails.pop()!, 'pwdd', 'daiv'];
        const createdUser = await userService.createUser({ email, password, nick });
        const userFromHash = await userService.getUserByEmail(email);
        expect(userFromHash).toEqual(createdUser);
      });

      it('Should find users by id', async () => {
        const email = uniqueEmails.pop();
        const createdUser = await userService.createUser({ email: email!, password: '12345' });
        const userFound = await userService.getUserById(createdUser.id);
        expect(createdUser.id).toEqual(userFound.id);
      });

      it('Should create user encrypting password and hashing email', async () => {
        await UserModel.deleteMany({});
        // const [nick, email, password] = ['nick', 'email@email.com', 'password'];
        const { nick, email, password } = mockUser;
        const newUser: User = await userService.createUser({ email, password, nick });
        const rawCreatedUser = await UserModel.findOne({ nick }).lean();
        expect(rawCreatedUser).toBeTruthy();
        expect(rawCreatedUser?.email).toBeTruthy();
        expect(rawCreatedUser?.email).not.toBe(email);
        expect(rawCreatedUser?.password).toBeTruthy();
        expect(rawCreatedUser?.password).not.toBe(password);
        expect(newUser.nick).toBe(nick);
      });

      it('Should produce the same hash from the same string', () => {
        const { email } = mockUser;
        const mockEmailHash = hashData(email);
        expect(mockEmailHash).toEqual(hashData(email));
      });

      it('Should update user data instead of creating a duplicate when using save', async () => {
        const email = uniqueEmails.pop()!;
        const password = 'initialPassword';
        const nick = 'originalNick';

        const createdUser = await userService.createUser({ email, password, nick });
        expect(createdUser.status).toBe('whiteListed');

        const updatedData: User = {
          ...createdUser,
          status: 'verification_pending',
          role: 'admin'
        };

        const savedUser = await userRepo.save(updatedData);

        expect(savedUser.id).toBe(createdUser.id);
        expect(savedUser.status).toBe('verification_pending');
        expect(savedUser.role).toBe('admin');

        const userCount = await UserModel.countDocuments({ _id: savedUser.id });
        expect(userCount).toBe(1);

        const userInDb = await userRepo.getUserByEmailHash(savedUser.emailHash);
        expect(userInDb?.id).toBe(createdUser.id);
      });

      it('Should create user from only email and role', async () => {
        const email = uniqueEmails.pop()!;
        const role: Role = "user";
        const user = await userService.createUser({ email, role });
        expect(user.id).toBeTruthy();
        expect(user.email).toBeTruthy();
        expect(user.role).toBeTruthy();
        expect(user.role).toEqual(role);
        expect(user.status).toEqual('whiteListed');
      });


      it('Should validate token lifecycle: invalid, valid, and expired states', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        const credentials = createValidationCredentials();

        expect(await authService.removeCredentials(user.id)).toBe(false);
        // 1. Invalid token case
        const invalidResult = await authService.isValidationTokenLegit(credentials.token);
        expect(invalidResult.valid).toBe(false);
        expect((invalidResult as { cause: string }).cause).toBe('invalid token');

        // 2. Valid token case
        await userService.saveUser({ ...user, credentials });

        const validResult = await authService.isValidationTokenLegit(credentials.token);

        expect(validResult.valid).toBe(true);
        const success = validResult as { valid: true; credentials: typeof credentials };
        expect(success.credentials).toEqual(credentials);

        // 3. Expired token case
        const expiredCredential = { ...credentials, expiresAt: new Date(Date.now() - 10) };
        await userService.saveUser({ ...user, credentials: expiredCredential });

        const expiredResult = await authService.isValidationTokenLegit(expiredCredential.token);
        expect(expiredResult.valid).toBe(false);
        expect((expiredResult as { cause: string }).cause).toBe('token expired');

        expect(await authService.removeCredentials(user.id)).toBe(true);
      });

      it('Should save password and check password lifecycle', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(user.password).toBeFalsy();
        const userPassword = 'iLoveUnicorns';
        expect(await authService.checkUserPassword(user.id, userPassword)).toBe(false);
        await authService.setUserPassword(user.id, userPassword);
        expect(await authService.checkUserPassword(user.id, 'notLovingUnicorns')).toBe(false);
        expect(await authService.checkUserPassword(user.id, userPassword)).toBe(true);

      });

      it('Should enable user Account if everything is ok', async () => {
        const userToEnable = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(userToEnable.activatedAt).toBeFalsy();
        const password = '12345isTheBestPassword';
        await authService.setUserPassword(userToEnable.id, password);
        await authService.enableUserAccount(userToEnable.id);

        const user = await userService.getUserById(userToEnable.id);
        expect(user.activatedAt).toBeTruthy();
      });

      it('Should create and save userCredentials', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(user).not.toHaveProperty('credentials');
        const preparedUser = authService.prepareUserCredentials(user);
        expect(preparedUser).toHaveProperty('credentials');
        if (!preparedUser.credentials) throw new Error('credentials missing');
        if (!preparedUser.credentials.token) throw new Error('token missing');

        const { token } = preparedUser.credentials;
        expect(await authService.getUserByToken(token)).toBeFalsy();
        await userService.saveUser(preparedUser);
        const userByToken = await authService.getUserByToken(token);
        if (!userByToken) throw new Error('user not found');
        expect(preparedUser.id).toEqual(userByToken.id);
      });
    });
  });

  describe('Session tests', () => {
    describe('SessionRepository', () => {
      let repository: SessionRepository;

      beforeAll(() => {
        repository = new SessionRepository();
      });
      afterEach(async () => {
        await SessionModel.deleteMany({});
      });

      it('Should count sessions correctly for a specific user', async () => {
        await repository.create({ userId: 'u1', tokenJTIHash: 't1', deviceInfo: 'd1' });
        await repository.create({ userId: 'u1', tokenJTIHash: 't2', deviceInfo: 'd1' });

        const count = await repository.countByUserId('u1');
        expect(count).toBe(2);
      });
      it('Should find sessions by tokenhash', async () => {
        const mockSession: Session = { userId: 'ut', tokenJTIHash: 'token', deviceInfo: 'info' };
        await repository.create(mockSession);
        const session = await repository.findByTokenHash('token');
        if (!session) throw new Error('session not found');
        expect(session.userId).toBe(mockSession.userId);
      });
      it('Should find sessions by userId', async () => {
        const mockSession: Session = { userId: 'favId', tokenJTIHash: 'tokenhash', deviceInfo: 'android' };
        await repository.create(mockSession);
        let session = await repository.findByUserId(mockSession.userId);
        expect(session.length).toBe(1);
        expect(session[0].tokenJTIHash).toBe(mockSession.tokenJTIHash);
        await repository.create({ userId: 'favId', tokenJTIHash: 'tok2', deviceInfo: 'notAndroid' });
        session = await repository.findByUserId(mockSession.userId);
        expect(session.length).toBe(2);
        expect(session[1].tokenJTIHash).toBe('tok2');


      })
      it('Should remove by tokenHash', async () => {
        const mockSession: Session = { userId: 'idi', tokenJTIHash: 'hashhh', deviceInfo: 'inffoo' };
        const { userId: id } = mockSession;
        await repository.create(mockSession);
        let count = await repository.countByUserId(id);
        expect(count).toBe(1);
        await repository.removeByUserId(id);
        count = await repository.countByUserId(id);
        expect(count).toBe(0);
      })
      it('Should remove the oldest session correctly using sort', async () => {
        await repository.create({ userId: 'u1', tokenJTIHash: 'old', deviceInfo: 'd1' });
        await new Promise(r => setTimeout(r, 50));
        await repository.create({ userId: 'u1', tokenJTIHash: 'new', deviceInfo: 'd1' });

        await repository.removeOldest('u1');

        const remaining = await repository.findByUserId('u1');
        expect(remaining.length).toBe(1);
        expect(remaining[0].tokenJTIHash).toBe('new');
      });

    });

  });
});