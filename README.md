# 💬 Secure Chat Application

A real-time chat application with advanced security features including URL scanning, data leak prevention, and configurable security thresholds.

## ✨ Features

- **Real-time messaging** with Socket.IO
- **Room-based chat** with user management
- **URL security scanning** with configurable risk thresholds
- **Data leak prevention** - protects 5 confidential recipes stored in database using AI analysis
- **User authentication** with JWT tokens
- **Rate limiting** and spam protection
- **Configurable security settings** for easy customization
- **Easy deployment** with automated setup

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+ 
- MongoDB
- Google Gemini API key (for DLP features)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd checkpoint-chat-4_team

# Install dependencies
cd backend
npm install
```

### 3. Configuration

**Option A: Automated Setup (Recommended)**
```bash
npm run setup
```

**Option B: Manual Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your settings
nano .env
```

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` to access the application.

## ⚙️ Configuration

### 🎯 Key Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `URL_RISK_THRESHOLD` | Block messages with URLs scoring above this (0-100) | 70 |
| `DLP_ENABLED` | Enable data leak prevention | true |
| `DLP_THRESHOLD` | DLP similarity threshold (0.0-1.0) | 0.4 |
| `RATE_LIMIT_MESSAGES` | Messages per minute per user | 30 |
| `MAX_MESSAGE_LENGTH` | Maximum message length | 1000 |
| `BLOCKED_URL_CACHE_ENABLED` | Enable URL caching system | true |

### 🔧 Changing the URL Risk Threshold

The URL risk threshold determines when messages containing URLs are blocked. You can easily customize this:

```env
# More permissive (allows more URLs)
URL_RISK_THRESHOLD=80

# More restrictive (blocks more URLs) 
URL_RISK_THRESHOLD=60

# Very restrictive
URL_RISK_THRESHOLD=50
```

**Risk Score Ranges:**
- 0-30: Clean/Safe URLs
- 30-50: Low risk 
- 50-70: Medium risk
- 70-90: High risk (default threshold)
- 90-100: Very dangerous

### 📝 Environment Variables

All configuration is done through environment variables. Key variables include:

```env
# Server Configuration
PORT=3000
CORS_ORIGIN=*

# Database
MONGO_URI=mongodb://localhost:27017/chatapp

# Security
JWT_SECRET=your-secret-key
URL_RISK_THRESHOLD=70

# API Keys
GEMINI_API_KEY=your-gemini-api-key
VT_API_KEY=your-virustotal-api-key
```

See `env.example` for all available options.

## 🛡️ Security Features

### URL Scanning
- **Heuristic analysis** of URL patterns
- **URLHaus integration** for malware detection
- **VirusTotal integration** (optional) for enhanced checking
- **Configurable risk thresholds** for different security levels
- **Smart caching system** - blocked URLs are stored in database for instant future detection
- **Learning system** - improves performance and reduces API calls over time

### Data Leak Prevention (DLP)
- **AI-powered content analysis** using Google Gemini
- **Secret recipe protection** - monitors for 5 confidential recipes stored in database
- **Automatic content blocking** when users attempt to share recipe ingredients or details
- **Configurable sensitivity** levels
- **Automatic retry mechanism** for API reliability

### Authentication & Authorization
- **JWT-based authentication** with configurable expiration
- **bcrypt password hashing** with configurable salt rounds
- **Socket authentication** for real-time features

### Rate Limiting
- **Configurable message limits** per user
- **Time window customization**
- **Automatic blocking** of excessive requests

### Recipe Protection System
- **5 confidential recipes** stored securely in MongoDB database
- **AI-powered detection** analyzes messages for recipe ingredient leaks
- **Real-time blocking** prevents users from sharing recipe details in chat
- **Intelligent pattern matching** detects both full and partial recipe information
- **Configurable DLP sensitivity** for fine-tuning protection levels

## 🗂️ Project Structure

```
checkpoint-chat-4_team/
├── backend/
│   ├── config/
│   │   └── config.js          # Configuration management
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Room.js            # Chat room model
│   │   ├── Recipe.js          # 5 confidential recipes for DLP protection
│   │   └── BlockedUrl.js      # Cached blocked URLs for fast detection
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── roomsRouter.js     # Room management
│   ├── sockets/
│   │   └── chatSocket.js      # Real-time messaging
│   ├── utils/
│   │   ├── dlpChecker.js      # Data leak prevention
│   │   └── urlChecker.js      # URL security scanning
│   ├── middlewares/
│   │   └── authMiddleware.js  # JWT middleware
│   ├── server.js              # Main server file
│   ├── db.js                  # Database connection
│   ├── setup.js               # Interactive setup wizard
│   └── env.example            # Environment template
├── frontend/
│   ├── index.html             # Login page
│   ├── register.html          # Registration page
│   ├── rooms.html             # Room selection
│   ├── chat.html              # Chat interface
│   └── *.js, *.css           # Frontend assets
├── tests/
│   └── test_chat_app.py       # Test suite
├── SETUP.md                   # Detailed setup guide
├── DEPLOYMENT.md              # Deployment instructions
└── README.md                  # This file
```

## 🧪 Testing & Validation

### Configuration Testing
```bash
# Validate configuration
npm run config:validate

