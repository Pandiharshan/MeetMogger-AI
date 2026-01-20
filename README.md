# MeetMogger AI 🚀

**AI-Powered Call Transcript Analysis Platform**

MeetMogger AI is a modern, AI-driven web application designed to analyze customer call transcripts and extract meaningful insights such as sentiment, themes, and actionable items. It helps teams better understand customer conversations and make data-driven decisions.

---

## 🌐 Live Demo

🔗 **Live Demo (Demo Mode)**  
https://pandiharshan.github.io/MeetMogger-AI/

**Demo Credentials**
- Email: `demo@meetmogger.ai`
- Password: `demo123`

> **Note:**  
> The GitHub Pages demo runs in **Demo Mode** using mock data.  
> No backend server, database, or API keys are required.

---

## 🖼️ Screenshots

_Add screenshots to visually showcase the application._

```text
/screenshots
├── home.png
├── login.png
└── analysis.png
```

![Home Page](screenshots/home.png)
![Login Page](screenshots/login.png)
![Analysis Dashboard](screenshots/analysis.png)

## ✨ Key Features

🔐 **User Authentication**  
Secure JWT-based authentication with MongoDB

🎯 **Theme Classification**  
Automatically categorizes call transcripts by primary topic

😊 **Sentiment Analysis**  
Detects customer mood and tone

📋 **Actionable Insights**  
Extracts problems, solutions, and action items

🎨 **Modern UI**  
Clean, responsive dark-themed interface

⚡ **Real-Time Analysis**  
Instant AI-powered transcript processing

## 🛠️ Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication (bcryptjs)

**AI**
- Google Gemini API

## 🎮 Demo Mode

MeetMogger AI includes a Demo Mode for easy preview:

- No backend or database required
- No API keys needed
- Uses mock authentication and AI responses
- Automatically enabled on GitHub Pages

This mode allows anyone to explore the UI and features instantly.

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Pandiharshan/MeetMogger-AI.git
cd MeetMogger-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/meetmogger-ai
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
NODE_ENV=development
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Ensure MongoDB service is running
```

**Option B: MongoDB Atlas**
- Create a free cluster at https://www.mongodb.com/atlas
- Copy the connection string
- Replace MONGODB_URI in .env

### 5. Run the Application

**Start Backend**
```bash
npm run server
```

**Start Frontend**
```bash
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔐 Authentication

- JWT-based authentication (7-day expiry)
- Password hashing using bcrypt
- Protected API routes
- Secure environment-based configuration

## 🌐 API Endpoints

**Authentication**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Health**
- `GET /api/health`

## 🗄️ Database Schema

```javascript
User {
  name: String,
  email: String,
  password: String,
  createdAt: Date
}
```

## 🧠 Architecture Overview

```
React (Vite)
     ↓
Express API
     ↓
MongoDB Atlas
     ↓
Google Gemini AI
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to branch (`git push origin feature-name`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👥 Authors

- **Pandi Harshan K** — https://github.com/Pandiharshan
- **Mukesh Kumar**
- **Sabarishwaran R**

## 🙏 Acknowledgments

- Google Gemini AI
- MongoDB
- React & Vite
- Tailwind CSS

⭐ **Star this repository if you found it useful!**