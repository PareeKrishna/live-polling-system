# Live Polling System (Intervue Poll)

A live interactive polling system for the classroom, where teachers can create polls in real-time and students can answer live. Constructed using React 19, Node.js, and Socket.IO, it supports live results, live chat, student management, and poll history—perfect for increasing participation in online and hybrid learning environments.

## 🚀 Recent Updates
- **Enhanced UI**: Added a sleek "Intervue Poll" badge with `lucide-react` Sparkles icon across the home page and teacher dashboard.
- **Improved Styling**: Increased badge size and padding for a more premium, modern look.

## ✨ Features

### For Teachers
- **Real-time Poll Creation**: Create polls with multiple choice options and set custom durations (15s to 120s).
- **Live Results Dashboard**: View student responses in real-time with dynamic progress bars and percentages.
- **Participant Management**: Monitor connected students and manage session participation.
- **Chat Integration**: Side-mounted chat for real-time classroom communication.
- **Student Management**: Ability to "kick" students from the session if needed.
- **Poll History**: Dedicated page to review past polls, their questions, and performance statistics.

### For Students
- **Seamless Participation**: Quick name registration to join the live session.
- **Interactive Voting**: Real-time poll reception with countdown timers.
- **Instant Results**: View performance and correct answers immediately after the poll ends.
- **Classroom Chat**: Communicate with the teacher and peers during the session.
- **Session Persistence**: Restores submission state and timer progress even after page refreshes.

### Technical Stack
- **Frontend**: React 19, TailwindCSS, Lucide React, Socket.IO Client, Axios, Vite.
- **Backend**: Node.js, Express, Socket.IO, MongoDB, Mongoose.
- **Real-time**: Bidirectional communication via WebSockets for zero-latency polling.

## 📁 Project Structure

```
Live-Polling-System/
├── backend/                 # Node.js + Express + Socket.IO server
│   ├── models/             # Mongoose schemas (Poll, Student, Response, Message)
│   ├── index.js            # Server entry point and REST API
│   ├── socket.js           # Socket.IO event handlers
│   └── .env                # Server configuration
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── components/     # UI components (Dashboard, Results, Chat, etc.)
│   │   ├── pages/          # Application views (Student, Teacher, History)
│   │   ├── App.jsx         # Main router and landing page
│   │   ├── socket.js       # Socket.IO client configuration
│   │   └── main.jsx        # Entry point
│   ├── tailwind.config.js  # Styling configuration
│   └── .env                # Frontend environment variables
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. `npm run dev` (starts with nodemon)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env`:
   ```env
   VITE_BACKEND_URI=http://localhost:5000
   ```
4. `npm run dev`

## 📡 API & Real-time

### REST API
- `GET /api/polls/history`: Fetches past polls with aggregated stats.

### Socket.IO Events
- `register-student`: Join as a student.
- `create-poll`: Teacher broadcasts a new question.
- `submit-answer`: Student sends their choice.
- `poll-started`: Emitted to all when a new poll begins.
- `poll-results`: Broadcasts results to all participants.
- `chat:message`: Real-time chat integration.
- `kick-student`: Teacher removes a participant.

## 🚀 Usage
1. Open the app and select **Teacher** to host a session.
2. Students join by selecting **Student** and entering their name.
3. Teacher creates a question, sets a timer, and clicks **Ask Question**.
4. Results appear live on all screens as students vote!

---
**Built for the future of interactive education.**
