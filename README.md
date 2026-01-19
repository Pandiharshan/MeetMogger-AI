# MeetMogger AI 🚀

A powerful AI-powered call transcript analysis tool that provides deep insights from customer conversations. Analyze themes, sentiment, and extract actionable items to drive your business forward.

## 🌐 Live Demo

**Frontend**: [https://meetmogger-ai.vercel.app](https://meetmogger-ai.vercel.app)  
**Backend API**: [https://meetmogger-ai-backend.onrender.com](https://meetmogger-ai-backend.onrender.com)

**Demo Credentials:**
- Email: `demo@meetmogger.ai`
- Password: `demo123`

*Note: The application supports both demo mode (mock data) and production mode (real backend).*

## ✨ Features

- **🔐 Secure Authentication**: JWT-based auth with bcrypt password hashing
- **🛡️ Production Security**: CORS protection, input validation, rate limiting ready
- **🎯 Theme Classification**: Automatically categorize calls by their primary topic
- **😊 Sentiment Analysis**: Understand customer mood and tone
- **📋 Actionable Extraction**: Extract problems, solutions, and action items
- **🎨 Modern UI**: Beautiful, responsive interface with dark theme
- **⚡ Real-time Analysis**: Instant AI-powered insights
- **🚀 Cloud Ready**: Deployed on Render (backend) and Vercel (frontend)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** security configuration

### AI & Services
- **Google Gemini API** for text analysis
- **MongoDB Atlas** for cloud database
- **Render** for backend hosting
- **Vercel** for frontend hosting

## 🔐 Authentication System

### Security Features
- ✅ **JWT tokens** with 7-day expiration
- ✅ **bcrypt password hashing** (12 salt rounds)
- ✅ **CORS protection** with origin whitelist
- ✅ **Input validation** and sanitization
- ✅ **Protected routes** with middleware
- ✅ **Token verification** on protected endpoints
- ✅ **Secure logout** with token invalidation
- ✅ **Environment variable protection**

### Authentication Flow
1. **Registration**: User creates account → Password hashed → JWT issued
2. **Login**: Credentials verified → JWT token returned
3. **Protected Access**: Token sent in Authorization header → Middleware validates
4. **Logout**: Token invalidated → Local storage cleared

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **Google Gemini API Key**

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Pandiharshan/MeetMogger-AI.git
cd MeetMogger-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and configure:

```bash
# Gemini AI API Key - Get from Google AI Studio
GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/meetmogger-ai

# JWT Secret - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-32-character-secret-key

# Server Configuration
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend API URL (for production)
VITE_API_BASE_URL=http://localhost:3001
```

**🔑 Getting a Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and replace `your_actual_gemini_api_key_here` in both `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY`

**Note:** The app will work in demo mode without a real API key, but you'll get mock analysis results.

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000/MeetMogger-AI/
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🌐 Deployment

### Backend (Render/Railway/Vercel)
1. **Environment Variables**:
   ```bash
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/meetmogger-ai
   JWT_SECRET=your-production-secret-32-chars-minimum
   GEMINI_API_KEY=your-gemini-api-key
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   NODE_ENV=production
   ```

2. **Deploy Commands**:
   - **Build**: `npm install`
   - **Start**: `npm start`

### Frontend (Vercel/Netlify)
1. **Environment Variables**:
   ```bash
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

2. **Deploy Commands**:
   - **Build**: `npm run build`
   - **Output**: `dist/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📱 Usage

### 1. Authentication
- **Register**: Create new account with name, email, password
- **Login**: Sign in with email and password
- **Demo Mode**: Use `demo@meetmogger.ai` / `demo123`

### 2. Transcript Analysis
- Paste call transcript in the input field
- Click "Analyze" for AI-powered insights
- View comprehensive analysis:
  - Theme classification
  - Sentiment analysis
  - Problems and solutions
  - Action items and summary

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start frontend (Vite)
npm run server       # Start backend (Express)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test-mongodb # Test MongoDB connection
```

## 🗄️ API Documentation

### Authentication Endpoints
```bash
POST /api/auth/register
Body: { name, email, password }
Response: { success, message, user, token }

POST /api/auth/login
Body: { email, password }
Response: { success, message, user, token }

GET /api/auth/me (Protected)
Headers: { Authorization: "Bearer <token>" }
Response: { success, user }

POST /api/auth/logout (Protected)
Headers: { Authorization: "Bearer <token>" }
Response: { success, message }
```

### Health Check
```bash
GET /api/health
Response: { status: "OK", message: "Server is running" }
```

## 🛡️ Security Features

### Production Security
- **CORS Protection**: Origin whitelist for cross-origin requests
- **JWT Security**: Strong secrets, proper expiration
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Input Validation**: Request body validation and sanitization
- **Environment Security**: Sensitive data in environment variables
- **HTTPS Ready**: Secure headers and protocols

### Security Best Practices
- No sensitive data in repository
- Strong JWT secrets (32+ characters)
- Secure MongoDB connection strings
- Protected API endpoints
- Token-based authentication
- Proper error handling

## 🐛 Troubleshooting

### Authentication Issues
1. **Login Failed**: Check MongoDB connection and user credentials
2. **Token Invalid**: Verify JWT_SECRET consistency between requests
3. **CORS Error**: Ensure frontend domain in ALLOWED_ORIGINS
4. **Protected Route 401**: Check Authorization header format: `Bearer <token>`

### Deployment Issues
1. **Backend 500 Error**: Check environment variables and MongoDB connection
2. **Frontend API Error**: Verify VITE_API_BASE_URL points to deployed backend
3. **Build Failures**: Ensure Node.js version 18+ and all dependencies installed

### Database Issues
1. **Connection Failed**: Check MONGODB_URI format and network access
2. **Authentication Error**: Verify MongoDB credentials
3. **Collection Not Found**: Database will auto-create on first user registration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Pandi Harshan K** - [@Pandiharshan](https://github.com/Pandiharshan)
- **Mukesh Kumar** - [@MukeshKumar-17](https://github.com/MukeshKumar-17)

## 🙏 Acknowledgments

- Google Gemini AI for powerful language analysis
- MongoDB Atlas for reliable cloud database
- Render for backend hosting
- Vercel for frontend hosting
- React ecosystem for development tools

---

**⭐ Star this repository if you found it helpful!**
