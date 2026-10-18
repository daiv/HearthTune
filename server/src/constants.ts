import { RolePermission } from "./types/types";

export const PORT = 4000;

export const ROLE_HIERARCHY: RolePermission = {
  test: 1,
  basic: 1,
  recruiter: 2,
  user: 3,
  admin: 4,
  superAdmin: 10,
};

export const MAX_SESSIONS: RolePermission = {
  test: 1,
  basic: 1,
  recruiter: 1,
  user: 2,
  admin: 3,
  superAdmin: 10,
};

export const MAX_PLAYLISTS: RolePermission = {
  test: 5,
  recruiter: 1,
  basic: 5,
  user: 10,
  admin: 50,
  superAdmin: 50,
};
