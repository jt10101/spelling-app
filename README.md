# 📚 Spelling App

A modern, interactive spelling application built with React and Vite. Test your spelling skills with challenging words and track your progress!

## ✨ Features

- **Interactive Spelling Quizzes**: Practice spelling with a curated list of challenging words
- **Audio Pronunciation**: Listen to words using browser speech synthesis
- **Real-time Feedback**: Get immediate feedback on your spelling attempts
- **Progress Tracking**: See your score and percentage accuracy
- **Beautiful UI**: Modern design with gradients, animations, and responsive layout
- **Word List View**: Browse all available words for practice
- **Multiple Game Modes**: Menu, quiz, and results screens

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## 🎮 How to Play

1. **Start Quiz**: Click "Start Quiz" to begin a new spelling challenge
2. **Listen**: Click the "🔊 Play Word" button to hear the word pronounced
3. **Spell**: Type the word in the input field
4. **Check**: Click "Check Spelling" or press Enter to submit your answer
5. **Continue**: Click "Next Word" to try another word
6. **Finish**: Click "Finish Quiz" to see your results

## 📱 Features in Detail

### Quiz Mode

- Random word selection from a curated list
- Audio pronunciation using Web Speech API
- Real-time input validation
- Score tracking and attempt counting
- Immediate feedback with correct/incorrect styling

### Word List

- Browse all available words
- Visual grid layout
- Hover effects for better UX

### Results Screen

- Final score display (correct/total attempts)
- Percentage accuracy calculation
- Encouraging feedback messages based on performance
- Options to retry or return to menu

## 🎨 Design Features

- **Modern UI**: Clean, minimalist design with gradient backgrounds
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper labels, focus states, and keyboard navigation
- **Color Coding**: Green for correct answers, red for incorrect ones

## 🛠️ Technical Stack

- **React 19**: Latest React with hooks for state management
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with gradients, animations, and flexbox/grid
- **Web Speech API**: Browser-based text-to-speech functionality

## 📝 Word List

The app includes 20 challenging words commonly misspelled:

- beautiful, difficult, knowledge, necessary, separate
- accommodate, embarrass, occurrence, recommend, successful
- appreciate, experience, independent, opportunity, responsible
- communication, environment, immediately, occasionally, particularly

## 🔧 Customization

You can easily customize the app by:

- Adding more words to the `wordList` array in `App.jsx`
- Modifying the color scheme in `App.css`
- Adding new game modes or features
- Implementing local storage for persistent scores

## 🚀 Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

Feel free to contribute to this project by:

- Adding more words to the list
- Improving the UI/UX
- Adding new features like difficulty levels
- Fixing bugs or improving performance

## 📄 License

This project is open source and available under the MIT License.
