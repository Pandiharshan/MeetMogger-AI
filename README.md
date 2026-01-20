# MeetMogger AI

**AI-Powered Call Transcript Analysis Platform**

MeetMogger AI is a full-stack web application that analyzes customer service call transcripts using artificial intelligence. The platform extracts key insights including sentiment analysis, conversation themes, identified problems, proposed solutions, and actionable next steps to help customer service teams improve their operations.

## 🌐 Live Demo

**Demo URL:** https://pandiharshan.github.io/MeetMogger-AI/

**Demo Credentials:**
- Email: `demo@meetmogger.ai`
- Password: `demo123`

> **Note:** The live demo runs in demo mode using mock data and simulated AI responses. No backend server or API keys are required for the demo experience.

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Login Page
![Login Page](screenshots/login.png)

### Analysis Dashboard
![Analysis Dashboard](screenshots/analysis.png)

## ⚡ Key Features

- **User Authentication** - JWT-based secure login and registration system
- **AI-Powered Analysis** - Automated transcript processing using Google Gemini AI
- **Sentiment Detection** - Identifies customer emotions and conversation tone
- **Theme Classification** - Categorizes calls by primary topic or issue type
- **Problem Identification** - Extracts specific customer issues from conversations
- **Solution Tracking** - Captures proposed solutions and resolutions
- **Action Items** - Generates follow-up tasks and next steps
- **Responsive Design** - Modern dark-themed interface optimized for all devices

## 🛠 Technology Stack

**Frontend**
- React 19 with TypeScript
- Vite for build tooling and development
- Tailwind CSS for styling
- Context API for state management

**Backend**
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt password hashing
- RESTful API architecture

**AI Integration**
- Google Gemini API for natural language processing
- Custom prompt engineering for structured analysis output

**Development & Deployment**
- GitHub for version control
- Vercel for frontend hosting
- Environment-based configuration

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or Atlas account)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pandiharshan/MeetMogger-AI.git
   cd MeetMogger-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/meetmogger-ai
   JWT_SECRET=your_secure_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   
   Backend server:
   ```bash
   npm run server
   ```
   
   Frontend development server:
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### System Endpoints
- `GET /api/health` - Server health check

## 🗄 Database Schema

```javascript
User {
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

## 🏗 Project Architecture

```
Frontend (React/Vite)
       ↓
   Express API
       ↓
   MongoDB Database
       ↓
   Google Gemini AI
```

## 🎯 Demo Mode vs Full Application

**Demo Mode (GitHub Pages)**
- Uses mock authentication and AI responses
- No backend server required
- Demonstrates UI/UX and core functionality
- Perfect for showcasing the project concept

**Full Application (Local/Production)**
- Real MongoDB database integration
- Actual Google Gemini AI processing
- Secure JWT authentication
- Complete end-to-end functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Development Team

- **Pandi Harshan K** - Full Stack Developer - [GitHub](https://github.com/Pandiharshan)
- **Mukesh Kumar** - Backend Developer
- **Sabarishwaran R** - Frontend Developer

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing capabilities
- MongoDB for database solutions
- React and Vite communities for excellent development tools
- Tailwind CSS for utility-first styling framework

---

*Built with modern web technologies and best practices for scalable, maintainable code.*