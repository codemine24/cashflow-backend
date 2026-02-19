import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  app_name: process.env.APP_NAME,
  logo_url:
    "https://pjuhcpuddlpvqsbwrvyq.supabase.co/storage/v1/object/public/assets/LOGO2.png",
  company_address:
    "Shop #308, Level #3, Multiplan Computer City Centre, 69-71 New Elephant Road, Dhaka-1205",
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_contact_number: process.env.SUPER_ADMIN_CONTACT_NUMBER,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  salt_rounds: process.env.SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expiresin: process.env.JWT_ACCESS_EXPIRESIN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expiresin: process.env.JWT_REFRESH_EXPIRESIN,
  twilio_sid: process.env.TWILIO_SID,
  twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
  app_email_address: process.env.APP_EMAIL_ADDRESS,
  email_app_pass: process.env.EMAIL_APP_PASS,
  supabase_bucket_url: process.env.SUPABASE_BUCKET_URL,
  supabase_bucket_key: process.env.SUPABASE_BUCKET_KEY,
  user_bucket: process.env.USER_BUCKET,
  general_bucket: process.env.GENERAL_BUCKET,
  low_stock_threshold: 3,
  tax: 5,

  // server url
  server_url: process.env.SERVER_URL,
  client_url: process.env.CLIENT_URL,
};
