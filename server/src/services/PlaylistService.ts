import { Playlist } from "@/common/types";
import { MAX_PLAYLISTS } from "@/constants";
import { BadRequestException, ForbiddenException, PlaylistLimitReachedException } from "@/errors/ServerError";
import { IPLaylistService } from "@/interfaces/IPlaylistService";
import { PlayListRepository } from "@/repositories";
import { Role } from "@/types/types";

export class PlaylistService implements IPLaylistService {
  constructor(private playlistRepo: PlayListRepository) { }

  async getPlaylistsByUserId(userId: string): Promise<Playlist[]> {
    return await this.playlistRepo.getLists(userId);
  }

  async getPlaylistById(id: string, userId: string): Promise<Playlist | null> {
    const playlist = await this.playlistRepo.getListById(id);
    if (playlist && playlist.userId === userId) return playlist;

    return null;
  }

  async savePlaylist(list: Playlist, userId: string, role: Role): Promise<Playlist | null> {
    if (!list || !userId || !role) return null;
    const isNewPlaylist = !list.id;
    let playlistToSave = { ...list };
    if (isNewPlaylist) {
      const existingUserPlaylists = await this.playlistRepo.getLists(userId);
      if (existingUserPlaylists.length >= MAX_PLAYLISTS[role]) throw new PlaylistLimitReachedException();
      playlistToSave.userId = userId;
    } else {
      if (!playlistToSave.id) throw new BadRequestException();

      const existingPlaylist = await this.playlistRepo.getListById(playlistToSave.id);
      if (!existingPlaylist || existingPlaylist.userId !== userId) throw new ForbiddenException();

      if (!playlistToSave.songs || playlistToSave.songs.length === 0)
        playlistToSave.songs = existingPlaylist.songs;
    }

    return await this.playlistRepo.saveList(playlistToSave);
  }

  async removePlaylist(listId: string, userId: string): Promise<boolean> {
    return await this.playlistRepo.removeList(listId, userId);
  }

}