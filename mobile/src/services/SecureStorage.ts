import Keychain, { Result } from 'react-native-keychain';

class SecureStorage {
  private SECURE_TOKEN_STORAGE_SERVICE = 'com.HearthTune.auth.tokens';
  private SECURE_DEVICE_ID_STORAGE_SERVICE = 'com.HearthTune.auth.deviceId';

  private tokenPromise: Promise<Result | false> | null = null;
  private idPromise: Promise<Result | false> | null = null;

  private async saveData(data: string, service: string): Promise<boolean> {

    const isToken = service === this.SECURE_TOKEN_STORAGE_SERVICE;
    let currentPromise = isToken ? this.tokenPromise : this.idPromise;

    if (!currentPromise) {
      currentPromise = Keychain.setGenericPassword('auth_session',
        data,
        { service })
        .finally(() => {
          if (isToken) this.tokenPromise = null;
          else this.idPromise = null;
        });

      if (isToken) this.tokenPromise = currentPromise;
      else this.idPromise = currentPromise;
    }
    try {
      const result = await currentPromise;
      return !!result;
    } catch (error) {
      console.error('error saving data', error);
      return false;
    }
  }

  private async getData(service: string): Promise<string | null> {
    try {
      const rawData = await Keychain.getGenericPassword({ service });
      if (rawData) {
        const data: string = rawData.password;
        return data;
      }
    } catch (error) {
      console.error('error getting data from ', service);
    }
    return null;
  }
  private async removeData(service: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service });
      return true;
    } catch (error) {
      console.error('error deleting from ', service);
      return false;
    }
  }

  async saveDeviceId(deviceId: string): Promise<boolean> {
    return await this.saveData(deviceId, this.SECURE_DEVICE_ID_STORAGE_SERVICE);
  }
  async getDeviceId(): Promise<string | null> {
    return await this.getData(this.SECURE_DEVICE_ID_STORAGE_SERVICE);
  }
  async deleteDeviceId(): Promise<boolean> {
    return await this.removeData(this.SECURE_DEVICE_ID_STORAGE_SERVICE);
  }

  async saveRefreshToken(refreshJTI: string): Promise<boolean> {
    const isSaveSuccessful = await this.saveData(refreshJTI, this.SECURE_TOKEN_STORAGE_SERVICE);
    return isSaveSuccessful;
  }

  async getRefreshToken(): Promise<string | null> {
    const recoveredToken = await this.getData(this.SECURE_TOKEN_STORAGE_SERVICE);
    return recoveredToken;
  }
  async deleteRefreshToken(): Promise<boolean> {
    return await this.removeData(this.SECURE_TOKEN_STORAGE_SERVICE);
  }
}

export const secureStorage = new SecureStorage();