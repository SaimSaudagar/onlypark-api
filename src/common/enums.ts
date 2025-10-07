// User Management Enums
export enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CARPARK_MANAGER = 'CARPARK_MANAGER',
  PATROL_OFFICER = 'PATROL_OFFICER',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export enum AdminStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum CarparkManagerStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum PatrolOfficerStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

// Booking System Enums
export enum VisitorBookingStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  CHECKOUT = 'Checkout',
  UNAUTHENTICATED = 'Unauthenticated',
}

export enum WhitelistStatus {
  ACTIVE = 'Active',
  CHECKOUT = 'Checkout',
}

// Parking Spot Enums
export enum ParkingSpotType {
  PARENT = 'Parent',
  CHILD = 'Child',
}

export enum ParkingSpotStatus {
  ACTIVE = 'Active',
  DISABLED = 'Disabled',
}

export enum BlacklistStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum CarParkType {
  COMMERCIAL = 'Commercial',
  RESIDENTIAL = 'Residential',
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  MAINTENANCE = 'Maintenance',
  OUT_OF_ORDER = 'Out of Order',
}

// Infringement System Enums
export enum InfringementStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  NOT_PAID = 'Not Paid',
  DISPUTED = 'Disputed',
  WAIVED = 'Waived',
}

export enum WhitelistType {
  HOUR = 'Hour',
  DATE = 'Date',
  PERMANENT = 'Permanent',
  SELF_SERVE = 'Self Serve',
}

export enum DisputeStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  // Approved with Admin Fees
  APPROVED_WITH_ADMIN_FEES = 'Approved with Admin Fees',
}

// Audit System Enums
export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Permission System Enums
export * from './enums/permission.enum';

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
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
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
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
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
  EMAIL_NOTIFICATION = 'EMAIL_NOTIFICATION',
  SMS_NOTIFICATION = 'SMS_NOTIFICATION',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  BOOKING_EXPIRY_CHECK = 'BOOKING_EXPIRY_CHECK',
  INFRINGEMENT_REMINDER = 'INFRINGEMENT_REMINDER',
  GENERATE_QR_CODE = 'GENERATE_QR_CODE',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
}

// Sorting Enums
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
