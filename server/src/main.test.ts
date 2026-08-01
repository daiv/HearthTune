import mongoose from "mongoose";
import { MockProvider } from "./mocks/MockProvider";
import express from 'express';
import { initGraphqlMiddleware } from "./graphql/graphqlServer";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import { Server } from "node:http";
import { DownloadStatus, Song } from "@/common/types";
import { AuthService, SongService, UserService, ActivationService, SessionService } from "@/services";
import { describe, it, expect, afterAll, beforeAll, jest, beforeEach, afterEach } from '@jest/globals';
import { CreateUserDto, Role, Session, User } from "./types/types";
import { UserRepository, SongRepository, SessionRepository } from "@/repositories/";
import { UserModel, SessionModel } from "@/models/";
import { createValidationCredentials, hashData } from "./helpers";
import { ServerError } from "./errors/ServerError";

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

    it('song/search -> Should clamp the limit of songs', async () => {
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
    const sessionRepository = new SessionRepository();
    const sessionService = new SessionService(sessionRepository);
    const authService = new AuthService(userRepository, sessionService);
    const GRAPH = '/graphql';
    let httpServer: Server;
    const uniqueDevId: string[] = [];
    for (let i = 0; i < 100; i++) uniqueDevId.push(`$devId-${i}`);

    const Query = {
      query: {
        search: `
          query find($searchString:String!, $max: Int){
          search(query:$searchString, limit:$max){
          id,
          title, 
          description,
          duration}
          }`,
      },
      mutation: {
        login: `
        mutation loginTest($email:String!, $pass:String!, $deviceId: String!, $deviceInfo:String){
        login(email:$email, password:$pass, deviceId:$deviceId, deviceInfo:$deviceInfo){
        accessToken
        refreshToken
        }}`,
        refresh: `
        mutation refresh($refreshJTI:String!){
        refreshTokens(token:$refreshJTI){
        accessToken
        refreshToken
        }}`,
      }
    }

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
          },
          metadata: {
            deviceInfo: 'Pixel-8 | Android 10',
            appVersion: '1.0.0'
          }
        })
      );
      server.use(GRAPH, graphql);
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
        { id: '9Yp3lc3PsjA', title: 'Test Song', description: 'desc', duration: 100, source: 'Youtube' }
      ]);
      const vars = { searchString: '9Yp3lc3PsjA', max: 1 }
      const response = await request.post(GRAPH)
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
      const response = await request.post(GRAPH)
        .send({ query: relatedQuery, variables: vars });
      const { getRelated: songs } = response.body.data;
      expect(songs[0]).toHaveProperty("id");
      expect(songs[0]).toHaveProperty("title");
      expect(songs).toHaveLength(10);

    });
    describe('Auth Tests', () => {
      const activationService = new ActivationService(userRepository);
      describe('Login tests', () => {
        let userToCreate: CreateUserDto;
        let createdUser: User;
        beforeAll(async () => {
          userToCreate = {
            email: 'mock@mockmail.com',
            password: '1234',
            role: 'basic'
          }
          createdUser = await userService.createUser(userToCreate);
        });

        it('Should throw error when login in a not active account', async () => {
          const vars = {
            email: userToCreate.email, pass: userToCreate.password,
            deviceId: uniqueDevId.pop(), deviceInfo: 'Android'
          };
          const response = await request.post(GRAPH)
            .send({ query: Query.mutation.login, variables: vars });
          expect(response.error).toBeDefined();
          // expect(response.body.data.login).toBeNull();
          expect(response.body.errors[0].extensions.code).toBe('AccountNotActiveException');
        });

        it('Should throw error if credentials are incorrect ', async () => {
          const vars = { email: userToCreate.email, pass: '032w', deviceId: uniqueDevId.pop(), deviceInfo: 'Android' };
          const response = await request.post(GRAPH)
            .send({ query: Query.mutation.login, variables: vars });
          expect(response.error).toBeDefined();
          expect(response.body.data.login).toBeNull();
          expect(response.body.errors[0].extensions.code).toBe('InvalidCredentialsException');
        });

        it('Should return tokens when credentials are ok', async () => {
          await activationService.enableUserAccount(createdUser.id);
          const vars = {
            email: userToCreate.email, pass: userToCreate.password,
            deviceId: uniqueDevId.pop(), deviceInfo: 'Android'
          };
          const response = await request.post(GRAPH)
            .send({ query: Query.mutation.login, variables: vars });
          expect(response.body).toBeTruthy();
          expect(response.body.data.login).not.toBeNull();
          expect(response.body.data.login).toHaveProperty('accessToken');
          expect(response.body.data.login).toHaveProperty('refreshToken');
        });
      });

      describe('Refresh tests', () => {
        let activeUser: User;
        beforeAll(async () => {
          const userDTO: CreateUserDto = {
            email: 'active@email.com',
            password: '1234',
          }
          activeUser = await userService.createUser(userDTO);
          activeUser.password = userDTO.password;
          await activationService.enableUserAccount(activeUser.id);
        });

        it('Should not refresh tokens if session does not exist', async () => {
          const variables = { refreshJTI: 'asdf' };
          const response = await request.post(GRAPH)
            .send({ query: Query.mutation.refresh, variables });
          expect(response.error).toBeDefined();
          expect(response.body.data.refreshTokens).toBeNull();
          expect(response.body.errors[0].extensions.code).toBe('InvalidTokenException');
        });

        it('Should invalidate last token when refreshing session', async () => {
          const JTI = 'longAndRandomJTI';
          await sessionService.add(activeUser.id, JTI, 'user', 'testingDevice');
          const currentSession = await sessionService.getSessionByJti(JTI);
          let activeSessions = await sessionService.countSessions(activeUser.id);
          expect(currentSession).not.toBe(undefined);
          expect(currentSession?.JTI).toBe(hashData(JTI));
          expect(activeSessions).toBe(1);

          const variables = { refreshJTI: JTI }
          const response = await request.post(GRAPH)
            .send({ query: Query.mutation.refresh, variables });

          const oldSession = await sessionService.getSessionByJti(JTI);

          expect(oldSession).toBeNull();
          activeSessions = await sessionService.countSessions(activeUser.id);
          expect(activeSessions).toBe(1);
          const { refreshToken, accessToken } = response.body.data.refreshTokens;
          expect(refreshToken).not.toBe(null);
          expect(accessToken).not.toBe(null);
          expect(refreshToken).not.toBe(hashData(JTI));
          expect(response.body.data.refreshTokens).toHaveProperty('accessToken');
          expect(response.body.data.refreshTokens).toHaveProperty('refreshToken');
        });
      });
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
      lastPlayed: now,
      source: 'Unknown'
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
    const mockUser: User = {
      email: 'a@a.com',
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
        const response = await userRepo.getUserByEmail(mockUser.email);
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
      let activationService: ActivationService;
      let authService: AuthService;
      let sessionRepo: SessionRepository;
      let sessionService: SessionService;
      const uniqueEmails: string[] = []
      for (let i = 0; i < 10; i++) uniqueEmails.push(i + "@email.com");

      beforeAll(async () => {
        await UserModel.deleteMany({});
        userRepo = new UserRepository();
        userService = new UserService(userRepo);
        activationService = new ActivationService(userRepo);
        sessionRepo = new SessionRepository();
        sessionService = new SessionService(sessionRepo);
        authService = new AuthService(userRepo, sessionService);
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

      it('Should override user data when using save', async () => {
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

        const userInDb = await userRepo.getUserByEmail(email);
        if (!userInDb) throw new ServerError();
        expect(userInDb.id).toBe(createdUser.id);
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


      it('Should validate validationToken lifecycle', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        const credentials = createValidationCredentials();

        expect(await activationService.removeCredentials(user.id)).toBe(false);
        // 1. Invalid token case
        const invalidResult = await activationService.isValidationTokenLegit(credentials.token);
        expect(invalidResult.valid).toBe(false);
        expect((invalidResult as { cause: string }).cause).toBe('invalid token');

        // 2. Valid token case
        await userService.saveUser({ ...user, credentials });

        const validResult = await activationService.isValidationTokenLegit(credentials.token);

        expect(validResult.valid).toBe(true);
        const success = validResult as { valid: true; credentials: typeof credentials };
        expect(success.credentials).toEqual(credentials);

        // 3. Expired token case
        const expiredCredential = { ...credentials, expiresAt: new Date(Date.now() - 10) };
        await userService.saveUser({ ...user, credentials: expiredCredential });

        const expiredResult = await activationService.isValidationTokenLegit(expiredCredential.token);
        expect(expiredResult.valid).toBe(false);
        expect((expiredResult as { cause: string }).cause).toBe('token expired');

        expect(await activationService.removeCredentials(user.id)).toBe(true);
      });

      it('Should save password and check password lifecycle', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(user.password).toBeFalsy();
        const userPassword = 'iLoveUnicorns';
        expect(await authService.checkUserPassword(user.id, userPassword)).toBe(false);
        await userService.setUserPassword(user.id, userPassword);
        expect(await authService.checkUserPassword(user.id, 'notLovingUnicorns')).toBe(false);
        expect(await authService.checkUserPassword(user.id, userPassword)).toBe(true);

      });

      it('Should enable user Account if everything is ok', async () => {
        const userToEnable = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(userToEnable.activatedAt).toBeFalsy();
        const password = '12345isTheBestPassword';
        await userService.setUserPassword(userToEnable.id, password);
        await activationService.enableUserAccount(userToEnable.id);

        const user = await userService.getUserById(userToEnable.id);
        expect(user.activatedAt).toBeTruthy();
      });

      it('Should create and save userCredentials', async () => {
        const user = await userService.createUser({ email: uniqueEmails.pop()! });
        expect(user).not.toHaveProperty('credentials');
        const preparedUser = activationService.prepareUserCredentials(user);
        expect(preparedUser).toHaveProperty('credentials');
        if (!preparedUser.credentials) throw new Error('credentials missing');
        if (!preparedUser.credentials.token) throw new Error('token missing');

        const { token } = preparedUser.credentials;
        expect(await activationService.getUserByToken(token)).toBeFalsy();
        await userService.saveUser(preparedUser);
        const userByToken = await activationService.getUserByToken(token);
        if (!userByToken) throw new Error('user not found');
        expect(preparedUser.id).toEqual(userByToken.id);
      });
    });
  });

  describe('Session tests', () => {

    describe('Session Repository', () => {
      const uniqueDevId: string[] = [];
      for (let i = 100; i < 200; i++)uniqueDevId.push(`devId-${i}`);
      let repository: SessionRepository;

      beforeAll(() => {
        repository = new SessionRepository();
      });
      afterEach(async () => {
        await SessionModel.deleteMany({});
      });
      const deviceInfo = 'deviceInfo';
      it('Should count sessions correctly for a specific user', async () => {
        await repository.create({ userId: 'u1', JTI: 't1', deviceId: uniqueDevId.pop()!, deviceInfo, role: 'basic' });
        await repository.create({ userId: 'u1', JTI: 't2', deviceId: uniqueDevId.pop()!, deviceInfo, role: 'basic' });

        const count = await repository.countByUserId('u1');
        expect(count).toBe(2);
      });
      it('Should find sessions by token', async () => {
        const mockSession: Session = { userId: 'ut', JTI: 'token', deviceId: 'deviceId', deviceInfo: 'info', role: 'basic' };
        await repository.create(mockSession);
        const session = await repository.findByJti(mockSession.JTI);
        if (!session) throw new Error('session not found');
        expect(session.userId).toBe(mockSession.userId);
      });

      it('Should find sessions by userId', async () => {
        const mockSession: Session = { userId: 'favId', JTI: 'tokenhash', deviceId: uniqueDevId.pop()!, deviceInfo: 'android', role: 'basic' };
        await repository.create(mockSession);
        let session = await repository.findByUserId(mockSession.userId);
        expect(session.length).toBe(1);
        expect(session[0].JTI).toBe(hashData(mockSession.JTI));
        const mock2: Session = { userId: 'favId', JTI: 'tok2', deviceId: uniqueDevId.pop()!, deviceInfo: 'notAndroid', role: 'basic' };
        await repository.create(mock2);
        session = await repository.findByUserId(mock2.userId);
        expect(session.length).toBe(2);
        expect(session[1].JTI).toBe(hashData(mock2.JTI));
      });

      it('Should remove by tokenHash', async () => {
        const mockSession: Session = { userId: 'idi', JTI: 'hashhh', deviceInfo: 'inffoo', role: 'basic', deviceId: 'deviceId' };
        const { userId: id } = mockSession;
        await repository.create(mockSession);
        let count = await repository.countByUserId(id);
        expect(count).toBe(1);
        await repository.removeByUserId(id);
        count = await repository.countByUserId(id);
        expect(count).toBe(0);
      });

      it('Should remove the oldest session correctly using sort', async () => {
        const userId = 'u1';
        const session1: Session = { userId, JTI: 'old', deviceId: uniqueDevId.pop()!, deviceInfo: 'd1', role: 'basic' };
        await repository.create(session1);
        await new Promise(r => setTimeout(r, 50));
        const session2: Session = { userId, JTI: 'new', deviceId: uniqueDevId.pop()!, deviceInfo: 'd1', role: 'basic' };
        await repository.create(session2);

        await repository.removeOldest('u1');

        const remaining = await repository.findByUserId(userId);
        expect(remaining.length).toBe(1);
        expect(remaining[0].JTI).toBe(hashData(session2.JTI));
      });

    });
    describe('Session Service', () => {
      let repo: SessionRepository, service: SessionService;

      beforeAll(() => {
        repo = new SessionRepository();
        service = new SessionService(repo);
      });
      it('Should create sessions not exceding limits', async () => {
        const userId = 'mockId';
        const session = await service.add(userId, '1', 'basic', crypto.randomUUID());
        if (!session) throw new ServerError();
        expect(session.deviceInfo).toBe('Unknown device');
        let activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(1);
        const session2 = await service.add(userId, '2', 'basic', crypto.randomUUID());
        activeSessions = await repo.countByUserId(userId);
        //! basic can only have one open session 
        expect(activeSessions).toBe(1);

        const adminId = 'mockAdmin';
        await service.add(adminId, '3', 'admin', crypto.randomUUID());
        let activeAdminSessions = await repo.countByUserId(adminId);
        expect(activeAdminSessions).toBe(1);
        await service.add(adminId, '4', 'admin', crypto.randomUUID());
        activeAdminSessions = await repo.countByUserId(adminId);
        expect(activeAdminSessions).toBe(2);

      });

      it('Should delete sessions by userId', async () => {
        const userId = 'mockMockid';
        await service.add(userId, 'a', 'admin', 'deviceId');
        let activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(1);
        const delRes = await service.removeAll(userId);
        console.warn('delete count', delRes.deletedCount);
        activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(0);
        await service.add(userId, 'b', 'admin', 'deviceId-1');
        await service.add(userId, 'c', 'admin', 'deviceId-2');
        activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(2);
        await service.removeAll(userId);
        activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(0);
      });

      it('Should delete by JTI', async () => {
        const userId = 'mockingId';
        await service.add(userId, 'd', 'admin', 'deviceId');
        let activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(1);
        await service.remove('d');
        activeSessions = await repo.countByUserId(userId);
        expect(activeSessions).toBe(0);
      });

      it('Should get Session by jti', async () => {
        const userId = 'mockSessionId';
        await service.add(userId, 'e', 'admin', 'deviceId');
        const session = await service.getSessionByJti('e');
        if (!session) throw new ServerError();
        expect(session.JTI).toBe(hashData('e'));
      })
    });

  });
});