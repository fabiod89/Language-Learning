document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const languageModal = document.getElementById('languageModal');
    const appContent = document.getElementById('appContent');
    const ttsButton = document.getElementById('ttsButton');
    const languageOutput = document.getElementById('languageOutput');
    const feedback = document.getElementById('feedback');
    const memoryList = document.getElementById('memoryList');
    const levelDisplay = document.getElementById('level');
    
    // App State
    let sessionId = null;
    let selectedLanguage = null;
    let currentPhrase = '';
    let synth = window.speechSynthesis;
    let voices = [];
    let isSpeaking = false;

    // Initialize TTS
    function initializeTTS() {
        if (!synth) {
            console.warn('Text-to-Speech not supported in this browser');
            ttsButton.disabled = true;
            ttsButton.title = 'TTS not supported';
            return;
        }

        function loadVoices() {
            voices = synth.getVoices();
            console.log('Available voices:', voices);
            if (voices.length === 0) {
                setTimeout(loadVoices, 100);
            }
        }

        loadVoices();
        synth.onvoiceschanged = loadVoices;

        synth.addEventListener('error', (event) => {
            console.error('Speech Synthesis Error:', event.error);
            isSpeaking = false;
            ttsButton.disabled = false;
        });
    }

    // TTS Functionality
    function speakText() {
        if (!currentPhrase) return;
        
        if (isSpeaking) {
            synth.cancel();
            isSpeaking = false;
            ttsButton.disabled = false;
            return;
        }

        const utterance = new SpeechSynthesisUtterance(currentPhrase);
        
        // Language code mapping
        const langMap = {
            fr: 'fr-FR',     // French
            es: 'es-ES',     // Spanish
            de: 'de-DE',     // German
            it: 'it-IT',     // Italian
            jp: 'ja-JP',     // Japanese
            br: 'pt-BR',    // Portuguese (Brazil)
            kr: 'ko-KR',     // Korean
            kh: 'km-KH'      // Khmer
        };

        utterance.lang = langMap[selectedLanguage] || 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Find best matching voice
        const suitableVoices = voices.filter(voice => {
            return voice.lang === utterance.lang || 
                   voice.lang.startsWith(utterance.lang.split('-')[0]);
        });

        if (suitableVoices.length > 0) {
            utterance.voice = suitableVoices[0];
        } else {
            console.warn('No exact voice match for:', utterance.lang);
            const fallbackVoices = voices.filter(voice => 
                voice.lang.startsWith(utterance.lang.split('-')[0])
            );
            utterance.voice = fallbackVoices[0] || null;
        }

        // Event handlers
        utterance.onstart = () => {
            isSpeaking = true;
            ttsButton.disabled = false;
            ttsButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>`;
        };

        utterance.onend = utterance.onerror = () => {
            isSpeaking = false;
            ttsButton.disabled = false;
            ttsButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>`;
        };

        synth.speak(utterance);
        ttsButton.disabled = true;
    }

    // Initialize TTS
    initializeTTS();

    // Language Selection
    document.querySelectorAll('.language-options button').forEach(button => {
        button.addEventListener('click', async (e) => {
            selectedLanguage = e.currentTarget.dataset.lang;
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

    // Send User Response
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

    // Update UI
    function updateUI(data) {
        currentPhrase = data.Language_Output;
        levelDisplay.textContent = data.Level;
        languageOutput.textContent = currentPhrase;
        feedback.textContent = data.Feedback;
        
        memoryList.innerHTML = data.memory.map(item => 
            `<li>${item}</li>`
        ).join('');
    }

    // Event Listeners
    sendButton.addEventListener('click', sendResponse);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendResponse();
    });
    ttsButton.addEventListener('click', speakText);
});