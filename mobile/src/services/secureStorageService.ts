import Keychain from 'react-native-keychain';

const SECURE_TOKEN_STORAGE_SERVICE = 'com.HearthTune.auth.tokens';
const SECURE_DEVICE_ID_STORAGE_SERVICE = 'com.HearthTune.auth.deviceid';

export const saveRefreshSecure = async (refreshToken: string) => {
  await saveData(refreshToken, SECURE_TOKEN_STORAGE_SERVICE);
}
export const getRefreshSecure = async (): Promise<string | null> => {
  return await getData(SECURE_TOKEN_STORAGE_SERVICE);
}
export const removeRefreshSecure = async () => {
  await removeData(SECURE_TOKEN_STORAGE_SERVICE);
}
export const saveDeviceIdSecure = async (deviceId: string) => {
  await saveData(deviceId, SECURE_DEVICE_ID_STORAGE_SERVICE);
}
export const getDeviceIdSecure = async (): Promise<string | null> => {
  return await getData(SECURE_DEVICE_ID_STORAGE_SERVICE);
}
export const removeDeviceIdSecure = async () => {
  await removeData(SECURE_DEVICE_ID_STORAGE_SERVICE);
}
const saveData = async (data: string, service: string) => {
  try {

    await Keychain.setGenericPassword('auth_session', JSON.stringify(data), {
      service
    });
  } catch (error) {
    console.error('error saving data');
  }
}
const getData = async (service: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service
    });
    if (credentials) {
      const data: string = JSON.parse(credentials.password);
      return data;
    }
  } catch (error) {
    console.error('error getting data');
  }
  return null;
}
const removeData = async (service: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service });
  } catch (error) {
    console.error('error deleting data');
  }
}