# Emergency Service Locator

A comprehensive web application for locating and managing emergency services like hospitals, police stations, fire departments, and ambulances. Built with React, Node.js, and MongoDB.

## Features

### 🚨 Core Features
- **Real-time Location Services**: Find nearby emergency services based on your current location
- **SOS Emergency System**: Send emergency alerts with location tracking
- **Interactive Map**: Visual representation of emergency services using Leaflet maps
- **Service Management**: Admin panel for managing emergency service listings
- **User Authentication**: Secure user registration and login system
- **Real-time Notifications**: Socket.IO integration for instant alerts

### 🏥 Service Types
- Hospitals & Medical Centers
- Police Stations
- Fire Departments
- Ambulance Services
- Pharmacies
- Veterinary Clinics

### 📱 User Features
- User registration and profile management
- Emergency contact management
- Location-based service search
- Service ratings and reviews
- Operating hours and availability
- Direct contact integration (phone, directions)

### 🔧 Admin Features
- Service management dashboard
- User management
- Analytics and reporting
- SOS alert monitoring
- Service verification system

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Leaflet** - Interactive maps
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd emergency-services
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/emergency_services
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/emergency_services

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Emergency Service Locator <your_email@gmail.com>

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Emergency Contacts (Default)
DEFAULT_EMERGENCY_CONTACTS=["+919491148245", "+0987654321"]
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Socket Configuration
VITE_SOCKET_URL=http://localhost:5000

# Map Configuration
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Feature Flags
VITE_ENABLE_SOCKETS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token

# App Configuration
VITE_APP_NAME=Emergency Service Locator
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANGUAGE=en
VITE_DEFAULT_LOCATION_LAT=28.6139
VITE_DEFAULT_LOCATION_LNG=77.209
VITE_DEFAULT_SEARCH_RADIUS=10
```

## Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

2. **Start the frontend development server:**
```bash
cd frontend
npm run dev
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

### Production Mode

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Start the production server:**
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Password reset request

### Services
- `GET /api/services` - Get all services
- `GET /api/services/nearby` - Get nearby services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create new service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin)

### SOS
- `POST /api/sos` - Create SOS alert
- `GET /api/sos` - Get SOS alerts
- `PUT /api/sos/:id` - Update SOS status
- `DELETE /api/sos/:id` - Cancel SOS alert

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/services` - Service analytics
- `GET /api/analytics/sos` - SOS analytics
- `GET /api/analytics/users` - User analytics

## Database Schema

### User Model
- Basic info (name, email, phone)
- Authentication (password, role)
- Emergency contacts
- Current location
- Preferences (language, notifications)
- Account status and security

### EmergencyService Model
- Service details (name, type, description)
- Contact information
- Location (coordinates, address)
- Operating hours
- Services offered
- Capacity and ratings
- Verification status

### SOS Model
- User and location
- Emergency type and description
- Status tracking
- Contacted services
- Notifications sent
- Resolution details

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Security headers with Helmet
- Account lockout protection
- SQL injection prevention

## Real-time Features

- Socket.IO integration
- Live location tracking
- Emergency alerts
- Service updates
- Real-time notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Acknowledgments

- OpenStreetMap for map data
- Leaflet for interactive maps
- React community for excellent tools and libraries
- MongoDB for the database solution 