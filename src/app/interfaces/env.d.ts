declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    APP_NAME: string;
    SALT_ROUNDS: number;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRESIN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRESIN: string;
    SUPER_ADMIN_NAME: string;
    SUPER_ADMIN_PASSWORD: string;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_CONTACT_NUMBER: string;
    TWILIO_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    APP_EMAIL_ADDRESS: string;
    EMAIL_APP_PASS: string;
    SUPABASE_BUCKET_URL: string;
    SUPABASE_BUCKET_KEY: string;
    USER_BUCKET: string;
    GENERAL_BUCKET: string;
  }
}
