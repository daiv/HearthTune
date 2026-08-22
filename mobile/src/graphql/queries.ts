import { gql } from "graphql-request";

export const SEARCH_SONGS = gql`
    query searchSongs($query:String!){
      search(query:$query){
        id
        title
        duration
        local
        provider
        url
      }
    }`;

export const SEARCH_LOCALLY = gql`
query searchLocally($query:String!){
  searchLocally(query:$query){
    id
    title
    duration
    local
    provider
    url
  }
}`;

export const GET_RELATED_SONGS = gql`
    query getRelated($id: ID!, $numberOfSongs: Int!) { 
      getRelated(id: $id, numberOfSongs: $numberOfSongs) {    
        id
        title
        duration
        local
        provider
        url
      }
    }
`;
export const GET_SIGNED_URL = gql`
query getSignedUrl($songId:ID!, $provider:String!){
  getSignedUrl(songId:$songId, provider:$provider){
    signedUrl
  }
}
`