import { useState, useEffect } from "react";
import { ALL_GROUPS } from "./constants/words";
import stringSimilarity from "string-similarity";
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
  const [incorrectWordsGroup, setIncorrectWordsGroup] = useState(() => {
    // Initialize from localStorage if available
    const savedGroup = localStorage.getItem("incorrectWordsGroup");
    return savedGroup ? new Set(JSON.parse(savedGroup)) : new Set();
  });
  const [askedWords, setAskedWords] = useState(new Set());
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [groupSectionOpen, setGroupSectionOpen] = useState(true);
  const [gameMode, setGameMode] = useState("word"); // "word", "mcq-word", "mcq-meaning", or "meaning"
  const [mcqOptions, setMcqOptions] = useState([]);
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [incorrectSortDesc, setIncorrectSortDesc] = useState(true);
  const [correctSortDesc, setCorrectSortDesc] = useState(true);
  const [disableInput, setDisableInput] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [showClue, setShowClue] = useState(false);

  const totalWords = availableWords.length;
  const wordsLeft = totalWords - askedWords.size;

  const toggleIncorrectSort = () => setIncorrectSortDesc(!incorrectSortDesc);
  const toggleCorrectSort = () => setCorrectSortDesc(!correctSortDesc);

  const sortedIncorrectWords = incorrectSortDesc
    ? [...incorrectWords].reverse()
    : [...incorrectWords];

  const sortedCorrectWords = correctSortDesc
    ? [...correctWords].reverse()
    : [...correctWords];

  const getAvailableWords = () => {
    let words = [];
    if (selectedGroups.length === 0) {
      words = Object.values(ALL_GROUPS).flat();
    } else {
      selectedGroups.forEach((groupName) => {
        if (groupName === "Incorrect Words") {
          words = [...words, ...Array.from(incorrectWordsGroup)];
        } else {
          words = [...words, ...ALL_GROUPS[groupName]];
        }
      });
    }
    return words;
  };

  const getRandomWord = () => {
    if (availableWords.length === 0) return null;

    // Filter out words that have already been asked
    const unaskedWords = availableWords.filter(
      (word) => word && word.word && !askedWords.has(word.word)
    );

    if (unaskedWords.length === 0) {
      setGameComplete(true);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unaskedWords.length);
    return unaskedWords[randomIndex];
  };

  const generateMcqOptions = (correctWord) => {
    if (gameMode === "mcq-word") {
      // Get all unique words from ALL_GROUPS except the correct one
      const allWords = Array.from(
        new Set(
          Object.values(ALL_GROUPS)
            .flat()
            .map((w) => w.word)
        )
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
    } else if (gameMode === "mcq-meaning") {
      // Get all unique meanings from ALL_GROUPS except the correct one
      const allWords = Object.values(ALL_GROUPS)
        .flat()
        .filter((w) => w.word !== correctWord.word);
      const wrongOptions = [];
      while (wrongOptions.length < 3) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const meaning = allWords[randomIndex].meaning;
        if (!wrongOptions.includes(meaning)) {
          wrongOptions.push(meaning);
        }
      }

      // Add correct meaning and shuffle
      const options = [...wrongOptions, correctWord.meaning];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return options;
    }
  };

  const loadNewWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    if (newWord) {
      if (gameMode === "mcq-word" || gameMode === "mcq-meaning") {
        setMcqOptions(generateMcqOptions(newWord));
        setSelectedMcqOption(null);
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

  const updateIncorrectWordsGroup = (newGroup) => {
    setIncorrectWordsGroup(newGroup);
    localStorage.setItem(
      "incorrectWordsGroup",
      JSON.stringify(Array.from(newGroup))
    );
  };

  const handleCorrectAnswer = (word) => {
    // Remove word from incorrect words group if it exists
    updateIncorrectWordsGroup((prev) => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disableInput) return;
    setDisableInput(true);

    if (userInput.toLowerCase().trim() === currentWord.word.toLowerCase()) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      handleCorrectAnswer(currentWord);
      setTimeout(() => {
        setDisableInput(false);
        loadNewWord();
      }, 1500);
    } else {
      setFeedback(`Incorrect. The correct word was "${currentWord.word}"`);
      setIncorrectWords((prev) => [
        ...prev,
        {
          ...currentWord,
          userGuess: userInput,
        },
      ]);
      // Add to incorrect words group
      updateIncorrectWordsGroup((prev) => new Set([...prev, currentWord]));
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      setTimeout(() => {
        setDisableInput(false);
        loadNewWord();
      }, 2500);
    }
  };

  const handleMcqSelect = (selectedOption) => {
    if (selectedMcqOption !== null) return;
    setSelectedMcqOption(selectedOption);

    const isCorrect =
      gameMode === "mcq-word"
        ? selectedOption === currentWord.word
        : selectedOption === currentWord.meaning;

    if (isCorrect) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      handleCorrectAnswer(currentWord);
      setTimeout(loadNewWord, 1500);
    } else {
      let feedbackMessage =
        gameMode === "mcq-word"
          ? `Incorrect. The correct word was "${currentWord.word}"`
          : `Incorrect. The correct meaning was "${currentWord.meaning}"`;
      setFeedback(feedbackMessage);
      setIncorrectWords((prev) => [
        ...prev,
        {
          ...currentWord,
          userGuess: selectedOption,
        },
      ]);
      // Add to incorrect words group
      updateIncorrectWordsGroup((prev) => new Set([...prev, currentWord]));
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      setTimeout(loadNewWord, 2500);
    }
  };

  const handleGroupToggle = (groupName) => {
    if (groupName === "Incorrect Words") {
      // If selecting incorrect words group, clear other selections
      setSelectedGroups(["Incorrect Words"]);
    } else {
      // If selecting another group, remove incorrect words from selection
      setSelectedGroups((prev) => {
        const newGroups = prev.filter((g) => g !== "Incorrect Words");
        if (newGroups.includes(groupName)) {
          return newGroups.filter((g) => g !== groupName);
        } else {
          return [...newGroups, groupName];
        }
      });
    }
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

  const handleMeaningSubmit = (e) => {
    e.preventDefault();
    if (disableInput) return;
    setDisableInput(true);

    const userMeaning = userInput.toLowerCase().trim();
    const correctMeaning = currentWord.meaning.toLowerCase().trim();
    const correctWord = currentWord.word.toLowerCase().trim();
    const synonyms = currentWord.synonyms.map((s) => s.toLowerCase().trim());

    // Compare with meaning
    const correctParts = correctMeaning.split(";").map((s) => s.trim());
    const scores = correctParts.map((part) =>
      stringSimilarity.compareTwoStrings(userMeaning, part)
    );
    const similarityMeaning = Math.max(...scores);

    console.log("similarityMeaning", similarityMeaning);
    console.log("correctMeaning", correctMeaning);
    console.log("userMeaning", userMeaning);
    console.log("correctWord", correctWord);
    console.log("synonyms", synonyms);
    console.log("userInput", userInput);
    console.log("currentWord", currentWord);

    // Compare with the actual word (in case user entered the definition instead of word)
    const similarityWord = stringSimilarity.compareTwoStrings(
      userMeaning,
      correctWord
    );

    // Compare with each synonym, and get the highest match
    const synonymScores = synonyms.map((syn) =>
      stringSimilarity.compareTwoStrings(userMeaning, syn)
    );
    const maxSynonymScore = Math.max(...synonymScores, 0);

    // Determine best match among the 3 comparisons
    const bestSimilarity = Math.max(
      similarityMeaning,
      similarityWord,
      maxSynonymScore
    );
    setSimilarityScore(bestSimilarity);

    // Consider it correct if similarity is above 0.6 (60% similar)
    if (bestSimilarity >= 0.5) {
      setFeedback(
        `Correct! (${Math.round(
          bestSimilarity * 100
        )}% match)\nActual meaning: ${currentWord.meaning}`
      );
      setCorrectWords((prev) => [...prev, currentWord]);
      handleCorrectAnswer(currentWord);
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      setTimeout(() => {
        setDisableInput(false);
        setSimilarityScore(null);
        loadNewWord();
      }, 2500);
    } else {
      setFeedback(
        `Not quite right. (${Math.round(
          bestSimilarity * 100
        )}% match)\nActual meaning: ${currentWord.meaning}`
      );
      setIncorrectWords((prev) => [
        ...prev,
        {
          ...currentWord,
          userGuess: userInput,
          similarity: bestSimilarity,
        },
      ]);
      // Add to incorrect words group
      updateIncorrectWordsGroup((prev) => new Set([...prev, currentWord]));
      setAskedWords((prev) => new Set([...prev, currentWord.word]));
      setTimeout(() => {
        setDisableInput(false);
        setSimilarityScore(null);
        loadNewWord();
      }, 3500);
    }
  };

  // Add a function to clear incorrect words group
  const clearIncorrectWordsGroup = () => {
    updateIncorrectWordsGroup(new Set());
    localStorage.removeItem("incorrectWordsGroup");
  };

  if (!currentWord && !gameComplete) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="game-section">
        <h1>Vocab Game</h1>

        <div className="game-mode-toggle">
          <button
            className={`mode-button ${gameMode === "word" ? "selected" : ""}`}
            onClick={() => setGameMode("word")}
          >
            Word
          </button>
          <button
            className={`mode-button ${
              gameMode === "mcq-word" ? "selected" : ""
            }`}
            onClick={() => setGameMode("mcq-word")}
          >
            MCQ - Word
          </button>
          <button
            className={`mode-button ${
              gameMode === "mcq-meaning" ? "selected" : ""
            }`}
            onClick={() => setGameMode("mcq-meaning")}
          >
            MCQ - Meaning
          </button>
          <button
            className={`mode-button ${
              gameMode === "meaning" ? "selected" : ""
            }`}
            onClick={() => setGameMode("meaning")}
          >
            Meaning (BETA)
          </button>
        </div>

        <div className="group-selection">
          <h3
            onClick={() => setGroupSectionOpen(!groupSectionOpen)}
            style={{ cursor: "pointer" }}
          >
            Select Groups
            <span className="sort-button">{groupSectionOpen ? "▲" : "▼"}</span>
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
              <div className="incorrect-words-buttons">
                <button
                  className={`group-button ${
                    selectedGroups.includes("Incorrect Words") ? "selected" : ""
                  } ${incorrectWordsGroup.size === 0 ? "disabled" : ""}`}
                  onClick={() => handleGroupToggle("Incorrect Words")}
                  disabled={incorrectWordsGroup.size === 0}
                >
                  Incorrect Words ({incorrectWordsGroup.size})
                </button>
                {incorrectWordsGroup.size > 0 && (
                  <button
                    className="group-button clear-button"
                    onClick={clearIncorrectWordsGroup}
                  >
                    Clear Incorrect Words
                  </button>
                )}
              </div>
              <p className="group-info">
                {selectedGroups.length === 0
                  ? "All groups selected"
                  : `${selectedGroups.length} group${
                      selectedGroups.length === 1 ? "" : "s"
                    } selected`}
              </p>
            </>
          )}
        </div>
        {availableWords.length > 0 && (
          <div className="word-count-summary">
            <span>
              <strong>Total Words:</strong> {totalWords}
            </span>
            <span>
              <strong>Words Left:</strong> {wordsLeft}
            </span>
          </div>
        )}

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
              <h2>
                {gameMode === "meaning" || gameMode === "mcq-meaning"
                  ? "Word:"
                  : "Meaning:"}
              </h2>
              <p>
                {gameMode === "meaning" || gameMode === "mcq-meaning"
                  ? currentWord.word
                  : currentWord.meaning}
              </p>
              {gameMode === "meaning" && (
                <div className="clue-section">
                  <button
                    className="clue-button"
                    onClick={() => setShowClue(!showClue)}
                  >
                    {showClue ? "Hide Clue" : "Show Clue"}
                  </button>
                  {showClue &&
                    currentWord.examples &&
                    currentWord.examples.length > 0 && (
                      <p className="clue-text">
                        Example: {currentWord.examples[0]}
                      </p>
                    )}
                </div>
              )}
            </div>

            {gameMode === "word" && (
              <form onSubmit={handleSubmit} className="word-form">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your guess"
                  className="word-input"
                  disabled={disableInput}
                />
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={disableInput}
                >
                  Submit
                </button>
              </form>
            )}

            {(gameMode === "mcq-word" || gameMode === "mcq-meaning") && (
              <div className="mcq-options">
                {mcqOptions.map((option, index) => {
                  let buttonClass = "mcq-option";
                  if (selectedMcqOption !== null) {
                    const correctOption =
                      gameMode === "mcq-word"
                        ? currentWord.word
                        : currentWord.meaning;
                    if (option === correctOption) {
                      buttonClass += " correct";
                    } else if (option === selectedMcqOption) {
                      buttonClass += " incorrect";
                    }
                  }

                  return (
                    <button
                      key={index}
                      className={buttonClass}
                      onClick={() => handleMcqSelect(option)}
                      disabled={selectedMcqOption !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {gameMode === "meaning" && (
              <form onSubmit={handleMeaningSubmit} className="word-form">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter the meaning of this word"
                  className="meaning-input"
                  disabled={disableInput}
                />
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={disableInput}
                >
                  Submit
                </button>
              </form>
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
                {similarityScore !== null && (
                  <div className="similarity-meter">
                    <div
                      className="similarity-fill"
                      style={{ width: `${similarityScore * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="results-container">
        <div className="incorrect-words">
          <h2>
            Incorrect Words ({incorrectWords.length})
            <button onClick={toggleIncorrectSort} className="sort-button">
              {incorrectSortDesc ? "▼" : "▲"}
            </button>
          </h2>
          <ul>
            {sortedIncorrectWords.map((attempt, index) => (
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
          <h2>
            Correct Words ({correctWords.length})
            <button onClick={toggleCorrectSort} className="sort-button">
              {correctSortDesc ? "▼" : "▲"}
            </button>
          </h2>
          <ul>
            {sortedCorrectWords.map((word, index) => (
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
