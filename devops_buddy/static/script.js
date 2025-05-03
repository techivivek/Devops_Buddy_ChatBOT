// DOM Elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
  userInput.focus();
});

// Handle sending messages
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage('user', message);
  userInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Simulate delay for bot response
  setTimeout(() => {
    removeTypingIndicator();
    fetchAnswer(message);
  }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
}

// Fetch answer from backend
function fetchAnswer(question) {
  fetch("/get_answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: question.toLowerCase() })
  })
    .then(response => response.json())
    .then(data => {
      addMessage('bot', data.answer);
    })
    .catch(error => {
      addMessage('bot', "Sorry, I'm having trouble connecting to the server. Please try again later.");
      console.error('Error:', error);
    });
}

// Add message to chat
function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('message-content');
  contentDiv.innerHTML = text.replace(/\n/g, '<br>');
  
  const timeSpan = document.createElement('span');
  timeSpan.classList.add('message-time');
  timeSpan.textContent = getCurrentTime();
  
  contentDiv.appendChild(timeSpan);
  messageDiv.appendChild(contentDiv);
  
  if (sender === 'bot') {
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('bot-avatar');
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    messageDiv.prepend(avatarDiv);
  }
  
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.id = 'typing-indicator';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.classList.add('typing-dot');
    typingDiv.appendChild(dot);
  }
  
  chatBox.appendChild(typingDiv);
  scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Scroll chat to bottom
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Insert quick question into input
function insertQuestion(element) {
  userInput.value = element.textContent;
  userInput.focus();
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Add animation to chat container when message is added
chatBox.addEventListener('DOMNodeInserted', (event) => {
  if (event.target.classList && event.target.classList.contains('message')) {
    event.target.style.animation = 'fadeIn 0.3s ease-out';
  }
});