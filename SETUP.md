# 🚀 Chat Application Setup Guide

This guide will help you set up and configure the chat application for development or production use.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)

## 🎯 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd checkpoint-chat-4_team

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if needed)
cd ../frontend
# No package.json here - frontend uses vanilla JS
```

### 2. Automated Setup (Recommended)

The easiest way to configure the application:

```bash
cd backend
npm run setup
```

This interactive wizard will:
- Create your `.env` file
- Configure database connection
- Set up API keys
- Generate secure JWT secrets
- Validate the configuration

### 3. Manual Setup (Alternative)

If you prefer manual configuration:

```bash
# Copy the environment template
cd backend
cp env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

### 4. Start the Application

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000` (or your configured port).

## ⚙️ Configuration Options

### 🔑 Required Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/chatapp` |
| `GEMINI_API_KEY` | Google Gemini API key for DLP | Get from [Google AI](https://ai.google.dev/) |
| `JWT_SECRET` | Secret key for JWT tokens | Auto-generated or custom |

### 🛡️ Security Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `URL_RISK_THRESHOLD` | 70 | Block messages with URLs scoring above this (0-100) |
| `DLP_ENABLED` | true | Enable data leak prevention |
| `RATE_LIMIT_ENABLED` | true | Enable rate limiting |
| `RATE_LIMIT_MESSAGES` | 30 | Messages per minute per user |

### 🌐 Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `CORS_ORIGIN` | * | CORS allowed origins |
| `NODE_ENV` | development | Environment mode |

### 🔧 Advanced Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `URL_CHECK_TIMEOUT` | 1500 | URL checking timeout (ms) |
| `MAX_URLS_PER_MESSAGE` | 5 | Max URLs to check per message |
| `MAX_MESSAGE_LENGTH` | 1000 | Maximum message length |
| `BCRYPT_SALT_ROUNDS` | 10 | Password hashing rounds |

## 🗄️ Database Setup

### Local MongoDB

1. **Install MongoDB** following the [official guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB service:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Configure connection:**
   ```env
   MONGO_URI=mongodb://localhost:27017/chatapp
   ```

### MongoDB Atlas (Cloud)

1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster** and get connection string

3. **Configure connection:**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
   ```

## 🔐 API Keys Setup

### Google Gemini API (Required for DLP)

1. **Get API key** from [Google AI Studio](https://ai.google.dev/)
2. **Add to configuration:**
   ```env
   GEMINI_API_KEY=your-api-key-here
   ```

### VirusTotal API (Optional)

1. **Get API key** from [VirusTotal](https://www.virustotal.com/gui/my-apikey)
2. **Add to configuration:**
   ```env
   VT_API_KEY=your-virustotal-api-key
   ```

## 🧪 Testing Configuration

### Validate Configuration
```bash
npm run config:validate
```

### Test Database Connection
```bash
npm run db:check
```

### View Current Configuration
```bash
npm run config:check
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (not default)
- [ ] Configure specific `CORS_ORIGIN` (not `*`)
- [ ] Set up HTTPS/SSL
- [ ] Configure proper MongoDB connection
- [ ] Set up process manager (PM2)
- [ ] Configure logging

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "chat-app"

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatapp
JWT_SECRET=your-super-secure-secret-key
URL_RISK_THRESHOLD=70
GEMINI_API_KEY=your-gemini-api-key
VT_API_KEY=your-virustotal-api-key
```

## 🛠️ Customization

### Changing URL Risk Threshold

The URL risk threshold determines when messages with URLs are blocked:

```env
# More permissive (allows more URLs)
URL_RISK_THRESHOLD=80

# More restrictive (blocks more URLs)
URL_RISK_THRESHOLD=60
```

### Disabling Features

```env
# Disable data leak prevention
DLP_ENABLED=false

# Disable rate limiting
RATE_LIMIT_ENABLED=false

# Disable specific features
FEATURE_USER_REGISTRATION=false
FEATURE_ROOM_CREATION=false
```

## 🔍 Troubleshooting

### Common Issues

1. **"Configuration validation errors"**
   - Check all required environment variables are set
   - Ensure API keys are valid

2. **"MongoDB connection failed"**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure network access (for Atlas)

3. **"Invalid token" errors**
   - Verify `JWT_SECRET` is set correctly
   - Check token expiration settings

4. **URLs not being checked**
   - Verify `GEMINI_API_KEY` is set
   - Check API key permissions
   - Ensure network connectivity

### Debug Mode

```env
LOG_LEVEL=debug
```

### Support

- Check the console output for detailed error messages
- Verify all services are running
- Test individual components using the npm scripts

## 📝 Configuration File Reference

All configuration is managed through environment variables and loaded via `config/config.js`. You can:

1. **Edit `.env` file** for local changes
2. **Set environment variables** for production
3. **Use the setup wizard** for guided configuration

The configuration system validates all settings on startup and provides helpful error messages for missing or invalid values.

---

**🎉 That's it! Your chat application should now be ready to run.**

For additional help, check the console output when starting the application - it provides detailed feedback about the configuration and startup process.
