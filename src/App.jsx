import { useState, useEffect } from "react";
import { ALL_GROUPS } from "./constants/words";
import "./App.css";

function Modal({
  word,
  meaning,
  onClose,
  partOfSpeech,
  exampleUse1,
  exampleUse2,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{word}</h3>
        <p className="modal-meaning">{meaning}</p>
        {partOfSpeech && (
          <p className="modal-pos">Part of Speech: {partOfSpeech}</p>
        )}
        {exampleUse1 && (
          <div className="modal-example">
            <h4>Examples:</h4>
            <p>1. {exampleUse1}</p>
            {exampleUse2 && <p>2. {exampleUse2}</p>}
          </div>
        )}
        <button onClick={onClose} className="modal-close">
          Close
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctWords, setCorrectWords] = useState([]);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [askedWords, setAskedWords] = useState(new Set());
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const getAvailableWords = () => {
    let words = [];
    if (selectedGroups.length === 0) {
      words = Object.values(ALL_GROUPS).flat();
    } else {
      selectedGroups.forEach((groupName) => {
        words = [...words, ...ALL_GROUPS[groupName]];
      });
    }
    return words;
  };

  const getRandomWord = () => {
    const unaskedWords = availableWords.filter(
      (word) => !askedWords.has(word.word)
    );

    if (unaskedWords.length === 0) {
      setGameComplete(true);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unaskedWords.length);
    return unaskedWords[randomIndex];
  };

  const loadNewWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    if (newWord) {
      setAskedWords((prev) => new Set([...prev, newWord.word]));
    }
    setUserInput("");
    setFeedback("");
  };

  const resetGame = () => {
    setAskedWords(new Set());
    setGameComplete(false);
    setCorrectWords([]);
    setIncorrectWords([]);
    loadNewWord();
  };

  useEffect(() => {
    const words = getAvailableWords();
    setAvailableWords(words);
    setAskedWords(new Set());
    setGameComplete(false);
    setCorrectWords([]);
    setIncorrectWords([]);
    loadNewWord();
  }, [selectedGroups]);

  useEffect(() => {
    if (availableWords.length > 0) {
      loadNewWord();
    }
  }, [availableWords]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userInput.toLowerCase().trim() === currentWord.word.toLowerCase()) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
      setTimeout(loadNewWord, 1500);
    } else {
      let feedbackMessage = `Incorrect. The correct word was "${currentWord.word}"`;

      if (currentWord.partOfSpeech) {
        feedbackMessage += `\n${currentWord.partOfSpeech}`;
      }
      if (currentWord.exampleUse1) {
        feedbackMessage += `\nExample: ${currentWord.exampleUse1}`;
      }

      setFeedback(feedbackMessage);
      setIncorrectWords((prev) => [
        ...prev,
        {
          ...currentWord,
          userGuess: userInput,
        },
      ]);
      setTimeout(loadNewWord, 2500);
    }
  };

  const handleGroupToggle = (groupName) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupName)) {
        return prev.filter((g) => g !== groupName);
      } else {
        return [...prev, groupName];
      }
    });
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setShowModal(true);
  };

  if (!currentWord && !gameComplete) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="game-section">
        <h1>GRE Vocab Game</h1>

        <div className="group-selection">
          <h3>Select Word Groups:</h3>
          <div className="group-buttons">
            {Object.keys(ALL_GROUPS).map((groupName) => (
              <button
                key={groupName}
                className={`group-button ${
                  selectedGroups.includes(groupName) ? "selected" : ""
                }`}
                onClick={() => handleGroupToggle(groupName)}
              >
                {groupName}
              </button>
            ))}
          </div>
          <p className="group-info">
            {selectedGroups.length === 0
              ? "No groups selected - words will be chosen from all groups"
              : `Selected groups: ${selectedGroups.join(", ")}`}
          </p>
        </div>

        {gameComplete ? (
          <div className="game-complete">
            <h2>All words have been asked!</h2>
            <button onClick={resetGame} className="reset-button">
              Start Again
            </button>
          </div>
        ) : (
          <>
            <div className="meaning-box">
              <h2>Meaning:</h2>
              <p>{currentWord.meaning}</p>
            </div>

            <form onSubmit={handleSubmit} className="word-form">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your guess"
                className="word-input"
              />
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>

            {feedback && (
              <div
                className={`feedback ${
                  feedback.includes("Correct") ? "correct" : "incorrect"
                }`}
              >
                {feedback.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="results-container">
        <div className="incorrect-words">
          <h2>Incorrect Words ({incorrectWords.length})</h2>
          <ul>
            {incorrectWords.map((attempt, index) => (
              <li key={index} onClick={() => handleWordClick(attempt)}>
                {attempt.word}
                <span className="user-guess">
                  (you guessed: {attempt.userGuess})
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="correct-words">
          <h2>Correct Words ({correctWords.length})</h2>
          <ul>
            {correctWords.map((word, index) => (
              <li key={index} onClick={() => handleWordClick(word)}>
                {word.word}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showModal && (
        <Modal
          word={selectedWord.word}
          meaning={selectedWord.meaning}
          partOfSpeech={selectedWord.partOfSpeech}
          exampleUse1={selectedWord.exampleUse1}
          exampleUse2={selectedWord.exampleUse2}
          onClose={() => {
            setShowModal(false);
            setSelectedWord(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
