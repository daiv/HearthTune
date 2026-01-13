import { ISongService } from "../interfaces/ISongService";
import { ISongsProvider } from "../interfaces/ISongsProvider";

export class SongService implements ISongService {
  MAX_LIMIT = 10;

  constructor(private provider: ISongsProvider) { }

  async search(query: string, limit: number) {

    const sanitizedQuery = query
      .replace(/[^\w\s\u00C0-\u017F!$&\-\.\+_]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const clampedLimit = Math.min(Math.max(1, limit), this.MAX_LIMIT);

    return this.provider.searchSongs(sanitizedQuery, clampedLimit);
  }
}