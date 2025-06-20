const socket = io();

        // DOM elements
        const loginScreen = document.getElementById('loginScreen');
        const chatScreen = document.getElementById('chatScreen');
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('usernameInput');
        const roomInput = document.getElementById('roomInput');
        const messagesDiv = document.getElementById('messages');
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const currentRoomSpan = document.getElementById('currentRoom');
        const sidebarUsername = document.getElementById('sidebarUsername');
        const userCountSpan = document.getElementById('userCount');
        const roomSearchInput = document.getElementById('roomSearchInput');
        const roomsList = document.getElementById('roomsList');
        const userAvatar = document.getElementById('userAvatar');
        const chatAvatar = document.getElementById('chatAvatar');
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        const sendBtn = document.getElementById('sendBtn');
        const typingIndicator = document.getElementById('typingIndicator');
        const messagesContainer = document.getElementById('messagesContainer');
        const sidebar = document.querySelector('.sidebar');
        const toggleSidebar = document.getElementById('toggleSidebar');

        let currentUser = '';
        let currentRoom = '';
        let isTyping = false;
        let typingTimeout;
        let rooms = new Set(['General']);

        // Emoji data
        const emojis = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏'];

        // Initialize emoji picker
        function initEmojiPicker() {
            emojiPicker.innerHTML = '';
            emojis.forEach(emoji => {
                const emojiItem = document.createElement('div');
                emojiItem.className = 'emoji-item';
                emojiItem.textContent = emoji;
                emojiItem.addEventListener('click', () => {
                    messageInput.value += emoji;
                    emojiPicker.classList.add('hidden');
                    messageInput.focus();
                });
                emojiPicker.appendChild(emojiItem);
            });
        }

        // Initialize rooms list
        function initRoomsList() {
            roomsList.innerHTML = '';
            rooms.forEach(room => {
                const roomItem = document.createElement('div');
                roomItem.className = `room-item ${room === currentRoom ? 'active' : ''}`;
                roomItem.innerHTML = `
                    <div class="room-icon">${room.charAt(0).toUpperCase()}</div>
                    <div class="room-info">
                        <h4>${room}</h4>
                        <div class="room-meta">Active now</div>
                    </div>
                `;
                roomItem.addEventListener('click', () => switchRoom(room));
                roomsList.appendChild(roomItem);
            });
        }

        // Switch room function
        function switchRoom(newRoom) {
            if (newRoom && newRoom !== currentRoom) {
                socket.emit('switch room', newRoom);
                currentRoom = newRoom;
                currentRoomSpan.textContent = newRoom;
                chatAvatar.textContent = newRoom.charAt(0).toUpperCase();
                
                // Clear messages when switching rooms
                messagesDiv.innerHTML = '';
                
                // Update rooms list
                initRoomsList();
            }
        }

        // Auto-resize textarea
        function autoResize() {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
        }

        // Handle login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const room = roomInput.value.trim() || 'General';
            
            if (username) {
                currentUser = username;
                currentRoom = room;
                
                // Join the chat
                socket.emit('join', { username, room });
                
                // Update UI
                sidebarUsername.textContent = username;
                userAvatar.textContent = username.charAt(0).toUpperCase();
                currentRoomSpan.textContent = room;
                chatAvatar.textContent = room.charAt(0).toUpperCase();
                
                // Add room to rooms set
                rooms.add(room);
                
                // Switch screens
                loginScreen.classList.add('hidden');
                chatScreen.classList.remove('hidden');
                
                // Initialize components
                initEmojiPicker();
                initRoomsList();
                
                // Focus on message input
                messageInput.focus();
            }
        });

        // Handle sending messages
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const message = messageInput.value.trim();
            if (message) {
                socket.emit('chat message', { message });
                messageInput.value = '';
                autoResize();
                
                // Stop typing indicator
                if (isTyping) {
                    socket.emit('stop typing');
                    isTyping = false;
                }
            }
        });

        // Handle room search/creation
        roomSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const newRoom = roomSearchInput.value.trim();
                if (newRoom) {
                    rooms.add(newRoom);
                    switchRoom(newRoom);
                    roomSearchInput.value = '';
                }
            }
        });

        // Handle typing
        messageInput.addEventListener('input', () => {
            autoResize();
            
            if (!isTyping) {
                socket.emit('typing');
                isTyping = true;
            }
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                socket.emit('stop typing');
                isTyping = false;
            }, 1000);
        });

        // Handle emoji picker
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.classList.toggle('hidden');
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.classList.add('hidden');
            }
        });

        // Toggle sidebar on mobile
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Linkify function to make URLs clickable
        function linkify(text) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>');
        }

        // Add smooth scrolling for messages
        function smoothScrollToBottom() {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }

        // Function to add messages to the chat
        function addMessage(data, type = 'regular') {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const isOwnMessage = data.username === currentUser;
            const isSystemMessage = type === 'system';
            
            if (isOwnMessage && !isSystemMessage) {
                messageDiv.classList.add('own');
            }
            
            if (isSystemMessage) {
                messageDiv.classList.add('system-message');
                messageDiv.innerHTML = `
                    <div class="message-bubble">
                        <div class="message-text">${data.message}</div>
                    </div>
                `;
            } else {
                const avatarLetter = data.username.charAt(0).toUpperCase();
                messageDiv.innerHTML = `
                    <div class="message-avatar">${avatarLetter}</div>
                    <div class="message-bubble">
                        <div class="message-header">
                            <span class="message-username">${data.username}</span>
                            <span class="message-time">${data.timestamp}</span>
                        </div>
                        <div class="message-text">${linkify(data.message)}</div>
                    </div>
                `;
            }
            
            messagesDiv.appendChild(messageDiv);
            
            // Smooth scroll to bottom
            setTimeout(() => {
                smoothScrollToBottom();
            }, 100);
        }

        // Add sound effects
        function playSound(type) {
            try {
                // Create audio context for sound effects
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                if (type === 'message') {
                    // Create a simple notification sound
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                }
            } catch (error) {
                console.log('Audio not supported or blocked:', error);
            }
        }

        // Add loading state for messages
        function showTypingIndicator(username) {
            const existingIndicator = document.querySelector('.typing-message');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            const typingMessage = document.createElement('div');
            typingMessage.className = 'message typing-message';
            typingMessage.innerHTML = `
                <div class="message-avatar">${username.charAt(0).toUpperCase()}</div>
                <div class="message-bubble">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            
            messagesDiv.appendChild(typingMessage);
            smoothScrollToBottom();
        }

        function hideTypingIndicator() {
            const typingMessage = document.querySelector('.typing-message');
            if (typingMessage) {
                typingMessage.remove();
            }
        }

        // ============================================
        // SOCKET EVENT LISTENERS (CONSOLIDATED)
        // ============================================

        // FIXED: Single message listener that handles both display and sound
        socket.on('message', (data) => {
            addMessage(data, 'regular');
            // Play sound only for messages from other users
            if (data.username !== currentUser) {
                playSound('message');
            }
        });

        socket.on('user joined', (data) => {
            addMessage(data, 'system');
        });

        socket.on('user left', (data) => {
            addMessage(data, 'system');
        });

        socket.on('room users', (count) => {
            userCountSpan.textContent = count;
        });

        socket.on('typing', (data) => {
            if (data.username !== currentUser) {
                showTypingIndicator(data.username);
            }
        });

        socket.on('stop typing', () => {
            hideTypingIndicator();
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Connection failed:', error);
            showNotification('Failed to connect to the server. Please try again.', 'error');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            showNotification('Disconnected from server', 'warning');
        });

        socket.on('reconnect', () => {
            showNotification('Reconnected to server', 'success');
        });

        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            
            switch(type) {
                case 'success':
                    notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                    break;
                case 'error':
                    notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
                    break;
                case 'warning':
                    notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
                    break;
                default:
                    notification.style.background = 'linear-gradient(135deg, #2196F3, #0b7dda)';
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        // Add CSS for notification animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            
            @keyframes heartFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(1.5);
                }
            }
        `;
        document.head.appendChild(style);

        // Handle Enter key for sending messages
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        });

        // Update send button state
        messageInput.addEventListener('input', () => {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText;
            sendBtn.style.opacity = hasText ? '1' : '0.5';
        });

        // Initialize send button state
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';

        // Handle window resize for mobile
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
            }
        });

        // Add message reactions
        function addMessageReactions() {
            document.addEventListener('dblclick', (e) => {
                if (e.target.closest('.message-bubble')) {
                    const messageElement = e.target.closest('.message');
                    // Add heart reaction animation
                    const heart = document.createElement('div');
                    heart.innerHTML = '❤️';
                    heart.style.cssText = `
                        position: absolute;
                        font-size: 20px;
                        pointer-events: none;
                        animation: heartFloat 1s ease-out forwards;
                        left: ${e.clientX}px;
                        top: ${e.clientY}px;
                        z-index: 1000;
                    `;
                    
                    document.body.appendChild(heart);
                    
                    setTimeout(() => {
                        document.body.removeChild(heart);
                    }, 1000);
                }
            });
        }

        // Initialize message reactions
        addMessageReactions();

        console.log('Modern Chat App initialized! 🚀');