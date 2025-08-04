import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [gameMode, setGameMode] = useState("menu"); // 'menu', 'quiz', 'results', 'summary', 'wordlist', 'edit'
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
  const [quizWords, setQuizWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

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

  // Auto-play word when current word changes
  useEffect(() => {
    if (currentWord && gameMode === "quiz") {
      // Small delay to ensure the word is set
      const timer = setTimeout(() => {
        speakWord();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord, gameMode]);

  const startQuiz = () => {
    // Create a randomized copy of the word list
    const shuffledWords = [...wordList].sort(() => Math.random() - 0.5);
    setQuizWords(shuffledWords);
    setCurrentWordIndex(0);
    setUserInput("");
    setUserAnswers([]);
    setGameMode("quiz");
    setCurrentWord(shuffledWords[0]);
  };

  const getNewWord = () => {
    // Save current answer before moving to next word
    if (userInput.trim()) {
      const newAnswers = [...userAnswers];
      newAnswers[currentWordIndex] = userInput.trim();
      setUserAnswers(newAnswers);
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      setCurrentWordIndex(nextIndex);
      setCurrentWord(quizWords[nextIndex]);
      setUserInput("");
    } else {
      // Quiz completed - save final answer
      const finalAnswers = [...userAnswers];
      finalAnswers[currentWordIndex] = userInput.trim();
      setUserAnswers(finalAnswers);
      setGameMode("summary");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow letters (a-z, A-Z) and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
    setUserInput(lettersOnly);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getNewWord();
    }
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

  const previewVoice = (voice) => {
    if ("speechSynthesis" in window && voice) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "Hello, this is a preview"
      );
      utterance.voice = voice;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceChange = (e) => {
    const voice = availableVoices.find((v) => v.name === e.target.value);
    setSelectedVoice(voice);

    // Play preview when voice is selected
    if (voice) {
      previewVoice(voice);
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

  const checkAnswer = (userAnswer, correctWord) => {
    return userAnswer.toLowerCase() === correctWord.toLowerCase();
  };

  const getCorrectAnswersCount = () => {
    return userAnswers.filter((answer, index) =>
      checkAnswer(answer, quizWords[index])
    ).length;
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

          <div className="voice-settings-menu">
            <h3>🎤 Voice Settings</h3>
            <div className="voice-select-container">
              <select
                value={selectedVoice ? selectedVoice.name : ""}
                onChange={handleVoiceChange}
                className="voice-select-menu"
              >
                {availableVoices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {getVoiceDisplayName(voice)}
                  </option>
                ))}
              </select>
              <small className="voice-preview-hint">
                Select a voice to hear a preview
              </small>
            </div>
          </div>

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

  if (gameMode === "summary") {
    const correctCount = getCorrectAnswersCount();
    const percentage = Math.round((correctCount / quizWords.length) * 100);

    return (
      <div className="app">
        <div className="container">
          <h1 className="title">📊 Quiz Summary</h1>
          <div className="results">
            <div className="result-card">
              <h2>Final Results</h2>
              <div className="score">
                {correctCount}/{quizWords.length} correct
              </div>
              <div className="percentage">{percentage}%</div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Your Answers</h3>
            <div className="summary-grid">
              {quizWords.map((word, index) => {
                const userAnswer = userAnswers[index] || "";
                const isCorrect = checkAnswer(userAnswer, word);
                return (
                  <div
                    key={index}
                    className={`summary-item ${
                      isCorrect ? "correct" : "incorrect"
                    }`}
                  >
                    <div className="summary-word">
                      <strong>Word {index + 1}:</strong> {word}
                    </div>
                    <div className="summary-answer">
                      <strong>Your answer:</strong>{" "}
                      {userAnswer || "(no answer)"}
                    </div>
                    <div className="summary-result">
                      {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </div>
                  </div>
                );
              })}
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
        {/* Quiz Mode */}
        {gameMode === "quiz" && (
          <div className="quiz-container">
            <div className="header">
              <div className="title">
                <span className="icon">📚</span>
                <div>
                  <div>Spelling</div>
                  <div>Quiz</div>
                </div>
              </div>
              <button className="btn-back-menu" onClick={backToMenu}>
                ← Menu
              </button>
            </div>

            <div className="word-display">
              <div className="word-display-text">
                Word: {currentWordIndex + 1}/{quizWords.length}
              </div>
              <button
                className="btn btn-play"
                onClick={() => speakWord(currentWord)}
              >
                🔊 Play Word Again
              </button>
            </div>

            <div className="input-section">
              <div className="input-label">Type the word:</div>
              <input
                type="text"
                className="spelling-input"
                value={userInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter the spelling..."
                autoFocus
              />
            </div>

            <div className="quiz-buttons">
              <button className="btn btn-primary" onClick={getNewWord}>
                Next Word
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
