# Emergency Service Locator

A comprehensive, full-stack application connecting communities with emergency services when every second counts. This project features a robust Express/MongoDB backend and a premium React/Vite frontend with an interactive hospital management theme.

---

## 🏗️ Architecture Overview

This project is structured as a monorepo containing two main parts:
- **Frontend**: A modern React application built with Vite and TailwindCSS for a premium UI experience.
- **Backend**: A robust Node.js and Express server acting as a RESTful API backed by a MongoDB database.

---

## 🎨 Frontend Details

The frontend is a fully responsive, modern React application focusing on high performance, accessibility, and a premium "Hospital Management" aesthetic (glassmorphism, medical teals, sky blues, and soft shadows).

### Tech Stack
- **Framework**: React 18, Vite
- **Styling**: TailwindCSS v4 with custom CSS variables
- **State Management & Fetching**: React Query, Context API
- **Routing**: React Router DOM v6
- **Maps**: Leaflet, React-Leaflet
- **Icons & Animations**: Lucide React, Framer Motion

### Key Pages & Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Landing page with hero section and feature overview. |
| `/map` | `MapPage` | Interactive real-time emergency map using Leaflet. |
| `/services` | `ServicesPage` | Directory of all emergency services with filtering and search. |
| `/services/:id` | `ServiceDetailPage` | Detailed view for a specific hospital/police/fire station. |
| `/login` & `/register`| `LoginPage`, `RegisterPage` | Authentication flow interfaces. |
| `/profile` | `ProfilePage` | User profile management and emergency contacts setup. |
| `/admin` | `Dashboard` | Admin overview of systemic metrics. |
| `/admin/alerts` | `SosAlertsPage` | Admin management console to interact with active SOS alerts. |

### Core Features
- **Real-Time Map**: Dynamic map markers rendering nearby emergency services.
- **Clickable Routing**: Automatically redirects clicked addresses to Google Maps (using coordinates or fallbacks to string search).
- **Debounced Search**: Seamless background searching without interrupting user typing focus.

---

## ⚙️ Backend Details

The backend provides a secure, RESTful API structure with built-in role-based access control, rate limiting, and robust error handling. Note that the controller logic is embedded directly within the distinct Route files to keep the structure compact.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Security**: Helmet, Express Rate Limit, CORS
- **Real-time**: Socket.IO

### Database Models
1. **User** (`User.js`):
   - Stores user profiles, authentication credentials (hashed), roles (`user`, `admin`, `responder`), and emergency contacts.
   - Handles password comparison and user-level location tracking.
2. **EmergencyService** (`EmergencyService.js`):
   - Defines physical emergency infrastructure (Hospitals, Police Stations, Fire Stations, Pharmacies).
   - Contains GeoJSON coordinates, contact details, operating hours, and active statuses.
3. **SOS** (`SOS.js`):
   - Tracks active emergency alerts triggered by users.
   - Logs the `emergencyType`, geographic coordinates of the alert, and current response `status` (pending, acknowledged, responding, resolved).

### API Routes & Controllers
Because of the streamlined architecture, API endpoints contain their respective controller logic.

- **`/api/auth`** (`auth.js`):
  - `POST /register`: Registers a new user.
  - `POST /login`: Authenticates a user and returns a JWT.
  - `GET /me` & `PUT /me`: Fetches and updates the logged-in user's profile.
  - `POST /emergency-contacts`: Manages a user's emergency contact list.
  - `POST /update-location`: Updates the user's last known coordinates.

- **`/api/services`** (`services.js`):
  - Standard CRUD endpoints for `EmergencyService` entities.
  - Handles geolocation-based radius searching via MongoDB spatial queries.

- **`/api/sos`** (`sos.js`):
  - Endpoints to trigger a new SOS alert and to fetch the user's SOS history.
  - Admin endpoints to update the lifecycle status of an ongoing emergency.

- **`/api/admin`** (`admin.js`, `users.js`):
  - Protected routes requiring the `admin` role.
  - Controls systemic management of users and over-arching service operations.

- **`/api/analytics`** (`analytics.js`):
  - Aggregates systemic data (most common emergencies, average response times) for dashboard visualization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB locally installed or an Atlas Connection URI.

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on env.example (add your MONGO_URI and JWT_SECRET)
npm run dev
```
*The backend will boot up on port 5000 (default).*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend will boot up on port 3000.*

---

## 🛡️ Future Enhancements
- Expand WebSocket (Socket.IO) integration to stream live GPS locations of responders towards users.
- Integrate comprehensive testing (Jest/Supertest) to validate API endpoints natively.