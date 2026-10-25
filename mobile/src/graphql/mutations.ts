import { gql } from "graphql-request";

export const LOGIN_MUTATION = gql`
mutation Login($email:String!, $password:String!,$deviceId:String!, $deviceInfo:String){
  login(email:$email, password:$password, deviceId:$deviceId, deviceInfo:$deviceInfo){
    accessToken
    refreshToken
  }
}`;

export const REFRESH_MUTATION = gql`
mutation Refresh($jti:String!){
  refreshTokens(token:$jti){
    accessToken
    refreshToken
  }
}`;

export const LOGOUT_MUTATION = gql`
mutation Logout($jti:String!){
  logout(jti:$jti)
}`;

export const CHANGE_NICK_MUTATION = gql`
mutation ChangeNick($nick:String!){
  changeNick(newNick:$nick){
    nick
  }
}`;

export const CHANGE_PASS_MUTATION = gql`
  mutation ChangePassword($old:String!, $new:String!){
    changePassword(oldPass:$old, newPass:$new)
  }`;

export const TOGGLE_MUTATION = gql`
  mutation Toggle($songId:String!){
    toggleLikeSong(songId:$songId)
  }`;

export const SAVE_PLAYLIST_MUTATION = gql`
        mutation SavePlaylist($id: ID, $title: String!, $songs: [String]) {
        savePlaylist(id:$id, title: $title, songs: $songs) {
          id
          title
          userId
            songs {
            id
            title
          }
        }
      }
      `;

export const REMOVE_PLAYLIST_MUTATION = gql`
        mutation RemovePlaylist($id:ID!){
          removePlaylist(id:$id)
        }`;
