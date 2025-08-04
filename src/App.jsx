import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameMode, setGameMode] = useState("menu"); // 'menu', 'quiz', 'results', 'wordlist', 'edit'
  const [wordList, setWordList] = useState([
    "beautiful",
    "difficult",
    "knowledge",
    "necessary",
    "separate",
    "accommodate",
    "embarrass",
    "occurrence",
    "recommend",
    "successful",
    "appreciate",
    "experience",
    "independent",
    "opportunity",
    "responsible",
    "communication",
    "environment",
    "immediately",
    "occasionally",
    "particularly",
  ]);
  const [editingWord, setEditingWord] = useState("");
  const [newWord, setNewWord] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Try to find a suitable voice for Singaporeans
        const preferredVoices = voices.filter(
          (voice) =>
            voice.lang.includes("en") &&
            (voice.lang.includes("SG") ||
              voice.lang.includes("GB") ||
              voice.lang.includes("AU"))
        );

        if (preferredVoices.length > 0) {
          setSelectedVoice(preferredVoices[0]);
        } else if (voices.length > 0) {
          setSelectedVoice(voices[0]);
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voices to be loaded (some browsers load them asynchronously)
    if ("speechSynthesis" in window) {
      speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }

    return () => {
      if ("speechSynthesis" in window) {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      }
    };
  }, []);

  const startQuiz = () => {
    setGameMode("quiz");
    setScore(0);
    setTotalAttempts(0);
    setFeedback("");
    setIsCorrect(null);
    setUserInput("");
    getNewWord();
  };

  const getNewWord = () => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomWord);
    setUserInput("");
    setFeedback("");
    setIsCorrect(null);
  };

  const checkSpelling = () => {
    const isSpellingCorrect =
      userInput.toLowerCase().trim() === currentWord.toLowerCase();
    setIsCorrect(isSpellingCorrect);

    if (isSpellingCorrect) {
      setScore(score + 1);
      setFeedback("Correct! Well done! 🎉");
    } else {
      setFeedback(`Incorrect. The correct spelling is: "${currentWord}"`);
    }

    setTotalAttempts(totalAttempts + 1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      checkSpelling();
    }
  };

  const finishQuiz = () => {
    setGameMode("results");
  };

  const backToMenu = () => {
    setGameMode("menu");
  };

  const speakWord = () => {
    if ("speechSynthesis" in window && selectedVoice) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.voice = selectedVoice;
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthesis.speak(utterance);
    }
  };

  const getVoiceDisplayName = (voice) => {
    if (!voice) return "No voice available";

    const name = voice.name || "Unknown";
    const country = voice.lang ? voice.lang.split("-")[1] : "";

    let displayName = name;
    if (country) {
      displayName += ` (${country})`;
    }

    return displayName;
  };

  // Word list editing functions
  const addWord = () => {
    if (newWord.trim() && !wordList.includes(newWord.trim().toLowerCase())) {
      setWordList([...wordList, newWord.trim().toLowerCase()]);
      setNewWord("");
    }
  };

  const removeWord = (index) => {
    setWordList(wordList.filter((_, i) => i !== index));
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingWord(wordList[index]);
  };

  const saveEdit = () => {
    if (editingWord.trim()) {
      const updatedList = [...wordList];
      updatedList[editingIndex] = editingWord.trim().toLowerCase();
      setWordList(updatedList);
      setEditingIndex(-1);
      setEditingWord("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingWord("");
  };

  const handleAddKeyPress = (e) => {
    if (e.key === "Enter") {
      addWord();
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  if (gameMode === "menu") {
    return (
      <div className="app">
        <div className="container">
          <h1 className="title">📚 Spelling App</h1>
          <p className="subtitle">
            Test your spelling skills with challenging words!
          </p>

          <div className="menu-buttons">
            <button className="btn btn-primary" onClick={startQuiz}>
              Start Quiz
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setGameMode("wordlist")}
            >
              View Word List
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setGameMode("edit")}
            >
              Edit Word List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === "wordlist") {
    return (
      <div className="app">
        <div className="container">
          <h1 className="title">📝 Word List</h1>
          <div className="word-grid">
            {wordList.map((word, index) => (
              <div key={index} className="word-card">
                {word}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={backToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === "edit") {
    return (
      <div className="app">
        <div className="container">
          <h1 className="title">✏️ Edit Word List</h1>
          <p className="subtitle">
            Add, remove, or edit words in your spelling list
          </p>

          <div className="add-word-section">
            <h3>Add New Word</h3>
            <div className="add-word-input">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={handleAddKeyPress}
                placeholder="Enter a new word..."
                className="spelling-input"
              />
              <button className="btn btn-primary" onClick={addWord}>
                Add Word
              </button>
            </div>
          </div>

          <div className="word-list-edit">
            <h3>Current Words ({wordList.length})</h3>
            <div className="edit-word-grid">
              {wordList.map((word, index) => (
                <div key={index} className="edit-word-card">
                  {editingIndex === index ? (
                    <div className="edit-input-container">
                      <input
                        type="text"
                        value={editingWord}
                        onChange={(e) => setEditingWord(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button
                          className="btn btn-small btn-primary"
                          onClick={saveEdit}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={cancelEdit}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="word-display-container">
                      <span className="word-text">{word}</span>
                      <div className="word-actions">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => startEditing(index)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => removeWord(index)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="menu-buttons">
            <button className="btn btn-primary" onClick={backToMenu}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === "results") {
    const percentage =
      totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    return (
      <div className="app">
        <div className="container">
          <h1 className="title">🏆 Quiz Results</h1>
          <div className="results">
            <div className="result-card">
              <h2>Final Score</h2>
              <div className="score">
                {score}/{totalAttempts}
              </div>
              <div className="percentage">{percentage}%</div>
            </div>
            <div className="feedback-message">
              {percentage >= 80 && "Excellent! You're a spelling champion! 🏆"}
              {percentage >= 60 &&
                percentage < 80 &&
                "Good job! Keep practicing! 👍"}
              {percentage < 60 && "Keep practicing! You'll improve! 💪"}
            </div>
          </div>
          <div className="menu-buttons">
            <button className="btn btn-primary" onClick={startQuiz}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={backToMenu}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1 className="title">📝 Spelling Quiz</h1>
          <div className="stats">
            <span>Score: {score}</span>
            <span>Attempts: {totalAttempts}</span>
          </div>
        </div>

        <div className="quiz-area">
          <div className="word-display">
            <h2>Listen to the word:</h2>
            <div className="voice-controls">
              <button className="btn btn-audio" onClick={speakWord}>
                🔊 Play Word
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              >
                ⚙️ Voice Settings
              </button>
            </div>

            {showVoiceSettings && (
              <div className="voice-settings">
                <h4>Select Voice:</h4>
                <select
                  value={selectedVoice ? selectedVoice.name : ""}
                  onChange={(e) => {
                    const voice = availableVoices.find(
                      (v) => v.name === e.target.value
                    );
                    setSelectedVoice(voice);
                  }}
                  className="voice-select"
                >
                  {availableVoices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {getVoiceDisplayName(voice)}
                    </option>
                  ))}
                </select>
                {selectedVoice && (
                  <div className="current-voice">
                    <small>Current: {getVoiceDisplayName(selectedVoice)}</small>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="input-section">
            <label htmlFor="spelling-input">Type the word:</label>
            <input
              id="spelling-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter the spelling..."
              className={`spelling-input ${
                isCorrect === true
                  ? "correct"
                  : isCorrect === false
                  ? "incorrect"
                  : ""
              }`}
              autoFocus
            />
          </div>

          {feedback && (
            <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
              {feedback}
            </div>
          )}

          <div className="quiz-buttons">
            <button className="btn btn-primary" onClick={checkSpelling}>
              Check Spelling
            </button>
            <button className="btn btn-secondary" onClick={getNewWord}>
              Next Word
            </button>
            <button className="btn btn-secondary" onClick={finishQuiz}>
              Finish Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
