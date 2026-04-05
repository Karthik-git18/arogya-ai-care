let chatContext = { symptoms: [] };

// Helper to format structured markdown-like AI responses into HTML
function formatAIResponse(text) {
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Newlines
    formatted = formatted.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    
    return formatted;
}

// Add message to DOM
function appendMessage(sender, text, isHtml = false) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;
    msgDiv.style.display = 'flex';
    msgDiv.style.alignItems = 'flex-start';
    msgDiv.style.marginBottom = '20px';
    msgDiv.style.gap = '12px';
    
    // Layout based on sender
    if (sender === 'user') {
        msgDiv.style.justifyContent = 'flex-end';
        msgDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 14px 20px; border-radius: 20px 20px 0 20px; font-size: 15px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); max-width: 80%; line-height: 1.5;">
                ${text}
            </div>
        `;
    } else {
        msgDiv.style.justifyContent = 'flex-start';
        msgDiv.innerHTML = `
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); flex-shrink: 0; outline: 3px solid rgba(16, 185, 129, 0.2);">👨‍⚕️</div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #e0e7ff; padding: 16px 20px; border-radius: 20px 20px 20px 0; font-size: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); max-width: 85%; line-height: 1.6; backdrop-filter: blur(10px);">
                ${isHtml ? formatAIResponse(text) : text}
            </div>
        `;
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Typing Indicator methods
function showTyping() {
    const chatBox = document.getElementById('chat-box');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.display = 'flex';
    typingDiv.style.alignItems = 'flex-start';
    typingDiv.style.marginBottom = '20px';
    typingDiv.style.gap = '12px';
    
    typingDiv.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); flex-shrink: 0; outline: 3px solid rgba(16, 185, 129, 0.2);">👨‍⚕️</div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #0ea5e9; padding: 14px 20px; border-radius: 20px 20px 20px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
            AI is thinking <span class="dot-1" style="font-size:24px; line-height:0;">.</span><span class="dot-2" style="font-size:24px; line-height:0;">.</span><span class="dot-3" style="font-size:24px; line-height:0;">.</span>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    
    // Simple animation style injected
    if (!document.getElementById('typing-style')) {
        const style = document.createElement('style');
        style.id = 'typing-style';
        style.innerHTML = `
            @keyframes blink { 0% { opacity: 0.2; transform:translateY(0)} 20% { opacity: 1; transform:translateY(-2px) } 100% { opacity: 0.2; transform:translateY(0) } }
            .dot-1 { animation: blink 1.4s infinite both; }
            .dot-2 { animation: blink 1.4s infinite both; animation-delay: 0.2s; }
            .dot-3 { animation: blink 1.4s infinite both; animation-delay: 0.4s; }
        `;
        document.head.appendChild(style);
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

async function sendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    appendMessage('user', message);
    input.value = '';
    
    // Show AI typing
    showTyping();
    
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message, 
                context: chatContext,
                reportData: window.currentReportData || {}
            })
        });
        
        const data = await response.json();
        
        // Hide typing
        hideTyping();
        
        if (data.context) {
            chatContext = data.context;
        }
        
        // Output response
        appendMessage('bot', data.response || "Sorry, I couldn't process that.", true);
        
    } catch(err) {
        hideTyping();
        appendMessage('bot', '❌ Network Error: ' + err.message, true);
        console.error('Chat error:', err);
    }
}

// Global hook for quick prompt chips
window.sendQuickPrompt = function(promptText) {
    const input = document.getElementById('message-input');
    input.value = promptText;
    sendMessage();
};

// Initialize suggested prompts
document.addEventListener('DOMContentLoaded', () => {
    // We target the chat section.
    // In dashboard.html, the chat form surrounds the input.
    const chatForm = document.getElementById('chat-form');
    if (!chatForm) return;
    
    const promptsHTML = `
        <div style="display:flex; gap:8px; margin-bottom:15px; flex-wrap:wrap; justify-content:center; padding-top: 10px;">
            <button onclick="sendQuickPrompt('I have fever and headache')" style="background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); color: #0ea5e9; border-radius: 20px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" onmouseover="this.style.background='rgba(14,165,233,0.2)'" onmouseout="this.style.background='rgba(14,165,233,0.1)'">🤒 I have fever</button>
            <button onclick="sendQuickPrompt('I have severe chest pain')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 20px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">⚠️ Chest Pain</button>
            <button onclick="sendQuickPrompt('Explain my uploaded report')" style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; border-radius: 20px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" onmouseover="this.style.background='rgba(34,197,94,0.2)'" onmouseout="this.style.background='rgba(34,197,94,0.1)'">📄 Explain Report</button>
            <button onclick="sendQuickPrompt('What should I eat to stay fit?')" style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); color: #a855f7; border-radius: 20px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" onmouseover="this.style.background='rgba(168,85,247,0.2)'" onmouseout="this.style.background='rgba(168,85,247,0.1)'">🥗 Diet advice</button>
        </div>
    `;
    
    // Insert prompts just before the chat form
    chatForm.insertAdjacentHTML('beforebegin', promptsHTML);
});
