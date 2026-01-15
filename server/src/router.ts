import express, { Request, Response } from 'express';
import { YtDlpProvider } from './providers/ytdlp.provider';
import { SongService } from './services/SongService';
import { SongController } from './controllers/songController';

const router = express.Router();

const provider = new YtDlpProvider();
const service = new SongService(provider);
const songController = new SongController(service);

router.get('/', (_: Request, res: Response) => {
  res.send('server is listening!');
});
router.get('/song/search', songController.searchSong);
router.get('/song/play/:id', songController.playSong);


export default router;