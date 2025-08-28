export class ConfigKeys {
  // Database Configuration
  public static readonly DB_HOST_NAME = 'DB_HOST_NAME';
  public static readonly DB_NAME = 'DB_NAME';
  public static readonly DB_PORT = 'DB_PORT';
  public static readonly DB_USER = 'DB_USER';
  public static readonly DB_PASSWORD = 'DB_PASSWORD';

  // JWT Configuration
  public static readonly JWT_SECRET = 'JWT_SECRET';
  public static readonly JWT_EXPIRATION_TIME = 'JWT_EXPIRATION_TIME';

  // Application Configuration
  public static readonly APP_PORT = 'PORT';
  public static readonly APP_URL = 'APP_URL';

  // Email Configuration
  public static readonly EMAIL_HOST = 'EMAIL_HOST';
  public static readonly EMAIL_PORT = 'EMAIL_PORT';
  public static readonly EMAIL_SECURE = 'EMAIL_SECURE';
  public static readonly EMAIL_USERNAME = 'EMAIL_USERNAME';
  public static readonly EMAIL_PASSWORD = 'EMAIL_PASSWORD';
  public static readonly EMAIL_FROM = 'EMAIL_FROM';
  public static readonly EMAIL_SENDER_NAME = 'EMAIL_SENDER_NAME';

  // Email Template URLs
  public static readonly EMAIL_CONFIRMATION_URL = 'EMAIL_CONFIRMATION_URL';
  public static readonly RESET_PASSWORD_URL = 'RESET_PASSWORD_URL';

  // Stripe Configuration
  public static readonly STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY';
  public static readonly STRIPE_WEBHOOK_SECRET = 'STRIPE_WEBHOOK_SECRET';

  // Redis Configuration
  public static readonly REDIS_HOST = 'REDIS_HOST';
  public static readonly REDIS_PORT = 'REDIS_PORT';
  public static readonly REDIS_PASSWORD = 'REDIS_PASSWORD';

  // File Upload Configuration
  public static readonly MAX_FILE_SIZE = 'MAX_FILE_SIZE';
  public static readonly UPLOAD_PATH = 'UPLOAD_PATH';

  // Timezone Configuration
  public static readonly TIMEZONE = 'TIMEZONE';

  // OTP Configuration
  public static readonly OTP_EXPIRY_MINUTES = 'OTP_EXPIRY_MINUTES';

  // Two Factor Authentication
  public static readonly TWO_FACTOR_AUTH_TOKEN_SECRET = 'TWO_FACTOR_AUTH_TOKEN_SECRET';
  public static readonly TWO_FACTOR_AUTH_TOKEN_SECRET_EXPIRATION_TIME = 'TWO_FACTOR_AUTH_TOKEN_SECRET_EXPIRATION_TIME';

  // OAuth Configuration
  public static readonly GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID';
  public static readonly FACEBOOK_APP_ID = 'FACEBOOK_APP_ID';
  public static readonly LINKEDIN_CLIENT_ID = 'LINKEDIN_CLIENT_ID';
  public static readonly APPLE_CLIENT_ID = 'APPLE_CLIENT_ID';

  // Firebase Configuration
  public static readonly FCM_CREDENTIALS = 'FCM_CREDENTIALS';

  // Logging Configuration
  public static readonly LOGGING_PROVIDER = 'LOGGING_PROVIDER';
  public static readonly LOGGING_DIR_NAME = 'LOGGING_DIR_NAME';

  // Environment
  public static readonly NODE_ENV = 'NODE_ENV';

  // Geolocation
  public static readonly DEFAULT_GEOLOCATION_RADIUS = 'DEFAULT_GEOLOCATION_RADIUS';
}

export class ConfigConstants {
  public static readonly DB_TYPE = 'postgres';
  public static readonly AUTH_PROVIDER_DI_KEY = 'AUTH_PROVIDER';
  public static readonly AUTH_PROVIDER_STRATEGY_DI_KEY = 'AUTH_PROVIDER_STRATEGY';
  public static readonly DEFAULT_TIMEZONE = 'Australia/Brisbane';
  public static readonly DEFAULT_GEOLOCATION_RADIUS = 3000; // 3km in meters
}

export class DependencyInjectionKeys {
  public static readonly AUTH_PROVIDER = 'AUTH_PROVIDER';
  public static readonly AUTH_PROVIDER_STRATEGY = 'AUTH_PROVIDER_STRATEGY';
  public static readonly PUSH_MESSAGING = 'PUSH_MESSAGING';
  public static readonly EMAIL = 'EMAIL';
  public static readonly SMS = 'SMS';
  public static readonly TEMPLATE_STORAGE = 'TEMPLATE_STORAGE';
  public static readonly TEMPLATE_ENGINE = 'TEMPLATE_ENGINE';
  public static readonly RANDOM_CODE_GENERATOR = 'RANDOM_CODE_GENERATOR';
  public static readonly ERROR_MESSAGE_TRANSLATOR = 'ERROR_MESSAGE_TRANSLATOR';
  public static readonly ASYNC_LOCAL_STORAGE = 'ASYNC_LOCAL_STORAGE';
  public static readonly QR_CODE_GENERATOR = 'QR_CODE_GENERATOR';
  public static readonly PAYMENT_PROCESSOR = 'PAYMENT_PROCESSOR';
  public static readonly GEOLOCATION_SERVICE = 'GEOLOCATION_SERVICE';
}
