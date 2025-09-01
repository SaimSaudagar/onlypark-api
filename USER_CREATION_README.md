# User Creation with Email Verification

This document describes the new user creation functionality implemented in the OnlyPark API.

## Overview

When creating a user, the system now:
1. Creates a user account with a temporary password
2. Generates a password reset token for email verification
3. Sends a welcome email with a link to set up the password
4. Creates associated whitelist and blacklist entries if provided
5. Creates role-specific records (Admin, CarparkManager, PatrolOfficer)

## API Endpoints

### Create User
- **POST** `/api/v1/user`
- **Access**: Admin only
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "image": "https://example.com/profile.jpg",
  "type": "CARPARK_MANAGER",
  "whitelist": ["ABC123", "XYZ789"],
  "blacklist": ["DEF456"],
  "status": "active"
}
```

### Password Setup
- **GET** `/api/v1/auth/setup-password?token=<token>`
- **Access**: Public (with valid token)
- **Purpose**: Verify token validity and get user info

- **POST** `/api/v1/auth/setup-password`
- **Access**: Public (with valid token)
- **Body**:
```json
{
  "token": "reset_token_here",
  "password": "new_password_here"
}
```

## User Creation Flow

1. **Admin creates user** via POST `/api/v1/user`
2. **System generates** temporary password and reset token
3. **Email sent** to user with password setup link
4. **User clicks link** and sets password
5. **Account activated** and user can login

## Email Templates

The system uses Handlebars templates located in `assets/templates/html/`:
- `user-registration.html` - User registration template

### Template Variables
- `{{name}}` - User's name
- `{{email}}` - User's email
- `{{role}}` - User's role type
- `{{phoneNumber}}` - User's phone number
- `{{passwordSetupUrl}}` - Password setup link

### Template Keys Constants
Template names are stored in constants for easy maintenance:
```typescript
import { TemplateKeys } from '../common';

// Usage
const templateName = TemplateKeys.USER_REGISTRATION;
```

## Role-Based Access Control

### Admin
- Can create any type of user
- Can view all users
- Can edit/delete any user

### Carpark Manager
- Can only view users of type `CARPARK_MANAGER`
- Cannot create/edit/delete users

### Patrol Officer
- Can only view users of type `PATROL_OFFICER`
- Cannot create/edit/delete users

## Whitelist and Blacklist

When creating a user, the system can automatically create:
- **Whitelist entries**: Vehicle registrations that are allowed
- **Blacklist entries**: Vehicle registrations that are blocked

These are created with the user's email and appropriate comments.

## Database Changes

New fields added to the `users` table:
- `image` - Profile image URL
- `passwordResetToken` - Token for password reset
- `passwordResetExpires` - Token expiration timestamp

## Environment Variables

Required environment variables:
```env
APP_URL=https://your-app.com
EMAIL_FROM=noreply@your-app.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_SECURE=false
```

## Security Features

- Password reset tokens expire after 24 hours
- Tokens are cryptographically secure (32-byte random)
- Temporary passwords are random and unusable
- Email verification required before account activation

## Error Handling

Common error scenarios:
- Email already exists
- Invalid or expired token
- Password too short (< 6 characters)
- Missing required fields

## Testing

To test the user creation flow:

1. Create a user via the API
2. Check the email logs (currently console.log)
3. Use the token from the email to set password
4. Verify the user can login

## Future Enhancements

- Support for multiple languages
- SMS verification option
- Two-factor authentication
- Account activation reminders
- Bulk user creation
- User import/export functionality

## Email Configuration

The system is configured to send emails using **Mailgun** as the email service provider.

### Mailgun Setup
1. **Domain**: `onlypark.com.au` (configured in .env)
2. **API Key**: Your Mailgun API key (configured as `MAILGUN_SECRET`)
3. **From Address**: `noreply@onlypark.com.au`

### Email Sending Flow
1. **User Creation**: Admin creates user via API
2. **Template Compilation**: HTML email template is compiled with user data
3. **Mailgun API**: Email is sent via Mailgun's API
4. **Delivery**: Mailgun delivers the email to the user's inbox

### Fallback Mode
If `MAILGUN_SECRET` is not configured:
- Emails are logged to console (simulated sending)
- Application continues to work normally
- Useful for development and testing

### Email Templates
- **Location**: `assets/templates/html/user-registration.html`
- **Engine**: Handlebars template engine
- **Variables**: `{{name}}`, `{{email}}`, `{{role}}`, `{{phoneNumber}}`, `{{passwordSetupUrl}}`
