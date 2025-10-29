# Contributing to FocusFlow

Thank you for your interest in contributing to FocusFlow! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6+

### Local Development

1. **Backend Setup**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

2. **Frontend Setup**
   ```bash
   cd focusflow-frontend
   npm install
   npm start
   ```

### Environment Variables

Create a `.env.local` file in the project root:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Code Style

### Java
- Follow Google Java Style Guide
- Use meaningful variable names
- Add JavaDoc for public methods
- Keep methods under 30 lines when possible

### JavaScript/React
- Use ESLint and Prettier
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

## Testing

### Backend Tests
```bash
./mvnw test
```

### Frontend Tests
```bash
cd focusflow-frontend
npm test
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation if needed
7. Commit with descriptive messages
8. Push to your fork
9. Create a Pull Request

## Issue Guidelines

When creating issues:
- Use descriptive titles
- Provide steps to reproduce bugs
- Include system information
- Add screenshots for UI issues
- Tag with appropriate labels

## Code Review

All PRs require:
- At least one code review
- Passing CI/CD checks
- Updated documentation
- No merge conflicts

## Questions?

Feel free to open an issue for any questions about contributing!