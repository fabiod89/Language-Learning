require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { startChatSession, sendMessage } = require('./gemini');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.post('/api/start-chat', async (req, res) => {
    try {
        const { language } = req.body;
        const chatSession = await startChatSession(language);
        const sessionId = Date.now().toString();
        
        // In-memory session storage (replace with database in production)
        req.app.locals.sessions = req.app.locals.sessions || new Map();
        req.app.locals.sessions.set(sessionId, chatSession);
        
        res.json({ sessionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const chatSession = req.app.locals.sessions.get(sessionId);
        
        if (!chatSession) {
            return res.status(404).json({ error: "Session not found" });
        }

        const response = await sendMessage(chatSession, message);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Main route
app.get('/', (req, res) => {
    res.render('index');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
