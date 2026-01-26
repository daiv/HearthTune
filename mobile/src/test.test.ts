import { useState } from "react";
import { SEARCH_SONGS } from "./graphql/queries";
import { useGraphQl } from "./hooks/useGraphql";

describe('Tdd', () => {

  it('Jest should pass an empty test', () => { });

  describe('useGraphql', () => {

  });
  describe('graphql', () => {
    const mockComponent = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const { data, isLoading } =
        useGraphQl(
          SEARCH_SONGS,
          { text: searchQuery },
          { enabled: searchQuery.length > 3 });

      return null;
    }
    beforeAll(() => {

    });
    it('Should get data from server', async () => {

    })
  })
})