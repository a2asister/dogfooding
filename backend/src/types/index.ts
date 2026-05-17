export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Dashboard {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  config: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
}
