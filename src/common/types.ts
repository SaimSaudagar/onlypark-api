import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { SortOrder } from './enums';
import { ConfigConstants } from './configs';

// JWT Payload Interfaces
export interface JwtPayload {
  id: string;
  email: string;
  userType: string;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated?: boolean;
  iat?: number;
  exp?: number;
}

export interface AwsCognitoJwtPayload {
  sub: string;
  email: string;
  'cognito:username': string;
}

// Authenticated User Class
export class AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly profileImageUrl: string;
  readonly phoneNumber: string;
  readonly userType: string;
  readonly roles: string[];
  readonly permissions: string[];
  accessToken: string;

  constructor(
    id: string,
    email: string,
    name: string,
    profileImageUrl: string,
    phoneNumber: string,
    userType: string,
    roles: string[] = [],
    permissions: string[] = [],
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.profileImageUrl = profileImageUrl;
    this.phoneNumber = phoneNumber;
    this.userType = userType;
    this.roles = roles;
    this.permissions = permissions;
  }
}

// API Response Interface
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  error?: {
    code?: string;
    message: string;
    timestamp: string;
  };
}

// Base API Request Class
export class ApiRequest {
  @ApiHideProperty()
  traceId?: string;
}

// Pagination Interfaces
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Geolocation Interfaces
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationValidationResult {
  isValid: boolean;
  distance?: number;
  message?: string;
}

// File Upload Interfaces
export interface UploadedFile {
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

export interface FileValidationOptions {
  maxSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

// QR Code Interfaces
export interface QrCodeOptions {
  size: number;
  margin: number;
  color?: {
    dark: string;
    light: string;
  };
}

export interface QrCodeData {
  parkingSpotId: string;
  qrCode: string;
  expiresAt?: Date;
}

// Email Interfaces
export interface EmailTemplate {
  subject: string;
  body: string;
  isHtml: boolean;
}

export interface EmailContext {
  [key: string]: any;
}

// SMS Interfaces
export interface SmsTemplate {
  message: string;
}

// Push Notification Interfaces
export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Payment Interfaces
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentMetadata {
  infringementId?: string;
  bookingId?: string;
  userId: string;
  description: string;
}

// Audit Log Interfaces
export interface AuditLogData {
  entityName: string;
  entityId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  userId?: string;
}

// Booking Interfaces
export interface BookingTimeSlot {
  startTime: Date;
  endTime: Date;
  utcStartTime: Date;
  utcEndTime: Date;
}

export interface BookingValidationResult {
  isValid: boolean;
  availableSpaces?: number;
  conflictingBookings?: string[];
  message?: string;
}

// Parking Spot Interfaces
export interface ParkingSpotAvailability {
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  activeBookings: number;
}

export interface ParkingSpotLocation {
  address: string;
  coordinates: Coordinates;
  geolocationRequired: boolean;
  validationRadius: number;
}

// Infringement Interfaces
export interface InfringementPhoto {
  id: string;
  filename: string;
  path: string;
  description?: string;
  uploadedAt: Date;
}

export interface InfringementDetails {
  ticketNumber: string;
  amount: number;
  dueDate: Date;
  reason: string;
  penalty: string;
  photos: InfringementPhoto[];
}

// Report Interfaces
export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  format: 'PDF' | 'CSV' | 'EXCEL';
  filters?: Record<string, any>;
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  summary?: Record<string, any>;
}

// Cache Interfaces
export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key: string;
}

// Queue Job Interfaces
export interface QueueJobData {
  id: string;
  type: string;
  data: any;
  priority?: number;
  delay?: number;
  attempts?: number;
}

// Webhook Interfaces
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

// Search Interfaces
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sorting?: {
    field: string;
    order: 'ASC' | 'DESC';
  };
  pagination?: PaginationOptions;
}

// Time Zone Interfaces
export interface TimeZoneConversion {
  localTime: Date;
  utcTime: Date;
  timezone: string;
}

// Statistics Interfaces
export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalParkingSpots: number;
  occupancyRate: number;
  recentActivity: any[];
}

// Notification Preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  types: string[];
}

// System Health Interfaces
export interface HealthCheckResult {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details?: Record<string, any>;
}

export class ApiGetBaseRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  pageNo?: number = ConfigConstants.DEFAULT_PAGE_NO;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  pageSize?: number = ConfigConstants.DEFAULT_PAGE_SIZE;

  @ApiProperty({ required: false })
  @IsOptional()
  sortField?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: string = SortOrder.ASC;
}

export class ApiGetBaseResponse<T> {
  rows: T[];
  [key: string]: unknown;
  pagination: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
}
