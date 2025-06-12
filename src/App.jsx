import { useState, useEffect } from "react";
import { ALL_GROUPS } from "./constants/words";
import "./App.css";

function Modal({ word, meanings, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{word}</h3>
        {meanings.map((item, index) => (
          <div key={index} className="modal-meaning-group">
            <p className="modal-meaning">{item.meaning}</p>
            {item.partOfSpeech && (
              <p className="modal-pos">Part of Speech: {item.partOfSpeech}</p>
            )}
            {item.examples && item.examples.length > 0 && (
              <div className="modal-example">
                <h4>Examples:</h4>
                {item.examples.map((example, i) => (
                  <p key={i}>
                    {i + 1}. {example}
                  </p>
                ))}
              </div>
            )}
            {(item.synonyms || item.antonyms) && (
              <div className="modal-synonyms-antonyms">
                {item.synonyms && (
                  <div className="modal-synonyms">
                    <h4>Synonyms:</h4>
                    <p>{item.synonyms.join(", ")}</p>
                  </div>
                )}
                {item.antonyms && (
                  <div className="modal-antonyms">
                    <h4>Antonyms:</h4>
                    <p>{item.antonyms.join(", ")}</p>
                  </div>
                )}
              </div>
            )}
            {index < meanings.length - 1 && (
              <div className="modal-divider"></div>
            )}
          </div>
        ))}
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
  const [groupSectionOpen, setGroupSectionOpen] = useState(true);
  const [gameMode, setGameMode] = useState("type"); // "type" or "mcq"
  const [mcqOptions, setMcqOptions] = useState([]);

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

  const generateMcqOptions = (correctWord) => {
    // Get all unique words except the correct one
    const allWords = Array.from(
      new Set(availableWords.map((w) => w.word))
    ).filter((w) => w !== correctWord.word);

    // Randomly select 3 words
    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      const word = allWords[randomIndex];
      if (!wrongOptions.includes(word)) {
        wrongOptions.push(word);
      }
    }

    // Add correct word and shuffle
    const options = [...wrongOptions, correctWord.word];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  };

  const loadNewWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    if (newWord) {
      setAskedWords((prev) => new Set([...prev, newWord.word]));
      if (gameMode === "mcq") {
        setMcqOptions(generateMcqOptions(newWord));
      }
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
  }, [selectedGroups, gameMode]);

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

  const handleMcqSelect = (selectedOption) => {
    if (selectedOption === currentWord.word) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
      setTimeout(loadNewWord, 1500);
    } else {
      let feedbackMessage = `Incorrect. The correct word was "${currentWord.word}"`;
      setFeedback(feedbackMessage);
      setIncorrectWords((prev) => [
        ...prev,
        {
          ...currentWord,
          userGuess: selectedOption,
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

  const findAllMeanings = (word) => {
    const allMeanings = [];
    Object.values(ALL_GROUPS).forEach((group) => {
      group.forEach((item) => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          allMeanings.push(item);
        }
      });
    });
    return allMeanings;
  };

  const handleWordClick = (word) => {
    const allMeanings = findAllMeanings(word.word);
    setSelectedWord({
      word: word.word,
      meanings: allMeanings,
    });
    setShowModal(true);
  };

  if (!currentWord && !gameComplete) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="game-section">
        <h1>Vocab Game</h1>

        <div className="game-mode-toggle">
          <button
            className={`mode-button ${gameMode === "type" ? "selected" : ""}`}
            onClick={() => setGameMode("type")}
          >
            Type
          </button>
          <button
            className={`mode-button ${gameMode === "mcq" ? "selected" : ""}`}
            onClick={() => setGameMode("mcq")}
          >
            MCQ
          </button>
        </div>

        <div className="group-selection">
          <h3
            onClick={() => setGroupSectionOpen(!groupSectionOpen)}
            style={{ cursor: "pointer" }}
          >
            Select Word Groups
            <span style={{ marginLeft: "8px" }}>
              {groupSectionOpen ? "▲" : "▼"}
            </span>
          </h3>

          {groupSectionOpen && (
            <>
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
            </>
          )}
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

            {gameMode === "type" ? (
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
            ) : (
              <div className="mcq-options">
                {mcqOptions.map((option, index) => (
                  <button
                    key={index}
                    className="mcq-option"
                    onClick={() => handleMcqSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

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
          meanings={selectedWord.meanings}
          onClose={() => {
            setShowModal(false);
            setSelectedWord(null);
          }}
        />
      )}

      <footer className="app-footer">
        Based on GregMat's vocab list, made with{" "}
        <span style={{ color: "red" }}>&hearts;</span> in Kerala
      </footer>
    </div>
  );
}

export default App;
