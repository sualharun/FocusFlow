# FocusFlow Architecture

## System Overview

FocusFlow is a full-stack web application built with a **React frontend** and **Spring Boot backend**, designed for productivity management using the Pomodoro Technique.

## Architecture Diagram

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   React Frontend │ <──────────────────> │ Spring Boot API │
│                 │                      │                 │
│ • Timer UI      │                      │ • REST APIs     │
│ • Session Mgmt  │                      │ • WebSocket     │
│ • Music Player  │                      │ • Security      │
│ • Themes        │                      │ • OAuth2        │
└─────────────────┘                      └─────────────────┘
                                                   │
                                                   │ JPA
                                                   ▼
                                         ┌─────────────────┐
                                         │   H2 Database   │
                                         │                 │
                                         │ • Users         │
                                         │ • Sessions      │
                                         │ • Activity Logs │
                                         └─────────────────┘
```

## Frontend Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── Timer.js        # Core Pomodoro timer
│   ├── SessionJoin.js  # Collaborative session management
│   ├── MusicWidget.js  # Background music player
│   └── ThemeProvider.js # Theme management
├── contexts/           # React Context providers
│   └── AuthContext.js  # Authentication state
└── App.js             # Main application component
```

### State Management
- **React Context** for global state (authentication, theme)
- **Local State** for component-specific data
- **WebSocket** for real-time session synchronization

### Key Features
- **Real-time Updates**: WebSocket connection for collaborative sessions
- **Responsive Design**: Tailwind CSS for mobile-first design
- **Audio Management**: Background music and notification sounds
- **Theme System**: Multiple visual themes with persistence

## Backend Architecture

### Package Structure
```
com.example.focusflow/
├── config/             # Configuration classes
│   ├── SecurityConfig.java    # Spring Security setup
│   └── WebSocketConfig.java   # WebSocket configuration
├── controller/         # REST API endpoints
│   ├── SessionController.java # Session management
│   ├── AuthController.java    # Authentication
│   └── UserController.java    # User management
├── entity/            # JPA entities
│   ├── User.java      # User data model
│   ├── Session.java   # Pomodoro session model
│   └── ActivityLog.java # User activity tracking
├── repository/        # Data access layer
├── service/          # Business logic layer
└── FocusFlowApplication.java # Main application class
```

### Security Architecture
- **OAuth2 Integration**: Google authentication
- **JWT Tokens**: Session management
- **CORS Configuration**: Cross-origin resource sharing
- **Method Security**: Endpoint-level authorization

### Database Design

#### User Entity
```sql
Users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    picture_url VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### Session Entity
```sql
Sessions (
    id BIGINT PRIMARY KEY,
    code VARCHAR(10) UNIQUE,
    work_duration INTEGER,
    break_duration INTEGER,
    cycles INTEGER,
    current_cycle INTEGER,
    status VARCHAR(20),
    created_by BIGINT REFERENCES Users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### Activity Log Entity
```sql
Activity_Logs (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES Users(id),
    session_id BIGINT REFERENCES Sessions(id),
    action VARCHAR(50),
    timestamp TIMESTAMP,
    details TEXT
)
```

## API Design

### REST Endpoints
```
POST   /api/sessions/create     # Create new session
POST   /api/sessions/join/{code} # Join existing session
GET    /api/sessions/{id}       # Get session details
POST   /api/sessions/{id}/start # Start session
POST   /api/sessions/{id}/pause # Pause session
GET    /api/users/profile       # Get user profile
GET    /api/tips/random         # Get productivity tip
```

### WebSocket Topics
```
/topic/session/{sessionId}      # Session updates
/app/session/{sessionId}/action # Session actions
```

## Real-time Communication

### WebSocket Flow
1. **Connection**: Client connects to `/ws` endpoint
2. **Subscription**: Subscribe to `/topic/session/{sessionId}`
3. **Actions**: Send messages to `/app/session/{sessionId}/action`
4. **Broadcast**: Server broadcasts updates to all subscribers

### Message Types
- `SESSION_STARTED`: Timer started
- `SESSION_PAUSED`: Timer paused
- `SESSION_COMPLETED`: Session finished
- `CYCLE_COMPLETED`: Pomodoro cycle finished
- `USER_JOINED`: New user joined session

## Deployment Architecture

### Development
- **Frontend**: React dev server (localhost:3000)
- **Backend**: Spring Boot (localhost:8080)
- **Database**: H2 in-memory database

### Production (Recommended)
- **Frontend**: Static hosting (Vercel, Netlify)
- **Backend**: Container deployment (Docker + Cloud Run/Heroku)
- **Database**: PostgreSQL (Cloud SQL, AWS RDS)
- **CDN**: Static assets via CDN

## Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Bundle Size**: Tree shaking unused dependencies
- **Caching**: Service worker for offline functionality

### Backend Optimizations
- **Connection Pooling**: Database connection management
- **Caching**: Redis for session state
- **Async Processing**: Non-blocking I/O for WebSocket
- **Load Balancing**: Multiple instances for scalability

## Security Measures

### Frontend Security
- **Environment Variables**: Secure API key management
- **HTTPS Enforcement**: Secure data transmission
- **CSP Headers**: Content Security Policy
- **XSS Prevention**: Input sanitization

### Backend Security
- **OAuth2 + JWT**: Secure authentication
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Request payload validation
- **CORS Configuration**: Cross-origin restrictions

## Monitoring & Observability

### Logging
- **Application Logs**: Structured JSON logging
- **Access Logs**: HTTP request logging
- **Error Tracking**: Exception monitoring

### Metrics
- **Performance**: Response times, throughput
- **Business**: User engagement, session completion rates
- **Infrastructure**: CPU, memory, database performance

## Future Enhancements

### Technical Improvements
- **Microservices**: Break down monolithic backend
- **Event Sourcing**: Activity log as event stream
- **GraphQL**: More flexible API queries
- **Progressive Web App**: Mobile app experience

### Feature Additions
- **Team Workspaces**: Organization-level sessions
- **Analytics Dashboard**: Productivity insights
- **Integrations**: Calendar, Slack, Notion
- **Mobile Apps**: Native iOS/Android applications