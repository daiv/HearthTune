import { Request, Response } from 'express';
import { ISongService } from '../interfaces/ISongService';
import { InvalidIdException, ServerError } from '@/errors/ServerError';

export class SongController {
  constructor(private service: ISongService) { }

  playSong = (async (req: Request, res: Response) => {
    const { user } = { user: 'developer' };//req.header 
    const { id, provider = 'Youtube' } = req.params;
    console.log('client asked for id ' + id);

    try {
      const audioSource = await this.service.getAudioSource(id, provider);
      console.log('type is', audioSource.type);
      if (audioSource.type === 'local') return res.sendFile(audioSource.localPath);
      else if (audioSource.type === 'external') {
        res.writeHead(200, {
          'content-type': 'audio/m4a',
          'transfer-encoding': 'chunked',
          'connection': 'keep-alive',
          "accept-ranges": 'none',
          'X-Content-Type-Options': 'nosniff'
        });

        res.on('close', () => {
          audioSource.stream.unpipe(res);
          console.log('user disconnected but song still downloading in server ');
        });
        return audioSource.stream.pipe(res);
      }
    } catch (error) {
      console.error('error ', error);
      if (error instanceof Error) {
        if (error.message == 'Bad id') {
          throw new InvalidIdException(id, provider);
        } else {
          throw new ServerError();
        }
      } else {
        throw new ServerError('Unknown error');
      }
    }
  });
}