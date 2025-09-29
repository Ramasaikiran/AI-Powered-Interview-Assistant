 # AI-Powered Interview Assistant
 
Harness the power of AI to conduct mock interviews, evaluate candidates, and provide intelligent feedback. This repository contains everything you need to run the Interview Assistant app locally or deploy it on AI Studio.

 # Features
# Interviewee (Chat)

1. Upload resume (PDF required, DOCX optional).
2. Extracts Name, Email, Phone from resume.
3. If details are missing, chatbot collects them before starting.
4. Timed interview with 6 AI-generated questions (2 Easy → 2 Medium → 2 Hard).
5. Auto-submit when timer ends (Easy: 20s, Medium: 60s, Hard: 120s).
6. Final score + AI summary after interview completion.

 # Interviewer (Dashboard)

1. List of candidates ordered by score.
2. View candidate profile, chat history, and AI-generated summary.
3. Search & sort functionality.

 # Persistence

1. Data stored locally with state management (e.g., Redux + redux-persist / IndexedDB).
2. Progress, timers, and answers restore after refresh/reopen.
3. Welcome Back modal shown for unfinished sessions.
  # Run Locally

# Prerequisites: Node.js (v18+ recommended)

# Clone the repository

# bash
git clone https://github.com/Ramasaikiran/AI-Powered-Interview-Assistant.git
cd AI-Powered-Interview-Assistant

# Install dependencies

bash
npm install

# Set up environment variables
Create a `.env` file in the root directory and add your API key:

bash
VITE_OPENAI_API_KEY=your_api_key_here

# Run the app

bash
npm run dev

The app will be available at **[http://localhost:5173](http://localhost:5173)** by default.


## 📂 Project Structure

```text 
AI-Powered-Interview-Assistant/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Chat & Dashboard pages
│   ├── store/           # Redux slices & persistence
│   ├── services/        # AI API & resume parsing logic
│   ├── App.tsx          # Root component
│   └── main.tsx         # Vite entry
├── .env.example         # Example environment variables
├── package.json         # Dependencies & scripts
├── vite.config.ts       # Vite config
└── README.md
```

 # How It Works

1. Candidate uploads a resume (PDF required, DOCX optional).
2. System extracts Name, Email, Phone. Missing fields are collected via chat.
3. The AI interview flow begins:

    6 questions (2 Easy → 2 Medium → 2 Hard).
    Timed per question (Easy: 20s, Medium: 60s, Hard: 120s).
    Auto-submits answers when time runs out.
4. AI calculates a final score and generates a summary.
5. Interviewer Dashboard shows:

    Candidate list ordered by score.
    Detailed profile, chat history, and AI evaluation.
    Search & sort functionality.
6. Progress is saved locally. If the session is interrupted, a Welcome Back modal restores state.

 🧪 Testing & Linting

# Run tests

# bash
npm test

# Run ESLint

**bash**
npm run lint
 **Deployment**

Deploy this app to **Vercel**, **Netlify**, or any static hosting provider:

bash
npm run build
# Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



 # Roadmap & Improvements

1. Add voice-based interview support
2.  Extend question banks for different roles/industries
3. Enhance analytics in interviewer dashboard
4. Add multilingual support for global candidates
5. Support cloud-based persistence (beyond local storage)



 # License

This project is licensed under the MIT License.
