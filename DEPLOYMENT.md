# 🚀 Deployment Guide

This guide covers different deployment scenarios for your chat application.

## 📦 Deployment Options

### 1. Local Development

```bash
cd backend
npm run setup  # Configure environment
npm run dev    # Start development server
```

### 2. Production Server

#### Prerequisites
- Node.js 16+
- MongoDB
- PM2 (process manager)
- NGINX (reverse proxy)

#### Steps

1. **Prepare the server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy application:**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd checkpoint-chat-4_team/backend
   
   # Install dependencies
   npm install --production
   
   # Setup environment
   npm run setup
   
   # Start with PM2
   pm2 start server.js --name "chat-app"
   pm2 save
   pm2 startup
   ```

3. **Configure NGINX:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 3. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Copy frontend
COPY frontend/ ./public/

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/chatapp
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - URL_RISK_THRESHOLD=70
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### Deploy with Docker
```bash
# Create .env file
cp backend/env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 4. Cloud Deployment

#### Heroku

1. **Prepare for Heroku:**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-app-name
   ```

2. **Configure environment:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set GEMINI_API_KEY=your-key
   heroku config:set MONGO_URI=your-mongodb-atlas-uri
   heroku config:set URL_RISK_THRESHOLD=70
   ```

3. **Deploy:**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

#### AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04)
2. **Configure security groups** (ports 22, 80, 443, 3000)
3. **Follow production server steps** above
4. **Configure domain and SSL:**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

#### DigitalOcean Droplet

Similar to AWS EC2, but:
1. **Create droplet** with Ubuntu
2. **Follow production server setup**
3. **Use DigitalOcean's managed MongoDB** if needed

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com

# Database
MONGO_URI=mongodb://localhost:27017/chatapp

# Security
JWT_SECRET=your-super-secure-secret
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=12

# URL Security
URL_RISK_THRESHOLD=70
URL_CHECK_TIMEOUT=1500
MAX_URLS_PER_MESSAGE=5

# APIs
GEMINI_API_KEY=your-gemini-key
VT_API_KEY=your-virustotal-key

# Features
DLP_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MESSAGES=30

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/chatapp/app.log
```

## 📊 Monitoring

### Health Check Endpoint
Add to your application:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    version: require('./package.json').version
  });
});
```

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs chat-app

# Restart application
pm2 restart chat-app

# View process info
pm2 info chat-app
```

### Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/chatapp

# Content:
/var/log/chatapp/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 your-user your-user
    postrotate
        pm2 reload chat-app
    endscript
}
```

## 🔒 Security Checklist

### Before Production

- [ ] Change default JWT_SECRET
- [ ] Set specific CORS_ORIGIN (not *)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Update all dependencies
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all security features
- [ ] Review log settings
- [ ] Set up fail2ban (if applicable)

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Monitor logs weekly
- [ ] Review security settings
- [ ] Backup database regularly
- [ ] Test disaster recovery
- [ ] Monitor resource usage

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission errors:**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x backend/server.js
   ```

3. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

4. **Environment variables not loading:**
   ```bash
   # Check .env file exists and has correct permissions
   ls -la .env
   pm2 restart chat-app --update-env
   ```

### Performance Optimization

1. **Enable compression:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Configure PM2 cluster mode:**
   ```bash
   pm2 start server.js -i max --name "chat-app"
   ```

3. **Setup Redis for session storage:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

## 📈 Scaling

### Horizontal Scaling

1. **Load balancer configuration**
2. **Shared session storage (Redis)**
3. **Database clustering**
4. **CDN for static assets**

### Vertical Scaling

1. **Increase server resources**
2. **Optimize database queries**
3. **Implement caching**
4. **Monitor performance metrics**

---

**🎯 Your application is now ready for production deployment!**

Choose the deployment method that best fits your needs and infrastructure requirements.
