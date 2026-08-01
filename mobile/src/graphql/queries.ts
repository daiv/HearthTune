import { gql } from "graphql-request";

export const SEARCH_SONGS = gql`
    query searchSongs($query:String!){
      search(query:$query){
        id
        title
        duration
        local
        source
        url
      }
    }`;

export const GET_RELATED_SONGS = gql`
    query getRelated($id: String!, $numberOfSongs: Int!) { 
      getRelated(id: $id, numberOfSongs: $numberOfSongs) {    
        id
        title
        duration
        local
        source
        url
      }
    }
`;
export const GET_SIGNED_URL = gql`
query getSignedUrl($songId:String!, $provider:String!){
  getSignedUrl(songId:$songId, provider:$provider){
    signedUrl
  }
}
`