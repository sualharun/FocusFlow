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
- **Node.js** (version 14 or higher)
- **Java** (version 11 or higher)
- **Maven** (for building the backend)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd FocusFlow
```

### 2. Backend Setup

```bash
# Navigate to the project root
cd /path/to/FocusFlow

# Run the Spring Boot application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd focusflow-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Google OAuth Setup (Optional)

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:8080` to authorized redirect URIs
6. Update `application.properties` with your OAuth credentials:

```properties
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret
```

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
4. Share the generated code with friends to collaborate

### Joining a Session
1. Click "Join Session"
2. Enter the session code provided by the session creator
3. Click "Join" to participate in the collaborative timer

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