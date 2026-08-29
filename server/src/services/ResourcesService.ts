import { IResourcesService } from "@/interfaces/IResourcesService";
import { join } from "node:path";

export class ResourcesService implements IResourcesService {
  private readonly PATH = join(process.cwd(), 'storage', 'artifacts',);

  getAndroidAppDownloadPath = () => this.PATH + '/mockAndroid.apk';
}