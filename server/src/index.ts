import 'dotenv/config';
import express from 'express';
import { createRouter } from '@/router';
import { checkEnvFile } from '@/helpers';
import { initDatabase } from '@/models/model';
import { initGraphqlMiddleware } from './graphql/graphqlServer';
import { YoutubeProvider, NodeMailer } from '@/providers';
import { ResourcesService, MailingService, AuthService, SongService, UserService, SessionService, ActivationService, } from '@/services';
import { errorHandler } from '@/middleware/errorHandler';
import { ISongsProvider } from '@/interfaces';
import path from 'node:path';
import { SongRepository, UserRepository, SessionRepository } from '@/repositories';
import { PORT } from './constants';
import { SsrController, ResourcesController } from '@/controllers';
import { MockEmailProvider } from './mocks/MockEmailProvider';
import { SsrConstructorProps } from './types/types';

const app = express();

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
    const mailService = new MailingService(new MockEmailProvider());
    const activationService = new ActivationService(userRepository, mailService);
    const resourcesService = new ResourcesService();
    const resourcesController = new ResourcesController(resourcesService, authService);

    const ssrProps: SsrConstructorProps = {
      authService,
      mailService,
      resourcesService,
      sessionService,
      userService,
      activationService
    }
    const ssrController = new SsrController(ssrProps);

    app.use(express.json());
    app.use(
      createRouter(
        activationService,
        authService,
        songService,
        resourcesController,
        ssrController,
      ));

    await userService.createUsersFromEnv();
    await activationService.sendActivationLinkToWhiteListedUsers();

    const graphql = await initGraphqlMiddleware(songService, userService, authService);
    app.use('/graphql', graphql);

    app.use(errorHandler);

    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to start server', error.message);
    console.error(error);
    process.exit(1);
  }
})();

