import { useState, useEffect } from "react";
import { defaultWordList, wordLists } from "./wordList";
import "./App.css";

function App() {
  const [gameMode, setGameMode] = useState("menu"); // 'menu', 'quiz', 'results', 'summary', 'wordlist', 'edit', 'select'
  const [wordList, setWordList] = useState(defaultWordList);
  const [selectedWordListName, setSelectedWordListName] = useState(
    "Spelling 14 - 6 August"
  ); // For continuity, this needs to be fixed so that I pull the latest word list instead of having to manually update the word list name
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [editingWord, setEditingWord] = useState("");
  const [newWord, setNewWord] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [sttEnabled, setSttEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechTranscripts, setSpeechTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      // Filter to only English and Chinese voices, excluding problematic voices
      const filteredVoices = voices.filter(
        (voice) =>
          (voice.lang.startsWith("en") || voice.lang.startsWith("zh")) && //   "Cellos", //   "Bubbles", //   "Boing", //   "Bad News", // ![
          //   "Bells",
          //   "Bahh",
          //   "Albert",
          //   "Eddy (English (United Kingdom))",
          //   "Eddy (English (United States))",
          //   "Eddy (Chinese (China mainland))",
          //   "Eddy (Chinese (Taiwan))",
          //   "Flo (English (United Kingdom))",
          //   "Flo (English (United States))",
          //   "Flo (Chinese (China mainland))",
          //   "Flo (Chinese (Taiwan))",
          //   "Fred",
          //   "Good News",
          // ].includes(voice.name)
          [
            "Arthur",
            "Catherine",
            "Gordon",
            "Daniel (English (United Kingdom))",
          ].includes(voice.name)
      );
      setAvailableVoices(filteredVoices);

      // Try to find a Singaporean, British, or Australian English voice
      const preferredVoice = filteredVoices.find(
        (voice) =>
          voice.lang === "en-SG" ||
          voice.lang === "en-GB" ||
          voice.lang === "en-AU"
      );

      if (preferredVoice) {
        setSelectedVoice(preferredVoice);
      } else if (filteredVoices.length > 0) {
        setSelectedVoice(filteredVoices[0]);
      }
    };

    if ("speechSynthesis" in window) {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Remove spaces and convert to lowercase for comparison
        const cleanTranscript = transcript.replace(/\s+/g, "").toLowerCase();
        const currentWordLower = currentWord.toLowerCase();

        // Check if user is just repeating the word
        if (cleanTranscript === currentWordLower) {
          // Don't set the input if they're just repeating the word
          setIsListening(false);
          return;
        }

        // Remove spaces and filter to letters, commas, and periods only
        const allowedChars = transcript
          .replace(/[^a-zA-Z,.]/g, "")
          .replace(/\s+/g, "");
        setUserInput(allowedChars);

        // Save the original transcript for later
        setCurrentTranscript(transcript);

        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if ("speechSynthesis" in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-play word when it changes
  useEffect(() => {
    if (currentWord && gameMode === "quiz") {
      // Small delay to ensure the word is set
      const timer = setTimeout(() => {
        speakWord(currentWord);
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
    setUserAnswers([]); // Reset answers for new quiz
    setSpeechTranscripts([]); // Reset transcripts for new quiz
    setCurrentTranscript(""); // Reset current transcript
    setGameMode("quiz");
    setCurrentWord(shuffledWords[0]);
  };

  const getNewWord = () => {
    // Save current answer before moving to next word
    if (userInput.trim()) {
      const newAnswers = [...userAnswers];
      newAnswers[currentWordIndex] = userInput.trim();
      setUserAnswers(newAnswers);

      // Save current transcript if it exists
      if (currentTranscript) {
        const newTranscripts = [...speechTranscripts];
        newTranscripts[currentWordIndex] = currentTranscript;
        setSpeechTranscripts(newTranscripts);
        setCurrentTranscript(""); // Clear current transcript
      }
    }

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < quizWords.length) {
      setCurrentWordIndex(nextIndex);
      setCurrentWord(quizWords[nextIndex]);
      setUserInput("");
    } else {
      // Quiz completed - save final answer and go to summary
      const finalAnswers = [...userAnswers];
      finalAnswers[currentWordIndex] = userInput.trim();
      setUserAnswers(finalAnswers);

      // Save final transcript if it exists
      if (currentTranscript) {
        const finalTranscripts = [...speechTranscripts];
        finalTranscripts[currentWordIndex] = currentTranscript;
        setSpeechTranscripts(finalTranscripts);
        setCurrentTranscript(""); // Clear current transcript
      }

      setGameMode("summary");
    }
  };

  // Function to speak the current word
  const speakWord = (word) => {
    if ("speechSynthesis" in window && word) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.voice = selectedVoice;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  // Function to start speech recognition
  const startListening = () => {
    if (recognition && sttEnabled) {
      recognition.start();
    }
  };

  // Function to play back speech transcript
  const playSpeechTranscript = (transcript) => {
    if ("speechSynthesis" in window && transcript) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.voice = selectedVoice;
      utterance.rate = 0.6; // Slower playback for clearer understanding
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow letters, spaces, commas, and periods
    const allowedChars = value.replace(/[^a-zA-Z\s,.]/g, "");
    setUserInput(allowedChars);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getNewWord();
    }
  };

  const backToMenu = () => {
    setGameMode("menu");
  };

  const selectWordList = (listName) => {
    setSelectedWordListName(listName);
    setWordList(wordLists[listName]);
    setGameMode("menu");
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

          <div className="word-list-info">
            <h3>📚 Current Word List</h3>
            <p className="selected-list-name">
              {selectedWordListName} ({wordList.length} words)
            </p>
          </div>

          <div className="menu-buttons">
            <button className="btn btn-primary" onClick={startQuiz}>
              Start Quiz
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setGameMode("select")}
            >
              Select Word List
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

  if (gameMode === "select") {
    return (
      <div className="app">
        <div className="container">
          <h1 className="title">📚 Select Word List</h1>
          <p className="subtitle">
            Choose which words you want to practice with
          </p>

          <div className="word-list-selection">
            {Object.keys(wordLists).map((listName) => (
              <div
                key={listName}
                className={`word-list-option ${
                  selectedWordListName === listName ? "selected" : ""
                }`}
                onClick={() => selectWordList(listName)}
              >
                <div className="list-header">
                  <h3>{listName}</h3>
                  <span className="word-count">
                    {wordLists[listName].length} words
                  </span>
                </div>
                <div className="list-preview">
                  {wordLists[listName].slice(0, 5).join(", ")}
                  {wordLists[listName].length > 5 && "..."}
                </div>
              </div>
            ))}
          </div>

          <div className="menu-buttons">
            <button className="btn btn-secondary" onClick={backToMenu}>
              Back to Menu
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
          <p className="subtitle">
            {selectedWordListName} - {wordList.length} words
          </p>

          <div className="word-list-view">
            <div className="word-list-header">
              <h3>All Words</h3>
              <div className="word-list-stats">
                <span className="stat-item">Total: {wordList.length}</span>
                <span className="stat-item">
                  Average Length:{" "}
                  {Math.round(
                    wordList.reduce((sum, word) => sum + word.length, 0) /
                      wordList.length
                  )}
                </span>
              </div>
            </div>

            <div className="word-list-container">
              {wordList.map((word, index) => (
                <div key={index} className="word-list-item">
                  <span className="word-number">{index + 1}.</span>
                  <span className="word-text">{word}</span>
                  <span className="word-length">({word.length})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="menu-buttons">
            <button className="btn btn-secondary" onClick={backToMenu}>
              Back to Menu
            </button>
          </div>
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
                const speechTranscript = speechTranscripts[index];
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
                      {speechTranscript && (
                        <button
                          className="btn btn-play-transcript"
                          onClick={() => playSpeechTranscript(speechTranscript)}
                          title="Play what you said"
                        >
                          🔊
                        </button>
                      )}
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
              <div className="input-container">
                <input
                  type="text"
                  className="spelling-input"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter the spelling..."
                  autoFocus
                />
                <button
                  className={`btn btn-stt ${
                    isListening ? "listening" : sttEnabled ? "active" : ""
                  }`}
                  onClick={() => {
                    if (sttEnabled) {
                      startListening();
                    } else {
                      setSttEnabled(true);
                    }
                  }}
                  title={
                    isListening
                      ? "Listening..."
                      : sttEnabled
                      ? "Click to speak your answer"
                      : "Enable speech input"
                  }
                >
                  {isListening ? "🎤" : sttEnabled ? "🎤" : "🔇"}
                </button>
              </div>
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
