import { describe, expect, it, } from '@jest/globals';
import { loginService, refreshService } from './services/authService';
import { searchSongsFromServer } from './services/musicService';
import { gqlManager } from './graphql/GraphQLClientManager';

describe('tests', () => {

  it('Should work', () => {
    expect(1 + 1).toBe(2);
  });
  describe('Graph', () => {
    it('Should communicate with server', async () => {
      try {
        const [email, password] = ['', ''];

        const tokens = await loginService(email, password);
        console.log('tokens from test are', tokens);
        const newTestTokens = await refreshService(tokens.refreshToken);
        gqlManager.setAuthToken(newTestTokens);
        console.log('tokens refreshed by tests', newTestTokens);
        gqlManager.setTokenRefreshHandler(refreshService);

        const clientTokens = gqlManager.getAuthTokens();
        expect(clientTokens).not.toBeNull();
        console.log('clientTokens are', clientTokens);
        const realSearch = await searchSongsFromServer('fito');
        console.log('search is', realSearch);
      } catch (error) {
        console.log('error was', error);
      }


    }, 15000);
  });


});