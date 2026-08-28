export interface DbUser {
  id: number;
  googleSub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

declare global {
  interface Env {
    GOOGLE_CLIENT_ID: string;
    JWT_SECRET: string;
  }
}
