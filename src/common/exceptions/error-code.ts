export class ErrorCode {
  // General Errors
  public static readonly CLIENT_ERROR = {
    key: 'CLIENT_ERROR',
    code: 'CLIENT_ERROR',
    message: 'Bad Request',
  };

  public static readonly SERVER_ERROR = {
    key: 'SERVER_ERROR',
    code: 'SERVER_ERROR',
    message: 'Internal Server Error',
  };

  public static readonly INVALID_EVENT_DATE = {
    key: 'INVALID_EVENT_DATE',
    code: 'INVALID_EVENT_DATE',
    message: 'Invalid event date',
  };

  public static readonly INVALID_FREE_HOURS = {
    key: 'INVALID_FREE_HOURS',
    code: 'INVALID_FREE_HOURS',
    message: 'Invalid free hours',
  };

  public static readonly INVALID_CAR_SPACE = {
    key: 'INVALID_CAR_SPACE',
    code: 'INVALID_CAR_SPACE',
    message: 'Car space must be greater than 0',
  };

  public static readonly INVALID_LATITUDE = {
    key: 'INVALID_LATITUDE',
    code: 'INVALID_LATITUDE',
    message: 'Latitude must be between -90 and 90',
  };

  public static readonly INVALID_LONGITUDE = {
    key: 'INVALID_LONGITUDE',
    code: 'INVALID_LONGITUDE',
    message: 'Longitude must be between -180 and 180',
  };

  public static readonly INVALID_EVENT_DATE_RANGE = {
    key: 'INVALID_EVENT_DATE_RANGE',
    code: 'INVALID_EVENT_DATE_RANGE',
    message: 'Event start date must be before end date',
  };

  public static readonly INVALID_PERMITS_PER_REGISTRATION = {
    key: 'INVALID_PERMITS_PER_REGISTRATION',
    code: 'INVALID_PERMITS_PER_REGISTRATION',
    message: 'Number of permits per registration must be greater than 0',
  };

  public static readonly PERMITS_PER_REGISTRATION_EXCEEDED = {
    key: 'PERMITS_PER_REGISTRATION_EXCEEDED',
    code: 'PERMITS_PER_REGISTRATION_EXCEEDED',
    message: 'Number of permits per registration exceeded',
  };

  public static readonly COMPANY_NAME_AND_DOMAIN_NAME_REQUIRED = {
    key: 'COMPANY_NAME_AND_DOMAIN_NAME_REQUIRED',
    code: 'COMPANY_NAME_AND_DOMAIN_NAME_REQUIRED',
    message: 'Company name and domain name are required',
  };

  public static readonly INVALID_TENANCY_DATA = {
    key: 'INVALID_TENANCY_DATA',
    code: 'INVALID_TENANCY_DATA',
    message: 'Tenant name and email are required',
  };

  public static readonly TENANT_NOT_FOUND = {
    key: 'TENANT_NOT_FOUND',
    code: 'TENANT_NOT_FOUND',
    message: 'Tenant not found',
  };

  public static readonly TENANT_ALREADY_EXISTS = {
    key: 'TENANT_ALREADY_EXISTS',
    code: 'TENANT_ALREADY_EXISTS',
    message: 'Tenant with {{tenantEmail}} already exists',
  };

  public static readonly TENANCY_NOT_FOUND = {
    key: 'TENANCY_NOT_FOUND',
    code: 'TENANCY_NOT_FOUND',
    message: 'Tenancy not found',
  };

  public static readonly NOT_SPECIFIED = {
    key: 'NOT_SPECIFIED',
    code: 'NOT_SPECIFIED',
    message: 'Not specified',
  };

  // Authentication & Authorization Errors
  public static readonly UNAUTHORIZED = {
    key: 'UNAUTHORIZED',
    code: 'UNAUTHORIZED',
    message: 'Unauthorized access',
  };

  public static readonly FORBIDDEN = {
    key: 'FORBIDDEN',
    code: 'FORBIDDEN',
    message: 'Access forbidden',
  };

  public static readonly INVALID_CREDENTIALS = {
    key: 'INVALID_CREDENTIALS',
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  };

  public static readonly EMAIL_NOT_VERIFIED = {
    key: 'EMAIL_NOT_VERIFIED',
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Email is not verified',
  };

  public static readonly ACCOUNT_SUSPENDED = {
    key: 'ACCOUNT_SUSPENDED',
    code: 'ACCOUNT_SUSPENDED',
    message: 'Account has been suspended',
  };

  public static readonly ADMIN_ALREADY_EXISTS = {
    key: 'ADMIN_ALREADY_EXISTS',
    code: 'ADMIN_ALREADY_EXISTS',
    message: 'Admin already exists',
  };

  // User Management Errors
  public static readonly USER_NOT_FOUND = {
    key: 'USER_NOT_FOUND',
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  };

  public static readonly EMAIL_ALREADY_EXISTS = {
    key: 'EMAIL_ALREADY_EXISTS',
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'Email already exists',
  };

  public static readonly INVALID_USER_TYPE = {
    key: 'INVALID_USER_TYPE',
    code: 'INVALID_USER_TYPE',
    message: 'Invalid user type',
  };

  // Permission & Role Errors
  public static readonly PERMISSION_NOT_FOUND = {
    key: 'PERMISSION_NOT_FOUND',
    code: 'PERMISSION_NOT_FOUND',
    message: 'Permission not found',
  };

  public static readonly PERMISSION_ALREADY_EXISTS = {
    key: 'PERMISSION_ALREADY_EXISTS',
    code: 'PERMISSION_ALREADY_EXISTS',
    message: 'Permission already exists',
  };

  public static readonly ROLE_NOT_FOUND = {
    key: 'ROLE_NOT_FOUND',
    code: 'ROLE_NOT_FOUND',
    message: 'Role not found',
  };

  public static readonly ROLE_ALREADY_EXISTS = {
    key: 'ROLE_ALREADY_EXISTS',
    code: 'ROLE_ALREADY_EXISTS',
    message: 'Role already exists',
  };

  // Car Park Errors
  public static readonly MASTER_CAR_PARK_NOT_ACTIVE = {
    key: 'MASTER_CAR_PARK_NOT_ACTIVE',
    code: 'MASTER_CAR_PARK_NOT_ACTIVE',
    message: 'Master car park is not active',
  };

  public static readonly MASTER_CAR_PARK_CODE_ALREADY_EXISTS = {
    key: 'MASTER_CAR_PARK_CODE_ALREADY_EXISTS',
    code: 'MASTER_CAR_PARK_CODE_ALREADY_EXISTS',
    message: 'Master car park code already exists',
  };

  public static readonly MASTER_CAR_PARK_NOT_FOUND = {
    key: 'MASTER_CAR_PARK_NOT_FOUND',
    code: 'MASTER_CAR_PARK_NOT_FOUND',
    message: 'Master car park not found',
  };

  public static readonly CANNOT_DELETE_MASTER_CAR_PARK_WITH_SUB_CAR_PARKS = {
    key: 'CANNOT_DELETE_MASTER_CAR_PARK_WITH_SUB_CAR_PARKS',
    code: 'CANNOT_DELETE_MASTER_CAR_PARK_WITH_SUB_CAR_PARKS',
    message: 'Cannot delete master car park with existing sub car parks',
  };

  public static readonly MASTER_CAR_PARK_NAME_ALREADY_EXISTS = {
    key: 'MASTER_CAR_PARK_NAME_ALREADY_EXISTS',
    code: 'MASTER_CAR_PARK_NAME_ALREADY_EXISTS',
    message: 'Master car park name already exists',
  };

  public static readonly SUB_CAR_PARK_CODE_ALREADY_EXISTS = {
    key: 'SUB_CAR_PARK_CODE_ALREADY_EXISTS',
    code: 'SUB_CAR_PARK_CODE_ALREADY_EXISTS',
    message: 'Sub car park code already exists',
  };

  public static readonly SUB_CAR_PARK_NAME_ALREADY_EXISTS = {
    key: 'SUB_CAR_PARK_NAME_ALREADY_EXISTS',
    code: 'SUB_CAR_PARK_NAME_ALREADY_EXISTS',
    message: 'Sub car park name already exists for this master car park',
  };

  public static readonly SUB_CAR_PARK_CODE_GENERATION_FAILED = {
    key: 'SUB_CAR_PARK_CODE_GENERATION_FAILED',
    code: 'SUB_CAR_PARK_CODE_GENERATION_FAILED',
    message: 'Failed to generate unique sub car park code',
  };

  public static readonly SUB_CAR_PARK_NOT_FOUND = {
    key: 'SUB_CAR_PARK_NOT_FOUND',
    code: 'SUB_CAR_PARK_NOT_FOUND',
    message: 'Sub car park not found',
  };

  public static readonly PATROL_OFFICER_VISITOR_SUB_CAR_PARK_NOT_FOUND = {
    key: 'PATROL_OFFICER_VISITOR_SUB_CAR_PARK_NOT_FOUND',
    code: 'PATROL_OFFICER_VISITOR_SUB_CAR_PARK_NOT_FOUND',
    message: 'Patrol officer visitor sub car park not found',
  };

  public static readonly PATROL_OFFICER_WHITELIST_SUB_CAR_PARK_NOT_FOUND = {
    key: 'PATROL_OFFICER_WHITELIST_SUB_CAR_PARK_NOT_FOUND',
    code: 'PATROL_OFFICER_WHITELIST_SUB_CAR_PARK_NOT_FOUND',
    message: 'Patrol officer whitelist sub car park not found',
  };

  public static readonly PATROL_OFFICER_BLACKLIST_SUB_CAR_PARK_NOT_FOUND = {
    key: 'PATROL_OFFICER_BLACKLIST_SUB_CAR_PARK_NOT_FOUND',
    code: 'PATROL_OFFICER_BLACKLIST_SUB_CAR_PARK_NOT_FOUND',
    message: 'Patrol officer blacklist sub car park not found',
  };

  public static readonly CANNOT_DELETE_SUB_CAR_PARK_WITH_BOOKINGS = {
    key: 'CANNOT_DELETE_SUB_CAR_PARK_WITH_BOOKINGS',
    code: 'CANNOT_DELETE_SUB_CAR_PARK_WITH_BOOKINGS',
    message: 'Cannot delete sub car park with existing bookings',
  };

  public static readonly CANNOT_DELETE_SUB_CAR_PARK_WITH_TENANCIES = {
    key: 'CANNOT_DELETE_SUB_CAR_PARK_WITH_TENANCIES',
    code: 'CANNOT_DELETE_SUB_CAR_PARK_WITH_TENANCIES',
    message: 'Cannot delete sub car park with existing tenancies',
  };

  public static readonly SUB_CAR_PARK_NOT_ASSIGNED_TO_USER = {
    key: 'SUB_CAR_PARK_NOT_ASSIGNED_TO_USER',
    code: 'SUB_CAR_PARK_NOT_ASSIGNED_TO_USER',
    message: 'Sub car park not assigned to user',
  };

  public static readonly CAR_MAKE_ALREADY_EXISTS = {
    key: 'CAR_MAKE_ALREADY_EXISTS',
    code: 'CAR_MAKE_ALREADY_EXISTS',
    message: 'Car make already exists',
  };

  public static readonly CAR_MAKE_NOT_FOUND = {
    key: 'CAR_MAKE_NOT_FOUND',
    code: 'CAR_MAKE_NOT_FOUND',
    message: 'Car make not found',
  };

  public static readonly CARPARK_MANAGER_ALREADY_EXISTS = {
    key: 'CARPARK_MANAGER_ALREADY_EXISTS',
    code: 'CARPARK_MANAGER_ALREADY_EXISTS',
    message: 'Carpark manager already exists',
  };

  public static readonly CARPARK_MANAGER_NOT_FOUND = {
    key: 'CARPARK_MANAGER_NOT_FOUND',
    code: 'CARPARK_MANAGER_NOT_FOUND',
    message: 'Carpark manager not found',
  };

  public static readonly BLACKLIST_ENTRY_NOT_FOUND = {
    key: 'BLACKLIST_ENTRY_NOT_FOUND',
    code: 'BLACKLIST_ENTRY_NOT_FOUND',
    message: 'Blacklist entry not found',
  };

  public static readonly BLACKLIST_ENTRY_ALREADY_EXISTS = {
    key: 'BLACKLIST_ENTRY_ALREADY_EXISTS',
    code: 'BLACKLIST_ENTRY_ALREADY_EXISTS',
    message: 'Blacklist entry already exists',
  };

  public static readonly WHITELIST_COMPANY_NOT_FOUND = {
    key: 'WHITELIST_COMPANY_NOT_FOUND',
    code: 'WHITELIST_COMPANY_NOT_FOUND',
    message: 'Whitelist company not found',
  };

  public static readonly WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS = {
    key: 'WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS',
    code: 'WHITELIST_COMPANY_DOMAIN_NAME_ALREADY_EXISTS',
    message: 'Company with this domain name already exists in this car park',
  };

  public static readonly WHITELIST_NOT_FOUND = {
    key: 'WHITELIST_NOT_FOUND',
    code: 'WHITELIST_NOT_FOUND',
    message: 'Whitelist entry not found',
  };

  public static readonly WHITELIST_PERMIT_ALREADY_EXISTS = {
    key: 'WHITELIST_PERMIT_ALREADY_EXISTS',
    code: 'WHITELIST_PERMIT_ALREADY_EXISTS',
    message: 'Whitelist permit already exists',
  };

  public static readonly TOKEN_REQUIRED = {
    key: 'TOKEN_REQUIRED',
    code: 'TOKEN_REQUIRED',
    message: 'Token is required',
  };

  public static readonly INVALID_OR_EXPIRED_TOKEN = {
    key: 'INVALID_OR_EXPIRED_TOKEN',
    code: 'INVALID_OR_EXPIRED_TOKEN',
    message: 'Invalid or expired token',
  };

  public static readonly TOKEN_AND_PASSWORD_REQUIRED = {
    key: 'TOKEN_AND_PASSWORD_REQUIRED',
    code: 'TOKEN_AND_PASSWORD_REQUIRED',
    message: 'Token and password are required',
  };

  public static readonly PASSWORD_TOO_SHORT = {
    key: 'PASSWORD_TOO_SHORT',
    code: 'PASSWORD_TOO_SHORT',
    message: 'Password must be at least 6 characters long',
  };

  public static readonly PARKING_SPOT_NOT_FOUND = {
    key: 'PARKING_SPOT_NOT_FOUND',
    code: 'PARKING_SPOT_NOT_FOUND',
    message: 'Parking spot not found',
  };

  public static readonly PARKING_SPOT_DISABLED = {
    key: 'PARKING_SPOT_DISABLED',
    code: 'PARKING_SPOT_DISABLED',
    message: 'Parking spot is disabled',
  };

  public static readonly PARKING_SPOT_FULL = {
    key: 'PARKING_SPOT_FULL',
    code: 'PARKING_SPOT_FULL',
    message: 'Parking spot is full',
  };

  public static readonly INVALID_PARKING_CODE = {
    key: 'INVALID_PARKING_CODE',
    code: 'INVALID_PARKING_CODE',
    message: 'Invalid parking code',
  };

  // Booking Errors
  public static readonly BOOKING_NOT_FOUND = {
    key: 'BOOKING_NOT_FOUND',
    code: 'BOOKING_NOT_FOUND',
    message: 'Booking not found',
  };

  public static readonly BOOKING_EXPIRED = {
    key: 'BOOKING_EXPIRED',
    code: 'BOOKING_EXPIRED',
    message: 'Booking has expired',
  };

  public static readonly BOOKING_ALREADY_EXISTS = {
    key: 'BOOKING_ALREADY_EXISTS',
    code: 'BOOKING_ALREADY_EXISTS',
    message: 'Active booking already exists for this vehicle',
  };

  public static readonly INVALID_BOOKING_TIME = {
    key: 'INVALID_BOOKING_TIME',
    code: 'INVALID_BOOKING_TIME',
    message: 'Invalid booking time',
  };

  public static readonly BOOKING_TIME_CONFLICT = {
    key: 'BOOKING_TIME_CONFLICT',
    code: 'BOOKING_TIME_CONFLICT',
    message: 'Booking time conflicts with existing booking',
  };

  public static readonly INVALID_BOOKING_DATES = {
    key: 'INVALID_BOOKING_DATES',
    code: 'INVALID_BOOKING_DATES',
    message: 'Start time must be before end time',
  };

  public static readonly BOOKING_PAST_DATE = {
    key: 'BOOKING_PAST_DATE',
    code: 'BOOKING_PAST_DATE',
    message: 'Cannot create booking for past dates',
  };

  public static readonly BOOKING_DURATION_EXCEEDED = {
    key: 'BOOKING_DURATION_EXCEEDED',
    code: 'BOOKING_DURATION_EXCEEDED',
    message: 'Booking duration exceeds maximum allowed time',
  };

  public static readonly BOOKING_CAPACITY_EXCEEDED = {
    key: 'BOOKING_CAPACITY_EXCEEDED',
    code: 'BOOKING_CAPACITY_EXCEEDED',
    message: 'No available spaces for the requested time',
  };

  public static readonly BOOKING_ALREADY_CANCELLED = {
    key: 'BOOKING_ALREADY_CANCELLED',
    code: 'BOOKING_ALREADY_CANCELLED',
    message: 'Booking has already been cancelled',
  };

  public static readonly BOOKING_ALREADY_COMPLETED = {
    key: 'BOOKING_ALREADY_COMPLETED',
    code: 'BOOKING_ALREADY_COMPLETED',
    message: 'Booking has already been completed',
  };

  public static readonly VISITOR_BOOKING_NOT_FOUND = {
    key: 'VISITOR_BOOKING_NOT_FOUND',
    code: 'VISITOR_BOOKING_NOT_FOUND',
    message: 'Visitor booking not found',
  };

  public static readonly VEHICLE_ALREADY_BOOKED = {
    key: 'VEHICLE_ALREADY_BOOKED',
    code: 'VEHICLE_ALREADY_BOOKED',
    message: 'Vehicle is already booked for the specified time period',
  };

  // Geolocation Errors
  public static readonly GEOLOCATION_REQUIRED = {
    key: 'GEOLOCATION_REQUIRED',
    code: 'GEOLOCATION_REQUIRED',
    message: 'Geolocation verification is required for this parking spot',
  };

  public static readonly OUTSIDE_GEOLOCATION_RADIUS = {
    key: 'OUTSIDE_GEOLOCATION_RADIUS',
    code: 'OUTSIDE_GEOLOCATION_RADIUS',
    message: 'You are outside the allowed radius for this parking spot',
  };

  public static readonly INVALID_COORDINATES = {
    key: 'INVALID_COORDINATES',
    code: 'INVALID_COORDINATES',
    message: 'Invalid coordinates provided',
  };

  // Vehicle & Blacklist Errors
  public static readonly VEHICLE_BLACKLISTED = {
    key: 'VEHICLE_BLACKLISTED',
    code: 'VEHICLE_BLACKLISTED',
    message: 'Vehicle is blacklisted',
  };

  public static readonly INVALID_VEHICLE_REGISTRATION = {
    key: 'INVALID_VEHICLE_REGISTRATION',
    code: 'INVALID_VEHICLE_REGISTRATION',
    message: 'Invalid vehicle registration format',
  };

  // Infringement Errors
  public static readonly INFRINGEMENT_NOT_FOUND = {
    key: 'INFRINGEMENT_NOT_FOUND',
    code: 'INFRINGEMENT_NOT_FOUND',
    message: 'Infringement not found',
  };

  public static readonly INFRINGEMENT_ALREADY_PAID = {
    key: 'INFRINGEMENT_ALREADY_PAID',
    code: 'INFRINGEMENT_ALREADY_PAID',
    message: 'Infringement has already been paid',
  };

  public static readonly INFRINGEMENT_DISPUTED = {
    key: 'INFRINGEMENT_DISPUTED',
    code: 'INFRINGEMENT_DISPUTED',
    message: 'Infringement is under dispute',
  };

  // Dispute Errors
  public static readonly DISPUTE_NOT_FOUND = {
    key: 'DISPUTE_NOT_FOUND',
    code: 'DISPUTE_NOT_FOUND',
    message: 'Dispute not found',
  };

  public static readonly DISPUTE_ALREADY_EXISTS = {
    key: 'DISPUTE_ALREADY_EXISTS',
    code: 'DISPUTE_ALREADY_EXISTS',
    message: 'Dispute already exists for this infringement',
  };

  public static readonly DISPUTE_STATUS_NOT_FOUND = {
    key: 'DISPUTE_STATUS_NOT_FOUND',
    code: 'DISPUTE_STATUS_NOT_FOUND',
    message: 'Dispute status not found',
  };

  public static readonly DISPUTE_DEADLINE_PASSED = {
    key: 'DISPUTE_DEADLINE_PASSED',
    code: 'DISPUTE_DEADLINE_PASSED',
    message: 'Dispute deadline has passed',
  };

  // Payment Errors
  public static readonly PAYMENT_FAILED = {
    key: 'PAYMENT_FAILED',
    code: 'PAYMENT_FAILED',
    message: 'Payment processing failed',
  };

  public static readonly INVALID_PAYMENT_AMOUNT = {
    key: 'INVALID_PAYMENT_AMOUNT',
    code: 'INVALID_PAYMENT_AMOUNT',
    message: 'Invalid payment amount',
  };

  public static readonly PAYMENT_ALREADY_PROCESSED = {
    key: 'PAYMENT_ALREADY_PROCESSED',
    code: 'PAYMENT_ALREADY_PROCESSED',
    message: 'Payment has already been processed',
  };

  // OTP Errors
  public static readonly INVALID_OTP = {
    key: 'INVALID_OTP',
    code: 'INVALID_OTP',
    message: 'Invalid OTP code',
  };

  public static readonly OTP_EXPIRED = {
    key: 'OTP_EXPIRED',
    code: 'OTP_EXPIRED',
    message: 'OTP code has expired',
  };

  public static readonly OTP_ALREADY_USED = {
    key: 'OTP_ALREADY_USED',
    code: 'OTP_ALREADY_USED',
    message: 'OTP code has already been used',
  };

  // File Upload Errors
  public static readonly FILE_TOO_LARGE = {
    key: 'FILE_TOO_LARGE',
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds maximum allowed size',
  };

  public static readonly INVALID_FILE_TYPE = {
    key: 'INVALID_FILE_TYPE',
    code: 'INVALID_FILE_TYPE',
    message: 'Invalid file type',
  };

  public static readonly FILE_UPLOAD_FAILED = {
    key: 'FILE_UPLOAD_FAILED',
    code: 'FILE_UPLOAD_FAILED',
    message: 'File upload failed',
  };

  // QR Code Errors
  public static readonly QR_CODE_GENERATION_FAILED = {
    key: 'QR_CODE_GENERATION_FAILED',
    code: 'QR_CODE_GENERATION_FAILED',
    message: 'QR code generation failed',
  };

  public static readonly INVALID_QR_CODE = {
    key: 'INVALID_QR_CODE',
    code: 'INVALID_QR_CODE',
    message: 'Invalid QR code',
  };

  // Email & Notification Errors
  public static readonly EMAIL_SEND_FAILED = {
    key: 'EMAIL_SEND_FAILED',
    code: 'EMAIL_SEND_FAILED',
    message: 'Failed to send email',
  };

  public static readonly SMS_SEND_FAILED = {
    key: 'SMS_SEND_FAILED',
    code: 'SMS_SEND_FAILED',
    message: 'Failed to send SMS',
  };

  public static readonly PUSH_NOTIFICATION_FAILED = {
    key: 'PUSH_NOTIFICATION_FAILED',
    code: 'PUSH_NOTIFICATION_FAILED',
    message: 'Failed to send push notification',
  };

  // Template Errors
  public static readonly TEMPLATE_NOT_FOUND = {
    key: 'TEMPLATE_NOT_FOUND',
    code: 'TEMPLATE_NOT_FOUND',
    message: 'Template not found',
  };

  public static readonly TEMPLATE_COMPILATION_FAILED = {
    key: 'TEMPLATE_COMPILATION_FAILED',
    code: 'TEMPLATE_COMPILATION_FAILED',
    message: 'Template compilation failed',
  };

  // Validation Errors (Class Validator)
  public static readonly IS_NOT_EMPTY = {
    key: 'IS_NOT_EMPTY',
    code: 'IS_NOT_EMPTY',
    message: '{{propertyName}} should not be empty',
  };

  public static readonly IS_EMAIL = {
    key: 'IS_EMAIL',
    code: 'IS_EMAIL',
    message: '{{propertyName}} must be a valid email address',
  };

  public static readonly IS_STRING = {
    key: 'IS_STRING',
    code: 'IS_STRING',
    message: '{{propertyName}} must be a string',
  };

  public static readonly IS_NUMBER = {
    key: 'IS_NUMBER',
    code: 'IS_NUMBER',
    message: '{{propertyName}} must be a number',
  };

  public static readonly IS_BOOLEAN = {
    key: 'IS_BOOLEAN',
    code: 'IS_BOOLEAN',
    message: '{{propertyName}} must be a boolean',
  };

  public static readonly IS_DATE = {
    key: 'IS_DATE',
    code: 'IS_DATE',
    message: '{{propertyName}} must be a valid date',
  };

  public static readonly IS_UUID = {
    key: 'IS_UUID',
    code: 'IS_UUID',
    message: '{{propertyName}} must be a valid UUID',
  };

  public static readonly IS_PHONE_NUMBER = {
    key: 'IS_PHONE_NUMBER',
    code: 'IS_PHONE_NUMBER',
    message: '{{propertyName}} must be a valid phone number',
  };

  public static readonly MIN_LENGTH = {
    key: 'MIN_LENGTH',
    code: 'MIN_LENGTH',
    message: '{{propertyName}} must be at least {{min}} characters long',
  };

  public static readonly MAX_LENGTH = {
    key: 'MAX_LENGTH',
    code: 'MAX_LENGTH',
    message: '{{propertyName}} must not be longer than {{max}} characters',
  };

  public static readonly IS_POSITIVE = {
    key: 'IS_POSITIVE',
    code: 'IS_POSITIVE',
    message: '{{propertyName}} must be a positive number',
  };

  // Utility methods
  public static getMessage(key: string): string {
    return this[key]?.message || 'Unknown error';
  }

  public static getCode(key: string): string {
    return this[key]?.code || key;
  }
}
