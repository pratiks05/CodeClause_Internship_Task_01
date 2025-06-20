# 💬 Modern Real-Time Chat Application

A sleek, modern real-time chat application built with HTML, CSS, JavaScript, and Socket.IO. Features include multiple chat rooms, emoji support, typing indicators, and a responsive design that works seamlessly across desktop and mobile devices.

## ✨ Features

### 🎯 Core Features
- **Real-time messaging** with Socket.IO
- **Multiple chat rooms** with easy room switching
- **User authentication** with custom usernames
- **Responsive design** for desktop and mobile
- **Typing indicators** to show when users are typing
- **Message timestamps** for better conversation tracking
- **Auto-scrolling** to latest messages

### 🎨 Enhanced Features
- **Emoji picker** with popular emojis
- **URL linkification** - automatically converts URLs to clickable links
- **Sound notifications** for new messages
- **Message reactions** - double-click messages for heart animations
- **Smooth animations** and transitions
- **Connection status** notifications
- **Auto-resizing** message input field

### 📱 User Interface
- **Modern gradient design** with glassmorphism effects
- **Sidebar navigation** with room list and user info
- **Mobile-responsive** with hamburger menu
- **Dark theme** optimized for extended use
- **Intuitive user experience** with visual feedback

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: Socket.IO
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Text-based avatars and emoji support
- **Audio**: Web Audio API for notification sounds

## 📁 Project Structure

```
chat-app/
├── index.html              # Main HTML file
├── style.css               # Stylesheet with modern design
├── script.js               # Client-side JavaScript
├── server.js               # Node.js server with Socket.IO
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── assets/                 # Static assets (if any)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/modern-chat-app.git
   cd modern-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Package.json Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.0"
  }
}
```

## 🎮 How to Use

### Getting Started
1. **Enter your username** and optional room name
2. **Click "Join Chat"** to enter the chat room
3. **Start messaging** with other users in real-time

### Features Guide

#### 💬 Sending Messages
- Type your message in the input field
- Press **Enter** to send (Shift+Enter for new line)
- Messages appear instantly for all users in the room

#### 🏠 Room Management
- **Join existing rooms** from the sidebar
- **Create new rooms** by typing a room name in the search field
- **Switch between rooms** by clicking on room names

#### 😀 Using Emojis
- Click the **emoji button** (😀) next to the message input
- Select from popular emojis
- Emojis are inserted at cursor position

#### 👀 Visual Indicators
- **Typing indicators** show when someone is typing
- **Online user count** displays active users in current room
- **Message timestamps** show when messages were sent
- **Own messages** appear on the right with different styling

#### 🎵 Sound & Reactions
- **Sound notifications** play for new messages (from others)
- **Double-click messages** to add heart reaction animations
- **Connection status** notifications for network changes
