document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const languageModal = document.getElementById('languageModal');
    const appContent = document.getElementById('appContent');
    const ttsButton = document.getElementById('ttsButton');
    
    let sessionId = null;
    let selectedLanguage = 'French';
    let currentPhrase = '';
    let synth = window.speechSynthesis;
    let voices = [];

    // Check TTS support
    if (!synth) {
        ttsButton.style.display = 'none';
    }

    // Load voices
    function loadVoices() {
        voices = synth.getVoices();
    }
    
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }

    // TTS functionality
    function speakText() {
        if (synth.speaking) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(currentPhrase);
        const langMap = {
            French: 'fr-FR',
            Spanish: 'es-ES',
            German: 'de-DE',
            Italian: 'it-IT',
            Japanese: 'ja-JP',
            'Portuguese (BR)': 'pt-BR',
            Korean: 'ko-KR',
            Khmer: 'km-KH'  // Khmer/Cambodian
        };

        utterance.lang = langMap[selectedLanguage];
        const suitableVoices = voices.filter(voice => 
            voice.lang === langMap[selectedLanguage] || 
            voice.lang.startsWith(langMap[selectedLanguage].split('-')[0])
        );

        utterance.voice = suitableVoices[0] || null;
        utterance.rate = 0.9;
        
        synth.speak(utterance);
    }

    // Event listeners
    document.querySelectorAll('.language-options button').forEach(button => {
        button.addEventListener('click', async (e) => {
            selectedLanguage = e.target.dataset.lang;
            languageModal.style.display = 'none';
            appContent.classList.remove('hidden');
            
            try {
                const response = await fetch('/api/start-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: selectedLanguage })
                });
                
                const data = await response.json();
                sessionId = data.sessionId;
                
                const aiResponse = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        message: "START_SESSION"
                    })
                });

                updateUI(await aiResponse.json());
                userInput.focus();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to start session');
            }
        });
    });

    async function sendResponse() {
        const message = userInput.value.trim();
        if (!message) return;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message })
            });

            const data = await response.json();
            updateUI(data);
            userInput.value = '';
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message');
        }
    }

    function updateUI(data) {
        currentPhrase = data.Language_Output;
        document.getElementById('level').textContent = data.Level;
        document.getElementById('languageOutput').textContent = currentPhrase;
        document.getElementById('feedback').textContent = data.Feedback;
        
        const memoryList = document.getElementById('memoryList');
        memoryList.innerHTML = data.memory.map(item => 
            `<li>${item}</li>`
        ).join('');
    }

    sendButton.addEventListener('click', sendResponse);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendResponse();
    });
    ttsButton.addEventListener('click', speakText);
});
