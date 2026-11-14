import { Provider, Song } from "@/common/types";
import { ISongsProvider, IAuthService } from "@/interfaces";
import { Readable } from "node:stream";

export class MicroServiceProvider implements ISongsProvider {
  readonly PROVIDER: Provider = 'Main';
  readonly FILE_EXTENSION = "m4a";
  readonly URL = process.env.MICROSERVICE_URL;

  constructor(private authService: Pick<IAuthService, 'createMicroserviceToken'>) { }

  isValidId(id: string): boolean {
    const regex = /^[a-zA-Z0-9_-]{11}$/;
    return regex.test(id);
  }

  private addHeaders(expiresAt: string, signature: string) {
    return {
      headers: {
        'x-expires-at': expiresAt,
        'x-signature': signature
      }
    }
  }

  async searchSongs(query: string, limit: number = 50): Promise<Song[]> {
    console.log('searching in ', this.URL);
    const { expiresAt, signature } = this.authService.createMicroserviceToken();
    const response = await fetch(`${this.URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`, this.addHeaders(expiresAt, signature));

    if (!response.ok) throw new Error(`error searching songs ${response.statusText}`);
    return response.json();
  }

  async getRelated(id: string, numberOfSongs: number): Promise<Song[]> {
    const { expiresAt, signature } = this.authService.createMicroserviceToken();
    const rawResponse = await fetch(`${this.URL}/related/${id}/${numberOfSongs}`, this.addHeaders(expiresAt, signature));
    if (!rawResponse.ok) throw new Error(`error getting related ${rawResponse.statusText}`);
    const response = await rawResponse.json();
    return response.relatedSongs;
  }
  async getAudioStream(id: string): Promise<Readable> {
    const { expiresAt, signature } = this.authService.createMicroserviceToken();
    const response = await fetch(`${this.URL}/audio/${id}`, this.addHeaders(expiresAt, signature));

    if (!response.ok || !response.body) throw new Error(`error getting audio stream: ${response.statusText}`);

    return Readable.fromWeb(response.body as unknown as import("node:stream/web").ReadableStream);
  }
}