# NeuroFleetX - Intelligent Taxi Dispatch System

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Machine Learning Model](#machine-learning-model)
- [Frontend Structure](#frontend-structure)
- [Security](#security)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

NeuroFleetX is a comprehensive intelligent taxi dispatch system that leverages machine learning algorithms to optimize ride allocation, predict ETAs, and provide real-time tracking. The system features role-based access control for administrators, drivers, and users, with advanced dispatch algorithms and predictive analytics.

## Features

### Core Features
- **Role-based Access Control**: Admin, Driver, and User roles with specific permissions
- **Intelligent Dispatch Algorithm**: Multi-factor taxi assignment considering distance, ETA, battery level, and load
- **Real-time Ride Tracking**: Live visualization of taxi movement and ride progress
- **Machine Learning ETA Prediction**: RandomForest-based algorithm for accurate arrival time estimation
- **AI-Powered Ride Insights**: OpenAI integration for explaining and summarizing ride history
- **Admin Dashboard**: Comprehensive analytics and system management tools
- **Driver Management**: Taxi assignment and earnings tracking
- **User Experience**: Ride request, tracking, and history features

### Advanced Features
- **Multi-factor Dispatch**: Considers distance, ETA, battery level, and taxi load
- **Predictive Analytics**: ML-based ETA prediction with continuous model improvement
- **AI Ride Explanation**: OpenAI-powered ride history summarization and explanation
- **Real-time Updates**: WebSocket-based live tracking and status updates
- **Performance Metrics**: Detailed analytics for model accuracy and system performance
- **Scalable Architecture**: Designed for high availability and performance

## Technology Stack

### Backend
- **Java 17**: Core programming language
- **Spring Boot 3**: Web framework and application container
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database access and ORM
- **Hibernate**: Object-relational mapping
- **PostgreSQL**: Relational database management system
- **SMILE ML**: Machine learning library for predictive models
- **OpenAI API Integration**: AI-powered ride explanation and summarization
- **JWT**: Token-based authentication
- **Apache Commons CSV**: CSV file processing

### Frontend
- **React 18**: Frontend framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Styling framework
- **Recharts**: Data visualization library
- **Axios**: HTTP client
- **Lucide React**: Icon library

### Development & Deployment
- **Maven**: Build automation and dependency management
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Production database

## Architecture

### Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │    Services     │    │   Repositories  │
│                 │    │                 │    │                 │
│  AuthController │───▶│  UserService    │───▶│  UserRepository │
│  AdminController│    │  TaxiService    │    │  TaxiRepository │
│  DriverController│   │  RideService    │    │  RideRepository │
│  etc...         │    │  MLService      │    │  etc...        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    Models       │
                       │                 │
                       │  User, Taxi,    │
                       │  RideRequest,   │
                       │  ModelMetrics   │
                       └─────────────────┘
```

### Frontend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │     Pages       │    │    Services     │
│                 │    │                 │    │                 │
│  Sidebar        │    │  AdminDashboard │    │  apiClient     │
│  Map Components │    │  DriverDashboard│    │  adminService  │
│  etc...         │    │  UserDashboard  │    │  driverService │
└─────────────────┘    │  etc...         │    │  userService   │
                       └─────────────────┘    │  etc...        │
                              │               └─────────────────┘
                              ▼
                       ┌─────────────────┐
                       │   Contexts      │
                       │                 │
                       │  AuthContext    │
                       │  etc...         │
                       └─────────────────┘
```

## Installation

### Prerequisites
- **Java 17** or higher
- **Node.js 16** or higher
- **PostgreSQL** 12 or higher
- **Maven** 3.8 or higher
- **Git** for version control

### Backend Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd NeuroFleetX
```

2. **Set up PostgreSQL database:**
```bash
# Create database
CREATE DATABASE neurofleetx;

# Create user (optional but recommended)
CREATE USER neurofleetx_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE neurofleetx TO neurofleetx_user;
```

3. **Configure application properties:**
```properties
# Edit backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/neurofleetx
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

jwt.secret=neurofleetxSecretKey
jwt.expiration=86400

cors.allowed-origins=http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
```

4. **Build the backend:**
```bash
cd backend
mvn clean install
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

## Running the Application

### Development Mode

1. **Start PostgreSQL database**
2. **Start backend:**
```bash
cd backend
mvn spring-boot:run
```
Backend will run on `http://localhost:8080`

3. **Start frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Mode

1. **Build backend JAR:**
```bash
cd backend
mvn clean package -DskipTests
```

2. **Run backend:**
```bash
java -jar target/NeuroFleetX-0.0.1-SNAPSHOT.jar
```

3. **Build frontend:**
```bash
cd frontend
npm run build
```

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/rides` - Get user ride history

### Driver Endpoints
- `GET /api/driver/profile` - Get driver profile
- `PUT /api/driver/profile` - Update driver profile
- `GET /api/driver/rides` - Get driver rides
- `POST /api/driver/accept-ride` - Accept ride request
- `POST /api/driver/decline-ride` - Decline ride request

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/taxis` - Get all taxis
- `GET /api/admin/rides` - Get all rides
- `GET /api/admin/metrics` - Get ML model metrics
- `POST /api/admin/model/train` - Train ML model
- `DELETE /api/admin/users/{id}` - Delete user
- `DELETE /api/admin/taxis/{id}` - Delete taxi

### AI Endpoints
- `POST /api/ai/explain-ride/{rideId}` - Get AI-generated explanation of a ride using OpenAI API

### Taxi Endpoints
- `GET /api/taxis` - Get available taxis
- `GET /api/taxis/{id}` - Get specific taxi
- `POST /api/taxis` - Create taxi
- `PUT /api/taxis/{id}` - Update taxi
- `DELETE /api/taxis/{id}` - Delete taxi

## Machine Learning Model

### ETA Prediction Algorithm
- **Algorithm**: RandomForest from SMILE library
- **Features**: Distance, traffic index, weather, time of day, battery level, speed
- **Training**: Automatic with CSV data upload
- **Metrics**: R², RMSE, MAE for both training and test sets
- **Model Persistence**: Trained models are saved and loaded automatically

### Model Training Process
1. Upload CSV file with ride data through admin interface
2. Data preprocessing and feature engineering
3. Train-test split (80-20)
4. Model training with RandomForest
5. Performance evaluation and metrics calculation
6. Model saving with best performance selection

### Feature Engineering
- **Distance**: Haversine distance between origin and destination
- **Traffic Index**: Real-time traffic simulation (0.0-1.0)
- **Weather**: Categorical encoding (sunny, cloudy, rainy, snowy)
- **Time of Day**: Categorical encoding (morning, afternoon, evening, night)
- **Battery Level**: Taxi battery percentage (0-100)
- **Speed**: Average speed factor

## Frontend Structure

### Directory Structure
```
frontend/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── layouts/          # Page layouts
│   ├── pages/            # Application pages
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── public/               # Static assets
├── package.json          # Dependencies
└── vite.config.js        # Build configuration
```

### Key Components
- **AuthContext**: Authentication state management
- **ProtectedRoute**: Role-based route protection
- **RideTrackingMap**: Real-time ride visualization
- **AdminDashboard**: System analytics and metrics
- **DriverDashboard**: Driver-specific functionality
- **UserDashboard**: User ride management

## Security

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **HttpOnly Cookies**: Secure token storage
- **Role-based Access**: ADMIN, DRIVER, USER roles
- **Password Hashing**: BCrypt encryption

### Authorization
- **Spring Security**: Method and URL-level security
- **PreAuthorize**: Annotation-based access control
- **Role Validation**: Runtime role checking
- **Session Management**: Automatic session handling

### Security Headers
- **CORS**: Configurable cross-origin resource sharing
- **CSRF**: Cross-site request forgery protection
- **XSS**: Cross-site scripting prevention
- **SQL Injection**: Parameterized queries

## Testing (Planned)

Testing is planned for future iterations of the project.

### Backend
- Unit testing using JUnit 5
- Integration testing using Spring Boot Test
- Repository layer testing using Spring Data JPA

### Frontend
- Component testing using React Testing Library
- End-to-end testing using Cypress


### Running Tests
```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

## Configuration

### Environment Variables
- `SPRING_PROFILES_ACTIVE`: Active Spring profiles
- `DATABASE_URL`: Database connection URL
- `JWT_SECRET`: JWT signing key
- `PORT`: Application port
- `OPENAI_API_KEY`: OpenAI API key for AI-powered ride explanations (optional)

### Application Properties
Located in `backend/src/main/resources/application.properties`

### Frontend Configuration
Located in `frontend/.env` (create if needed):
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=NeuroFleetX
```

## Deployment

### Production Deployment
1. **Build production artifacts**
2. **Configure production database**
3. **Set environment variables**
4. **Deploy backend JAR**
5. **Serve frontend build**

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: neurofleetx
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/neurofleetx

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in application.properties
   - Ensure database name exists

2. **Authentication Problems**
   - Verify JWT secret configuration
   - Check CORS settings
   - Ensure HttpOnly cookies are enabled

3. **ML Model Training Failures**
   - Verify CSV file format
   - Check required columns exist
   - Ensure sufficient data points

4. **Frontend Build Issues**
   - Verify Node.js version compatibility
   - Clear npm cache if needed
   - Check dependency conflicts

### Development Tips

1. **Hot Reload**: Backend changes require restart; frontend uses hot reload
2. **Database Reset**: Use `ddl-auto=create-drop` for development
3. **Logging**: Enable debug logging for troubleshooting
4. **Performance**: Monitor database queries and API response times

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and commit (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open pull request

### Code Standards
- Follow Java and JavaScript style guides
- Write unit tests for new features
- Document API endpoints
- Maintain backward compatibility


## Acknowledgments

- Spring Boot framework for the robust backend foundation
- React ecosystem for the modern frontend development
- PostgreSQL for reliable database management
- SMILE library for machine learning capabilities
- Open source community for various libraries and tools
