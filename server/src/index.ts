import 'dotenv/config';
import express from 'express';
import { createRouter } from './router';
import { checkEnvFile } from './helpers';
import { initDatabase } from './models/model';
import { initGraphqlMiddleware } from './graphql/graphqlServer';
import { YoutubeProvider } from '@/providers'
import { AuthService, SongService, UserService } from '@/services';
import { errorHandler } from './middleware/errorHandler';
import { ISongsProvider } from './interfaces';
import path from 'node:path';
import { SongRepository, UserRepository } from '@/repositories';
import { AuthController } from './controllers/AuthController';
import { ActivationService } from './services/ActivationService';
import { SessionService } from './services/SessionService';
import { SessionRepository } from './repositories/SessionRepository';

const app = express();
const PORT = 4000;

(async function startServer() {
  try {
    checkEnvFile();
    await initDatabase();

    app.set('view engine', 'ejs');

    const viewsPath = path.join(process.cwd(), 'src', 'views');
    app.set('views', viewsPath);
    console.log('views', viewsPath);
    app.use(express.urlencoded({ extended: true }));

    const providers: ISongsProvider[] = [new YoutubeProvider(), /* new SoundCloudProvider() */];
    // const provider = new MockProvider();
    const songRepository = new SongRepository();
    const songService = new SongService(providers, songRepository);

    const userRepository = new UserRepository();

    const userService = new UserService(userRepository);
    const sessionRepository = new SessionRepository();
    const sessionService = new SessionService(sessionRepository);
    const authService = new AuthService(userRepository, sessionService);
    const activationService = new ActivationService(userRepository);
    const authController = new AuthController(activationService, userService);

    app.use(express.json());
    app.use(createRouter(songService, activationService, authController));

    await userService.createUsersFromEnv();
    await activationService.sendActivationLinkToWhiteListedUsers();

    const graphql = await initGraphqlMiddleware(songService, userService, authService);
    app.use('/graphql', graphql);

    app.use(errorHandler);

    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });

  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to start server', error.message);
    process.exit(1);
  }
})();

