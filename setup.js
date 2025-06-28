#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 Emergency Service Locator - Setup Script');
console.log('==========================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Function to check if directory exists
const checkDirectory = (dir) => {
  return fs.existsSync(dir);
};

// Function to run command
const runCommand = (command, cwd = process.cwd()) => {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    return false;
  }
};

// Function to create .env file
const createEnvFile = (templatePath, targetPath, replacements = {}) => {
  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  ${targetPath} already exists, skipping...`);
    return;
  }

  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Apply replacements
  Object.entries(replacements).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  fs.writeFileSync(targetPath, content);
  console.log(`✅ Created ${targetPath}`);
};

// Main setup process
const setup = async () => {
  console.log('\n📦 Installing dependencies...\n');

  // Install backend dependencies
  if (checkDirectory('backend')) {
    console.log('Installing backend dependencies...');
    if (!runCommand('npm install', 'backend')) {
      console.error('❌ Failed to install backend dependencies');
      process.exit(1);
    }
  } else {
    console.error('❌ Backend directory not found');
    process.exit(1);
  }

  // Install frontend dependencies
  if (checkDirectory('frontend')) {
    console.log('Installing frontend dependencies...');
    if (!runCommand('npm install', 'frontend')) {
      console.error('❌ Failed to install frontend dependencies');
      process.exit(1);
    }
  } else {
    console.error('❌ Frontend directory not found');
    process.exit(1);
  }

  console.log('\n🔧 Setting up environment files...\n');

  // Create backend .env file
  const backendEnvPath = path.join('backend', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/emergency_services
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/emergency_services

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
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
DEFAULT_EMERGENCY_CONTACTS=["+919491148245", "+0987654321"]`;

    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env');
  } else {
    console.log('⚠️  backend/.env already exists');
  }

  // Create frontend .env file
  const frontendEnvPath = path.join('frontend', '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `# API Configuration
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
VITE_DEFAULT_SEARCH_RADIUS=10`;

    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend/.env');
  } else {
    console.log('⚠️  frontend/.env already exists');
  }

  // Create uploads directory
  const uploadsDir = path.join('backend', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created backend/uploads directory');
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Configure your MongoDB database');
  console.log('2. Update the .env files with your actual credentials');
  console.log('3. Start the backend: cd backend && npm run dev');
  console.log('4. Start the frontend: cd frontend && npm run dev');
  console.log('\n🌐 Access the application at: http://localhost:3000');
  console.log('🔗 API endpoint: http://localhost:5000');
  console.log('🏥 Health check: http://localhost:5000/health');
};

// Run setup
setup().catch(console.error); 