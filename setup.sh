#!/bin/bash

echo "🚀 Setting up FocusFlow development environment..."

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file - please edit it with your Google OAuth credentials"
else
    echo "✅ .env file already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
./mvnw clean install -DskipTests

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd focusflow-frontend
npm install
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your Google OAuth credentials (optional)"
echo "2. Run backend: ./mvnw spring-boot:run"
echo "3. Run frontend: cd focusflow-frontend && npm start"
echo ""
echo "🔗 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo ""
echo "💡 Note: OAuth login won't work until you configure Google credentials in .env"