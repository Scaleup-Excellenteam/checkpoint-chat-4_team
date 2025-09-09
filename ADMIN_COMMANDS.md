# 🛠️ Admin Commands Quick Reference

This file contains all the commands an administrator needs to configure and manage the chat application.

## 🚀 Initial Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run setup wizard (first time only)
npm run setup
```

## ⚙️ Configuration Management

### Quick Admin Panel
```bash
# Open interactive admin configuration tool
npm run admin
```
This provides a user-friendly interface to change:
- **URL Risk Threshold** (the score threshold you mentioned - currently 70)
- Rate limiting settings
- Message length limits
- Enable/disable security features

### Manual Configuration
```bash
# View current configuration
npm run config:check

# Validate configuration file
npm run config:validate

# Test database connection
npm run db:check
```

## 🎯 Changing URL Risk Threshold (Your Main Request)

### Method 1: Admin Panel (Easiest)
```bash
npm run admin
# Select option 1 to change URL Risk Threshold
# Enter new value (0-100)
```

### Method 2: Edit Environment File
```bash
# Edit .env file directly
nano .env

# Find and change this line:
URL_RISK_THRESHOLD=70

# Change 70 to your desired value (0-100)
URL_RISK_THRESHOLD=80  # More permissive
URL_RISK_THRESHOLD=60  # More restrictive
```

### Method 3: Environment Variable (Production)
```bash
# Set environment variable
export URL_RISK_THRESHOLD=75

# Or use PM2
pm2 set URL_RISK_THRESHOLD 75
pm2 restart chat-app
```

## 🎛️ Risk Threshold Guidelines

| Threshold | Security Level | Description |
|-----------|---------------|-------------|
| 0-30 | Very Low | Almost all URLs allowed |
| 30-50 | Low | Most URLs allowed, blocks obvious threats |
| 50-70 | Medium | Balanced protection (good for most uses) |
| **70** | **High** | **Default - recommended for most deployments** |
| 70-85 | Very High | Strict protection, may block some legitimate URLs |
| 85-100 | Maximum | Very restrictive, blocks many URLs |

## 🔄 Applying Changes

After changing configuration:

### Development
```bash
# Stop server (Ctrl+C) and restart
npm run dev
```

### Production with PM2
```bash
pm2 restart chat-app
```

### Production with Docker
```bash
docker-compose restart
```

## 📊 Monitoring & Testing

### Check Current Settings
```bash
# View all current configuration
npm run config:check

# Test URL blocking with current threshold
# (sends test messages to see what gets blocked)
npm run test:security  # If you create this script
```

### View Application Logs
```bash
# Development
# Check console output

# Production with PM2
pm2 logs chat-app

# Production with Docker
docker-compose logs -f app
```

## 🚨 Common Admin Tasks

### 1. Making URLs Less Strict (Allow More URLs)
```bash
npm run admin
# Select option 1
# Enter a higher number (e.g., 80 instead of 70)
```

### 2. Making URLs More Strict (Block More URLs)
```bash
npm run admin
# Select option 1  
# Enter a lower number (e.g., 60 instead of 70)
```

### 3. Disable URL Checking Completely
```bash
# Edit .env file
URL_RISK_THRESHOLD=100  # Effectively disables blocking
```

### 4. Enable Maximum Security
```bash
npm run admin
# Set URL_RISK_THRESHOLD=50
# Enable all security features
# Reduce rate limits
```

### 5. Reset to Defaults
```bash
# Copy from template
cp env.example .env
# Run setup again
npm run setup
```

## 🆘 Troubleshooting

### Configuration Issues
```bash
# Validate configuration
npm run config:validate

# If errors, check .env file format
# Ensure no spaces around = signs
# Ensure all required variables are set
```

### URL Blocking Not Working
```bash
# Check if API keys are set
grep GEMINI_API_KEY .env
grep VT_API_KEY .env

# Check threshold value
grep URL_RISK_THRESHOLD .env

# Restart application
npm run dev
```

### Too Many/Few URLs Being Blocked
```bash
# Adjust threshold using admin panel
npm run admin

# Monitor logs to see what's being blocked
tail -f logs/app.log  # If logging enabled
```

## 📋 Quick Environment Variables Reference

```env
# Security (Main Settings)
URL_RISK_THRESHOLD=70        # Your main setting!
DLP_ENABLED=true            # Data leak prevention
RATE_LIMIT_ENABLED=true     # Message rate limiting

# API Keys
GEMINI_API_KEY=your-key     # Required for DLP
VT_API_KEY=your-key         # Optional for enhanced URL checking

# Server
PORT=3000                   # Server port
NODE_ENV=production         # Environment mode

# Database  
MONGO_URI=mongodb://...     # Database connection
```

## 🎯 Summary for Quick Changes

**To change the URL blocking threshold (your main request):**

1. **Easiest**: `npm run admin` → Select option 1 → Enter new number
2. **Quick**: Edit `.env` file → Change `URL_RISK_THRESHOLD=70` to your desired value
3. **Restart**: `npm run dev` (development) or `pm2 restart chat-app` (production)

**The number you change determines how strict URL blocking is:**
- **Higher number (e.g., 80)** = Less strict, allows more URLs
- **Lower number (e.g., 60)** = More strict, blocks more URLs
- **Default 70** = Good balance for most use cases

---

**💡 Need help?** Run `npm run admin` for the user-friendly configuration tool!
