# FocusFlow 🍅

A modern Pomodoro Timer application with collaborative sessions, background music, and productivity tracking. Built with React frontend and Spring Boot backend.

## Features

### ⏰ Smart Pomodoro Timer
- Customizable work and break intervals
- Support for multiple Pomodoro cycles
- Visual and audio notifications
- Session pause/resume functionality

### 🎵 Focus Enhancement
- Built-in background music player
- Lo-fi study beats and rain sounds
- Volume control and autoplay options
- YouTube integration for music streaming

### 📊 Progress Tracking
- Detailed session history
- Activity logging for all user actions
- Session completion statistics
- Time-based productivity insights

### 🎨 Personalization
- Multiple beautiful background themes
- Customizable timer durations
- User preferences and settings
- Responsive design for all devices

### 💡 Productivity Tips
- Curated focus and productivity tips
- Context-aware suggestions
- Built-in best practices for time management

### 🚀 Instant Demo Mode
- One-click demo access without registration
- Full feature testing with sample data
- Perfect for portfolios and demonstrations
- Automatic fallback when OAuth not configured

## Tech Stack

### Frontend
- **React** 19.1.1 - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API requests
- **SockJS & STOMP** - WebSocket communication
- **YouTube API** - Background music integration

### Backend
- **Spring Boot** 3.x - Java web framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction
- **WebSocket** - Real-time communication
- **OAuth2** - Google authentication
- **H2 Database** - In-memory database (development)

## Quick Start

### Prerequisites
- **Node.js** (version 16 or higher)
- **Java** (version 17 or higher)  
- **Maven** (included via wrapper)

### 🚀 Instant Demo (No Setup)
1. **Try Online Demo:** Visit the app and click **"Try Demo Mode"**
2. **Or Run Locally:**
   ```bash
   git clone https://github.com/sualharun/FocusFlow.git
   cd FocusFlow
   ./setup.sh
   ```

### 📱 Manual Setup

#### 1. Clone & Install
```bash
git clone https://github.com/sualharun/FocusFlow.git
cd FocusFlow
```

#### 2. Environment Configuration (Optional)
```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials (see OAuth setup section)
```

#### 3. Run Backend
```bash
./mvnw spring-boot:run
```
Backend starts on `http://localhost:8080`

#### 4. Run Frontend (New Terminal)
```bash
cd focusflow-frontend
npm install
npm start
```
Frontend starts on `http://localhost:3000`

### 4. Google OAuth Setup (Required for Authentication)

**Note**: The app will run without OAuth, but Google login won't work until configured.

#### Quick Setup:
1. **Environment Variables** (Recommended):
   ```bash
   export GOOGLE_CLIENT_ID="your-actual-client-id"
   export GOOGLE_CLIENT_SECRET="your-actual-client-secret"
   ```

2. **Or create `.env` file** in project root:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

#### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **OAuth2 API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
7. Copy the **Client ID** and **Client Secret**

#### 🎯 Demo Mode (No Setup Required)
**FocusFlow includes a built-in Demo Mode for instant testing:**

✅ **What Works in Demo Mode:**
- Full Pomodoro timer functionality (25/5/15 minute cycles)
- Session creation and management with progress tracking
- Collaborative session sharing via unique session codes
- Background music player (Lo-fi beats, rain sounds)  
- Multiple visual themes and customizable settings
- Productivity tips and activity logging
- Real-time session synchronization

❌ **What's Different:**
- Uses demo user account (`demo@focusflow.app`) instead of Google login
- No persistent user profiles (resets on restart)
- Demo mode indicator in the interface

**Perfect for:** Portfolio demonstrations, testing, development, or running without Google account setup.

**How to Access Demo Mode:**
1. Click **"Try Demo Mode"** button on the login screen, OR
2. Run the app normally (demo mode is automatic when OAuth isn't configured)

## Project Structure

```
FocusFlow/
├── src/main/java/com/example/FocusFlow/
│   ├── config/                 # Security and WebSocket configuration
│   ├── controller/             # REST API endpoints
│   ├── entity/                 # JPA entities
│   ├── repository/             # Data access layer
│   ├── service/                # Business logic
│   └── FocusFlowApplication.java
├── src/main/resources/
│   └── application.properties  # Spring Boot configuration
└── focusflow-frontend/
    ├── src/
    │   ├── components/         # React components
    │   ├── contexts/           # React contexts
    │   └── App.js             # Main application component
    ├── public/                 # Static assets
    └── package.json
```

## API Endpoints

### Sessions
- `POST /api/sessions/create` - Create a new session
- `POST /api/sessions/join/{code}` - Join an existing session
- `GET /api/sessions/{id}` - Get session details
- `POST /api/sessions/{id}/start` - Start a session
- `POST /api/sessions/{id}/pause` - Pause a session
- `POST /api/sessions/{id}/complete` - Complete a session

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/{id}/sessions` - Get user's session history

### Tips
- `GET /api/tips/random` - Get a random productivity tip
- `POST /api/tips` - Get contextual tip based on current activity

## Usage Guide

### Creating a Session
1. Click "Create New Session"
2. Set your preferred work duration, break duration, and number of cycles
3. Click "Create Session" to start

### Using Background Music
1. Click the music widget in the bottom right corner
2. Choose between Lo-fi study music or rain sounds
3. Adjust volume and enable autoplay if desired

### Customizing Settings
1. Click the gear icon in the top right
2. Choose from different background themes
3. Adjust default timer durations
4. Configure sound and music preferences

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Pomodoro Technique developed by Francesco Cirillo
- Icons and emojis used throughout the interface
- Lo-fi music and rain sounds for focus enhancement

---

Built with ❤️ for productivity enthusiasts and focused learners everywhere.
