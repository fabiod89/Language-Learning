document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const languageModal = document.getElementById('languageModal');
    const appContent = document.getElementById('appContent');
    let sessionId = null;
    let selectedLanguage = null;

    // Show language selection modal on startup
    languageModal.style.display = 'flex';

    // Handle language selection
    document.querySelectorAll('.language-options button').forEach(button => {
        button.addEventListener('click', async (e) => {
            selectedLanguage = e.target.dataset.lang;
            languageModal.style.display = 'none';
            appContent.classList.remove('hidden');
            await initializeSession(selectedLanguage);
        });
    });

    // Handle user responses
    sendButton.addEventListener('click', sendResponse);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendResponse();
    });

    async function initializeSession(language) {
        try {
            // Start new chat session
            const startResponse = await fetch('/api/start-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language })
            });
            
            const sessionData = await startResponse.json();
            sessionId = sessionData.sessionId;
            
            // Get initial prompt
            const chatResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    message: "START_SESSION"
                })
            });

            updateInterface(await chatResponse.json());
            userInput.focus();
        } catch (error) {
            console.error('Session error:', error);
            alert('Failed to initialize session');
        }
    }

    async function sendResponse() {
        const message = userInput.value.trim();
        if (!message) return;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message })
            });

            updateInterface(await response.json());
            userInput.value = '';
        } catch (error) {
            console.error('Send error:', error);
            alert('Failed to send response');
        }
    }

    function updateInterface(data) {
        document.getElementById('level').textContent = data.Level;
        document.getElementById('languageOutput').textContent = data.Language_Output;
        document.getElementById('feedback').textContent = data.Feedback;
        document.getElementById('memoryList').innerHTML = data.memory
            .map(item => `<li>${item}</li>`)
            .join('');
    }
});