import 'dotenv/config';
import express from 'express';
import { createRouter } from './router';
import { checkEnvFile } from './helpers';
import { initDatabase } from './models/model';
import { initGraphqlMiddleware } from './graphql/graphqlServer';
import { YtDlpProvider } from '@/providers'
import { SongRepository, SongService } from '@/services';

const app = express();
const PORT = 4000;

(async function startServer() {
  try {
    checkEnvFile();
    await initDatabase();
    app.use(express.json());
    const provider = new YtDlpProvider();
    const songRepository = new SongRepository();
    const songService = new SongService(provider, songRepository);
    const graphql = await initGraphqlMiddleware(songService);
    app.use('/graphql', graphql);
    app.use(createRouter(songService));
    app.listen(PORT, () => { console.log('server is up and listening to port ', PORT) });

  } catch (error: unknown) {
    if (error instanceof Error)
      console.error('Unable to start server', error.message);
    process.exit(1);
  }
})();

