// User Management Enums
export enum UserType {
  ADMIN = 'admin',
  CARPARK_MANAGER = 'carparkManager',
  SUB_ADMIN = 'subAdmin',
  OFFICER = 'officer',
  USER = 'user',
}

export enum AdminAccessLevel {
  FULL = 'full',
  LIMITED = 'limited',
  READ_ONLY = 'read_only',
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CarparkManagerLevel {
  SENIOR = 'senior',
  JUNIOR = 'junior',
  TRAINEE = 'trainee',
}

export enum CarparkManagerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Booking System Enums
export enum BookingType {
  USER = 'user',
  WHITELIST = 'whitelist',
  SCHEDULE = 'schedule',
  VISITOR = 'visitor',
  WHITELABELED = 'whitelabeled',
}

export enum BookingStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  CHECKOUT = 'checkout',
}

// Parking Spot Enums
export enum ParkingSpotType {
  PARENT = 'parent',
  CHILD = 'child',
}

export enum ParkingSpotStatus {
  ACTIVE = 'Active',
  DISABLED = 'Disabled',
}

export enum CarParkType {
  RETAIL = 'Retail',
  RESIDENTIAL = 'Residential',
}

export enum SpotType {
  REGULAR = 'regular',
  DISABLED = 'disabled', 
  ELECTRIC = 'electric',
  COMPACT = 'compact',
  MOTORCYCLE = 'motorcycle',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order',
}

// Infringement System Enums
export enum InfringementStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum DisputeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Audit System Enums
export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Audit Log Action enum (used by audit-log.service)
export enum Action {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Authentication Enums
export enum AuthProvider {
  CREDENTIALS = 'credentials',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  APPLE = 'apple',
}

// Environment Enums
export enum Environment {
  LOCAL = 'LOCAL',
  DEV = 'DEV',
  QA = 'QA',
  PROD = 'PROD',
}

// Localization Enums
export enum Locale {
  ENGLISH = 'en',
  ARABIC = 'ar',
}

// Notification Enums
export enum NotificationEvent {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_EXPIRY = 'BOOKING_EXPIRY',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  INFRINGEMENT_NOTICE = 'INFRINGEMENT_NOTICE',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  DISPUTE_UPDATE = 'DISPUTE_UPDATE',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TEST = 'TEST',
}

// Payment Enums
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

// File Types
export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
}

// Gender Enum
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// OTP Types
export enum OtpCodeTypes {
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  TWO_FACTOR_VERIFICATION = 'TWO_FACTOR_VERIFICATION',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
}

// Template Types
export enum TemplateType {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum TemplateLanguage {
  EN = 'EN',
  AR = 'AR',
}

// Address Types
export enum AddressType {
  PERMANENT = 'Permanent',
  SHIPPING = 'Shipping',
  BUSINESS = 'Business',
}

// Secret Manager Provider
export enum SecretManagerProvider {
  AWS = 'AWS',
  GCP = 'GCP',
  AZURE = 'AZURE',
  NONE = 'NONE',
}

// Storage Types
export enum StorageType {
  DATABASE = 'DATABASE',
  FILE = 'FILE',
}

// Queue Job Types
export enum QueueJobType {
  EMAIL_NOTIFICATION = 'email_notification',
  SMS_NOTIFICATION = 'sms_notification',
  PUSH_NOTIFICATION = 'push_notification',
  BOOKING_EXPIRY_CHECK = 'booking_expiry_check',
  INFRINGEMENT_REMINDER = 'infringement_reminder',
  GENERATE_QR_CODE = 'generate_qr_code',
  PAYMENT_PROCESSING = 'payment_processing',
}
