# OnlyPark Backend API

A comprehensive NestJS-based parking management system that provides a complete replacement for the Laravel parking management application.

## 🚀 Features

- **Multi-role User Management**: Admin, Sub-Admin, Carpark Manager, Patrol Officer, and User roles
- **Parking Spot Management**: Create, manage, and monitor parking spots with geolocation support
- **Booking System**: Real-time parking bookings with time-based management
- **Infringement Management**: Handle parking violations, disputes, and payments
- **Whitelist/Blacklist**: Vehicle access control
- **QR Code Generation**: Dynamic QR codes for parking spots
- **Payment Integration**: Stripe payment processing for infringements
- **Multi-channel Notifications**: Email, SMS, and push notifications
- **Geolocation Validation**: Distance-based parking validation
- **Audit Logging**: Comprehensive change tracking
- **Report Generation**: Detailed reporting and analytics

## 🏗 Architecture

The system follows a modular architecture with clean separation of concerns:

```
src/
├── common/                 # Shared utilities and services
│   ├── configs.ts         # Configuration management
│   ├── enums.ts           # Application enums
│   ├── types.ts           # TypeScript interfaces
│   ├── decorators/        # Custom decorators
│   ├── exceptions/        # Exception handling
│   ├── middlewares/       # HTTP middleware
│   ├── interceptors/      # Response transformation
│   └── services/          # Common services
├── auth/                  # Authentication & authorization
├── user/                  # User management
├── parking-spot/          # Parking spot management
├── booking/               # Booking system
├── infringement/          # Infringement & dispute management
├── admin/                 # Admin panel functionality
├── carpark-manager/       # Carpark manager functionality
├── patrol-officer/        # Patrol officer portal
└── [other modules...]     # Additional feature modules
```

## 🛠 Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Queue System**: Bull with Redis
- **Payment Processing**: Stripe
- **Notifications**: Nodemailer, Firebase (Push), SMS providers
- **File Upload**: Multer with cloud storage support
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Validation**: Class Validator

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd onlypark-backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
```

### 3. Database Setup

```bash
# Generate and run migrations
npm run typeorm:generate-migration
npm run typeorm:run-migrations

# Run seeders (if available)
npm run seed:run
```

### 4. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at:
- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 📖 API Documentation

Comprehensive API documentation is available through Swagger UI at `/api/docs` when the application is running.

### Key Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Parking Spots**: `/api/v1/parking-spots/*`
- **Bookings**: `/api/v1/bookings/*`
- **Infringements**: `/api/v1/infringements/*`
- **Admin**: `/api/v1/admin/*`

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST_NAME=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=onlypark_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Redis (for queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
PORT=3000
TIMEZONE=Australia/Brisbane
```

## 🏃‍♂️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build for production

# Database
npm run typeorm:generate-migration  # Generate migration
npm run typeorm:run-migrations     # Run migrations
npm run typeorm:revert-migration   # Revert last migration

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier formatting
```

### Project Structure

Each feature module follows a consistent structure:

```
feature-module/
├── entities/              # TypeORM entities
├── dto/                  # Data Transfer Objects
├── feature.controller.ts # REST API endpoints
├── feature.service.ts    # Business logic
├── feature.module.ts     # NestJS module definition
└── feature.spec.ts       # Unit tests
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Cross-origin request handling
- **Audit Logging**: Track all system changes
- **File Upload Security**: Secure file handling

## 📊 Core Features Implementation

### User Management
- Multi-role system (Admin, Sub-Admin, Carpark Manager, Patrol Officer, User)
- User registration and authentication
- Profile management
- Address management

### Parking Management
- Parking spot CRUD operations
- Parent-child parking spot hierarchy
- QR code generation
- Capacity management
- Real-time availability tracking

### Booking System
- Real-time booking creation
- Time-based validation
- Conflict detection
- Automatic expiry handling
- Multiple booking types (user, whitelist, schedule, visitor)

### Infringement Management
- Violation recording with photo uploads
- Dispute management system
- Payment processing via Stripe
- Automated reminder emails
- Status tracking

### Geolocation Services
- Distance-based validation
- Radius checking for parking spots
- Coordinate validation

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test user.service.spec.ts

# Run e2e tests
npm run test:e2e
```

## 📈 Monitoring and Logging

- **Request Tracing**: Unique trace IDs for each request
- **HTTP Logging**: Comprehensive request/response logging
- **Error Tracking**: Centralized error handling
- **Performance Monitoring**: Response time tracking
- **Health Checks**: System health endpoints

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t onlypark-api .

# Run with Docker Compose
docker-compose up -d
```

### Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Database**: Set up proper database backups and replication
3. **Redis**: Configure Redis persistence
4. **Load Balancing**: Use load balancer for high availability
5. **SSL/TLS**: Enable HTTPS in production
6. **Monitoring**: Set up application monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [API Documentation](http://localhost:3000/api/docs)
2. Review the [GitHub Issues](../../issues)
3. Contact the development team

## 🔄 Migration from Laravel

This NestJS implementation provides complete functional equivalence to the original Laravel system with the following improvements:

- **Better Performance**: Async/await throughout
- **Type Safety**: Full TypeScript implementation
- **Modularity**: Clean separation of concerns
- **Testing**: Comprehensive test coverage
- **Documentation**: Auto-generated API docs
- **Monitoring**: Enhanced observability

The API endpoints maintain compatibility with existing frontend applications while providing enhanced features and better performance.
