import { gql } from "graphql-request";

export const LOGIN_MUTATION = gql`
mutation Login($email:String!, $password:String!, $deviceInfo:String){
  login(email:$email, password:$password, deviceInfo:$deviceInfo){
    accessToken
    refreshToken
  }
}`
export const REFRESH_MUTATION = gql`
mutation Refresh($jti:String!){
  refreshTokens(token:$jti){
    accessToken
    refreshToken
  }
}`
