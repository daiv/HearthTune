import { ISongService } from "../interfaces/ISongService";

export type Song = {
  id: string;
  title: string;
  duration: string;
  description: string;
}
export type resolverContext = {
  songService: ISongService;
}