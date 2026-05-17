import 'dotenv/config';
import express from 'express';
import { createRouter } from './router';
import { checkEnvFile } from './helpers';
import { initDatabase } from './models/model';
import { initGraphqlMiddleware } from './graphql/graphqlServer';
import { YoutubeProvider, SoundCloudProvider } from '@/providers'
import { SongRepository, SongService } from '@/services';
import { MockProvider } from './mocks/MockProvider';
import { errorHandler } from './middleware/errorHandler';
import { ISongsProvider } from './interfaces';
import { UserRepository } from './repositories/UserRepository';

const app = express();
const PORT = 4000;

(async function startServer() {
  try {
    checkEnvFile();
    await initDatabase();
    const providers: ISongsProvider[] = [new YoutubeProvider(), /* new SoundCloudProvider() */];
    // const provider = new MockProvider();
    const songRepository = new SongRepository();
    const songService = new SongService(providers, songRepository);

    const userRepository = new UserRepository();
    

    app.use(express.json());
    app.use(createRouter(songService));

    const graphql = await initGraphqlMiddleware(songService);
    app.use('/graphql', graphql);

    app.use(errorHandler);

    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });

  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to start server', error.message);
    process.exit(1);
  }
})();

