import 'dotenv/config';
import express from 'express';
import { createRouter } from '@/router';
import { checkEnvFile } from '@/helpers';
import { initDatabase } from '@/models/model';
import { initGraphqlMiddleware } from './graphql/graphqlServer';
import { ResourcesService, MailingService, AuthService, SongService, UserService, SessionService, ActivationService, LikeService, PlaylistService, } from '@/services';
import { errorHandler } from '@/middleware/errorHandler';
import { ISongsProvider } from '@/interfaces';
import path from 'node:path';
import { SongRepository, UserRepository, SessionRepository, PlayListRepository, LikeRepository } from '@/repositories';
import { PORT } from './constants';
import { SsrController, ResourcesController } from '@/controllers';
import { initGraphqlMiddlewareProps, SsrConstructorProps } from './types/types';
import { MicroServiceProvider } from '@/providers/music/microService';
import { NodeMailer } from './providers';

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

    const songRepository = new SongRepository();

    const userRepository = new UserRepository();

    const userService = new UserService(userRepository);
    const sessionRepository = new SessionRepository();
    const sessionService = new SessionService(sessionRepository);
    const authService = new AuthService(userRepository, sessionService);
    const providers: ISongsProvider[] = [new MicroServiceProvider(authService)];
    const songService = new SongService(providers, songRepository);
    const mailService = new MailingService(new NodeMailer());
    const activationService = new ActivationService(userRepository, mailService, authService);
    const resourcesService = new ResourcesService();
    const resourcesController = new ResourcesController(resourcesService, authService);
    const likeRepo = new LikeRepository();
    const likeService = new LikeService(likeRepo);
    const playlistService = new PlaylistService(new PlayListRepository());

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
    const graphqlProps: initGraphqlMiddlewareProps = {
      songService, authService, likeService, playlistService, userService,
    }
    const graphql = await initGraphqlMiddleware(graphqlProps);
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

