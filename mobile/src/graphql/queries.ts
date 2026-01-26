import { gql } from "graphql-request";

export const SEARCH_SONGS = gql`
    query searchSongs($query:String!){
      search(query:$query){
        id
        title
      }
    }`;