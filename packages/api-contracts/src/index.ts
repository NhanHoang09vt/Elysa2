import { CharacterEntity, ItemEntity, WeaponEntity, Gender, ClassId, PrimaryAttributes, CharacterAppearance } from '@elysia/game-types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface CreateCharacterRequest {
  name: string;
  gender: Gender;
  classId: ClassId;
  appearance?: CharacterAppearance;
  stats?: PrimaryAttributes;
}