# Check database connection
npm run db:check

# View current configuration
npm run config:check
```

### API Testing
```bash
# Run test suite
cd tests
python test_chat_app.py
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[env.example](backend/env.example)** - Configuration reference

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "chat-app"

# Using Docker
docker-compose up -d
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🍳 Recipe Protection System

The application includes a sophisticated data leak prevention system that protects confidential company recipes:

### How It Works

1. **Database Storage**: 5 secret recipes are stored in the MongoDB database with their ingredients
2. **AI Analysis**: When users send messages, Google Gemini AI analyzes the content
3. **Pattern Detection**: The system detects attempts to share recipe names, ingredients, or preparation details
4. **Real-time Blocking**: Messages containing recipe information are blocked before being sent to other users
5. **User Notification**: The sender receives a warning that their message contains restricted content

### What Gets Blocked

- Complete recipe names and ingredients
- Partial ingredient lists from the protected recipes
- Attempts to describe preparation methods for protected recipes
- Any combination of ingredients that matches stored recipes

### Configuration

```env
# Enable/disable recipe protection
DLP_ENABLED=true

# DLP similarity threshold (0.0-1.0)
# Lower = less sensitive, Higher = more sensitive
DLP_THRESHOLD=0.4

# Configure AI sensitivity
DLP_MAX_RETRIES=5
DLP_BASE_DELAY=1000

# Gemini AI model for analysis
GEMINI_MODEL=gemini-1.5-flash
```

### Example Blocked Messages

❌ "The secret sauce has tomatoes, garlic, and olive oil"  
❌ "Recipe #3 uses chicken, herbs, and special spices"  
❌ "Here's how we make our signature dish..."

✅ "I love cooking with tomatoes"  
✅ "What's your favorite recipe?"  
✅ "The restaurant food was great"

## 🚫 Blocked URL Caching System

The application includes an intelligent URL caching system that learns from blocked URLs:

### How It Works

1. **First Detection**: When a malicious URL is detected through external APIs or heuristics
2. **Database Storage**: The URL is automatically saved to the MongoDB database with its risk score
3. **Instant Blocking**: Future attempts to share the same URL are blocked immediately without API calls
4. **Performance Boost**: Reduces external API usage and improves response times
5. **Statistics Tracking**: Tracks how many times each URL has been blocked

### Benefits

- **⚡ Faster blocking** - Instant detection of previously blocked URLs
- **💰 Reduced API costs** - Fewer calls to VirusTotal and other services  
- **📊 Better analytics** - Track which URLs are most commonly attempted
- **🧠 Learning system** - Gets smarter over time as more URLs are detected

### Management

Use the admin panel to manage blocked URLs:

```bash
npm run admin
# Select option 7: Blocked URL Management
```

Available operations:
- View statistics (total blocked, average scores, etc.)
- List recently blocked URLs
- Remove specific URLs from the blocked list
- Clear all blocked URLs

### Configuration

```env
# Enable/disable the caching system
BLOCKED_URL_CACHE_ENABLED=true

# Maximum URLs to store in database
BLOCKED_URL_MAX_ENTRIES=10000

# Auto cleanup old entries (24 hours)
BLOCKED_URL_CLEANUP_INTERVAL=86400000
BLOCKED_URL_AUTO_CLEANUP=true
```

## 🔧 Customization

### Adding New Security Rules

1. **URL Scanning**: Edit `utils/urlChecker.js` heuristic rules
2. **DLP Rules**: Modify prompts in `utils/dlpChecker.js`
3. **Rate Limiting**: Adjust limits in configuration
4. **Authentication**: Customize JWT settings

### Configuring for Different Environments

**Development:**
```env
NODE_ENV=development
URL_RISK_THRESHOLD=80
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
```

**Production:**
```env
NODE_ENV=production
URL_RISK_THRESHOLD=70
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

**High Security:**
```env
URL_RISK_THRESHOLD=50
DLP_ENABLED=true
RATE_LIMIT_MESSAGES=15
MAX_MESSAGE_LENGTH=500
```

## 🆘 Troubleshooting

### Common Issues

1. **Configuration errors**: Run `npm run config:validate`
2. **Database connection**: Run `npm run db:check`
3. **API key issues**: Verify keys in `.env` file
4. **Port conflicts**: Change `PORT` in configuration

### Getting Help

- Check console output for detailed error messages
- Review configuration with `npm run config:check`
- Ensure all required services are running
- Verify API keys and network connectivity

## 📜 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**🎉 Happy chatting with secure messaging!**

For more detailed information, check out the [setup guide](SETUP.md) and [deployment documentation](DEPLOYMENT.md).