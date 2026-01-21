import { Readable } from "node:stream";
import { ISongsProvider } from "@/interfaces";
import { RawSong, Song } from "../types/types";

export class MockProvider implements ISongsProvider {
  searchSongs(query: string, limit: number = 10): Promise<RawSong[]> {
    return new Promise(resolve => {
      if (limit > 10) limit = 10;
      resolve(mockSongs.slice(0, limit));
    });
  }
  getAudioStream(id: string): Promise<Readable> {
    return new Promise(resolve => resolve(new Readable({ read() { } })));
  }
  isValidId(id: string): boolean {
    const regex = /^[a-zA-Z0-9_-]{11}$/;
    return regex.test(id);
  }
  async getRelated(id: string): Promise<RawSong[]> {
    return mockSongs;
  }
}

export const mockSongs: RawSong[] = [
  {
    id: 'vkHd4ejXrAE',
    description: null,
    duration: 209,
    title: '5 sentidos - Dvicio / Taburete (Letra)'
  },
  {
    id: 'r7kPoxLabGg',
    description: null,
    duration: 536,
    title: 'Week end à Valence - #2 - Chulilla et Fuente de los Banos'
  },
  {
    id: 'kZqaX66KdfM',
    description: null,
    duration: 540,
    title: '5 sentidos Dvicio Ft Taburete Cover y como tocar la canción en Ukulele 🎶'
  },
  {
    id: '1N_RqUQrk6M',
    description: null,
    duration: 487,
    title: 'Mini album Bundle of joy INSPIRACIÓN'
  },
  {
    id: 'fAHq_vH8H1U',
    description: null,
    duration: 779,
    title: 'Porto Grenoble Mai 2019'
  },
  {
    id: 'lTV6KedU3Q8',
    description: null,
    duration: 147,
    title: 'Top  canciones  para  Carnaval'
  },
  {
    id: 'P1WUQGmsBHA',
    description: null,
    duration: 213,
    title: 'Dvicio-Taburete, 5 sentidos (lyrics, letra )'
  },
  {
    id: '5hU3mTRz65E',
    description: null,
    duration: 322,
    title: 'Como componer un éxito de reggaetón (La fórmula Danza Koduro)'
  },
  {
    id: 'STh3vrD5NhI',
    description: null,
    duration: 30,
    title: 'Filtro del tartazo para Dvicio'
  },
  {
    id: 'Xt3mwc_ctUQ',
    description: null,
    duration: 159,
    title: '【Nightcore】→ 5 Sentidos'
  }
]


