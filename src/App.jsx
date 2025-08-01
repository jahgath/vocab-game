import { useState, useEffect } from "react";
import { ALL_GROUPS } from "./constants/words";
import stringSimilarity from "string-similarity";
import "./App.css";

function Modal({ word, meanings, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{word}</h3>
          <button className="modal-close-x" onClick={onClose}>
            ×
          </button>
        </div>
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
      </div>
    </div>
  );
}

function IncorrectWordsModal({ words, onClose, onWordClick }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content incorrect-words-list"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Incorrect Words List</h3>
          <button className="modal-close-x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="incorrect-words-scroll">
          {Array.from(words).map((word, index) => (
            <div
              key={index}
              className="incorrect-word-item"
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(word);
              }}
            >
              <span className="word">{word.word}</span>
              <span className="meaning">{word.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomGroupModal({
  onClose,
  onCreateGroup,
  customGroupInput,
  setCustomGroupInput,
  customGroupName,
  setCustomGroupName,
}) {
  const [validWords, setValidWords] = useState([]);
  const [invalidWords, setInvalidWords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processWordList = () => {
    if (!customGroupInput.trim()) {
      setValidWords([]);
      setInvalidWords([]);
      return;
    }

    setIsProcessing(true);
    const inputWords = customGroupInput
      .trim()
      .split(/\s+/)
      .map((word) => word.toLowerCase().trim())
      .filter((word) => word.length > 0);
    const allWords = Object.values(ALL_GROUPS).flat();

    const valid = [];
    const invalid = [];

    inputWords.forEach((inputWord) => {
      const foundWord = allWords.find(
        (w) => w.word.toLowerCase() === inputWord
      );
      if (foundWord) {
        // Avoid duplicates
        if (
          !valid.some(
            (v) => v.word.toLowerCase() === foundWord.word.toLowerCase()
          )
        ) {
          valid.push(foundWord);
        }
      } else {
        if (!invalid.includes(inputWord)) {
          invalid.push(inputWord);
        }
      }
    });

    setValidWords(valid);
    setInvalidWords(invalid);
    setIsProcessing(false);
  };

  const handleCreateGroup = () => {
    if (!customGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (validWords.length === 0) {
      alert("No valid words found. Please check your word list.");
      return;
    }
    onCreateGroup(customGroupName.trim(), validWords);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content custom-group-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Create Custom Group</h3>
          <button className="modal-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="custom-group-form">
          <div className="form-group">
            <label htmlFor="groupName">Group Name:</label>
            <input
              id="groupName"
              type="text"
              value={customGroupName}
              onChange={(e) => setCustomGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="group-name-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wordList">Paste Word List (space-separated):</label>
            <textarea
              id="wordList"
              value={customGroupInput}
              onChange={(e) => {
                setCustomGroupInput(e.target.value);
                // Auto-process as user types (with debounce effect)
                setTimeout(processWordList, 300);
              }}
              placeholder="Paste your words here, separated by spaces..."
              className="word-list-input"
              rows={6}
            />
          </div>

          <button
            onClick={processWordList}
            className="process-button"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process Words"}
          </button>
        </div>

        {(validWords.length > 0 || invalidWords.length > 0) && (
          <div className="word-validation-results">
            {validWords.length > 0 && (
              <div className="valid-words">
                <h4>✅ Valid Words ({validWords.length}):</h4>
                <div className="word-list">
                  {validWords.map((word, index) => (
                    <span key={index} className="valid-word">
                      {word.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {invalidWords.length > 0 && (
              <div className="invalid-words">
                <h4>❌ Invalid Words ({invalidWords.length}):</h4>
                <div className="word-list">
                  {invalidWords.map((word, index) => (
                    <span key={index} className="invalid-word">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="create-button"
            disabled={!customGroupName.trim() || validWords.length === 0}
          >
            Create Group ({validWords.length} words)
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteCustomGroupModal({ groupName, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Delete Custom Group</h3>
          <button className="modal-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delete-confirm-content">
          <p>
            Are you sure you want to delete the custom group{" "}
            <strong>"{groupName}"</strong>?
          </p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-confirm-button">
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupWordsModal({
  words,
  onClose,
  onWordClick,
  searchQuery,
  onSearchChange,
  onRandomize,
}) {
  const [showMeanings, setShowMeanings] = useState(true);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content group-words-list"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <h3>Group Words List</h3>
            <button className="modal-close-x" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-search-row">
            <div className="modal-search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search word or meaning..."
                className="modal-search-input"
              />
              <button onClick={onRandomize} className="randomize-button">
                🎲
              </button>
            </div>
          </div>

          {/* Toggle Meanings Button Row */}
          <div className="toggle-meaning-row">
            <button
              onClick={() => setShowMeanings((prev) => !prev)}
              className="toggle-meaning-button"
              title={showMeanings ? "Hide Meanings" : "Show meanings"}
            >
              {showMeanings ? "🫣 Hide Meanings" : "🧐 Show meanings"}
            </button>
          </div>
        </div>

        <div className="group-words-scroll">
          {words.map((word, index) => (
            <div
              key={index}
              className="group-word-item"
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(word);
              }}
            >
              <span className="word">{word.word}</span>
              {showMeanings && <span className="meaning">{word.meaning}</span>}
            </div>
          ))}
        </div>
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
    try {
      // Initialize from localStorage if available
      const savedGroup = localStorage.getItem("incorrectWordsGroup");
      if (!savedGroup) return new Set();

      // Parse saved words and validate against ALL_GROUPS
      const savedWords = JSON.parse(savedGroup);
      if (!Array.isArray(savedWords)) return new Set();

      const allWords = Object.values(ALL_GROUPS).flat();

      // Only keep valid word objects that exist in ALL_GROUPS
      const validWords = savedWords.filter((item) => {
        if (!item) return false;
        const wordToCheck = typeof item === "string" ? item : item.word || null;
        if (!wordToCheck) return false;
        return allWords.some((w) => w.word === wordToCheck);
      });

      // Convert any string entries to full word objects
      const fullWordObjects = validWords.map((item) => {
        if (typeof item === "object" && item.word && item.meaning) return item;
        const wordStr = typeof item === "string" ? item : item.word;
        return allWords.find((w) => w.word === wordStr);
      });

      return new Set(fullWordObjects);
    } catch (error) {
      console.error("Error initializing incorrectWordsGroup:", error);
      return new Set();
    }
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
  const [selectedMcqOptions, setSelectedMcqOptions] = useState(new Set());
  const [showIncorrectWordsModal, setShowIncorrectWordsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupWordsModal, setShowGroupWordsModal] = useState(false);
  const [filteredGroupWords, setFilteredGroupWords] = useState([]);
  const [customGroups, setCustomGroups] = useState(() => {
    try {
      const saved = localStorage.getItem("customGroups");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading custom groups:", error);
      return {};
    }
  });
  const [showCustomGroupModal, setShowCustomGroupModal] = useState(false);
  const [customGroupInput, setCustomGroupInput] = useState("");
  const [customGroupName, setCustomGroupName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState("");

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

  const getGroupWords = () => {
    if (selectedGroups.length === 0) {
      return [
        ...Object.values(ALL_GROUPS).flat(),
        ...Object.values(customGroups).flat(),
      ];
    }
    return selectedGroups.reduce((acc, groupName) => {
      if (groupName === "Incorrect Words") {
        return [...acc, ...Array.from(incorrectWordsGroup)];
      }
      if (customGroups[groupName]) {
        return [...acc, ...customGroups[groupName]];
      }
      return [...acc, ...ALL_GROUPS[groupName]];
    }, []);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const allWords = getGroupWords();
    if (!query) {
      setFilteredGroupWords(allWords);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = allWords.filter(
      (word) =>
        word.word.toLowerCase().includes(lowerQuery) ||
        word.meaning.toLowerCase().includes(lowerQuery)
    );
    setFilteredGroupWords(filtered);
  };

  const handleRandomize = () => {
    const allWords = getGroupWords();
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    setSearchQuery(randomWord.word);
    handleSearchChange(randomWord.word);
  };

  const getAvailableWords = () => {
    let words = [];
    if (selectedGroups.length === 0) {
      words = [
        ...Object.values(ALL_GROUPS).flat(),
        ...Object.values(customGroups).flat(),
      ];
    } else {
      selectedGroups.forEach((groupName) => {
        if (groupName === "Incorrect Words") {
          words = [...words, ...Array.from(incorrectWordsGroup)];
        } else if (customGroups[groupName]) {
          words = [...words, ...customGroups[groupName]];
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
    } else if (gameMode === "mcq-synonyms" || gameMode === "mcq-antonyms") {
      // Get all synonyms/antonyms from ALL_GROUPS
      const allWords = new Set();
      const isAntonyms = gameMode === "mcq-antonyms";
      Object.values(ALL_GROUPS)
        .flat()
        .forEach((word) => {
          if (isAntonyms ? word.antonyms : word.synonyms) {
            (isAntonyms ? word.antonyms : word.synonyms).forEach((word) =>
              allWords.add(word)
            );
          }
        });

      // Convert to array and remove current word's synonyms/antonyms
      const correctWords = isAntonyms
        ? correctWord.antonyms
        : correctWord.synonyms;
      const otherWords = Array.from(allWords).filter(
        (word) => !correctWords.includes(word)
      );

      // Get current word's synonyms/antonyms
      const correctOptions = correctWords || [];

      // Select random wrong options
      const wrongOptions = [];
      const numWrongOptions = 8 - correctOptions.length;
      while (wrongOptions.length < numWrongOptions) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const word = otherWords[randomIndex];
        if (!wrongOptions.includes(word)) {
          wrongOptions.push(word);
        }
      }

      // Combine and shuffle all options
      const options = [...correctOptions, ...wrongOptions];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return options;
    }
  };

  const loadNewWord = () => {
    const newWord = getRandomWord();

    // let newWord = getRandomWord();

    // // If we somehow got the same word as current, try one more time
    // if (newWord && currentWord && newWord.word === currentWord.word) {
    //   newWord = getRandomWord();
    // }

    setCurrentWord(newWord);
    if (newWord) {
      if (
        gameMode === "mcq-word" ||
        gameMode === "mcq-meaning" ||
        gameMode === "mcq-synonyms" ||
        gameMode === "mcq-antonyms"
      ) {
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
    try {
      // If newGroup is a function, call it to get the actual Set
      const finalGroup =
        typeof newGroup === "function"
          ? newGroup(incorrectWordsGroup)
          : newGroup;

      // Ensure we have a valid iterable
      if (!finalGroup || typeof finalGroup[Symbol.iterator] !== "function") {
        console.error("Invalid group provided to updateIncorrectWordsGroup");
        return;
      }

      const allWords = Object.values(ALL_GROUPS).flat();

      // Convert Set to Array for storage, ensuring we store complete word objects
      const wordsToStore = Array.from(finalGroup)
        .filter((item) => {
          if (!item) return false;
          const wordToCheck =
            typeof item === "string" ? item : item.word || null;
          return wordToCheck && allWords.some((w) => w.word === wordToCheck);
        })
        .map((item) => {
          // If it's already a complete word object, use it as is
          if (typeof item === "object" && item.word && item.meaning) {
            return item;
          }
          // If it's just a word string or partial object, find the complete word object
          const wordStr = typeof item === "string" ? item : item.word;
          return allWords.find((w) => w.word === wordStr);
        })
        .filter(Boolean); // Remove any null values

      setIncorrectWordsGroup(new Set(wordsToStore));
      localStorage.setItem("incorrectWordsGroup", JSON.stringify(wordsToStore));
    } catch (error) {
      console.error("Error updating incorrectWordsGroup:", error);
    }
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

    // Update askedWords immediately
    setAskedWords((prev) => new Set([...prev, currentWord.word]));

    if (userInput.toLowerCase().trim() === currentWord.word.toLowerCase()) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
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
      setTimeout(() => {
        setDisableInput(false);
        loadNewWord();
      }, 2500);
    }
  };

  const handleMcqSelect = (selectedOption) => {
    if (selectedMcqOption !== null) return;
    setSelectedMcqOption(selectedOption);

    // Update askedWords immediately
    setAskedWords((prev) => new Set([...prev, currentWord.word]));

    const isCorrect =
      gameMode === "mcq-word"
        ? selectedOption === currentWord.word
        : selectedOption === currentWord.meaning;

    if (isCorrect) {
      setFeedback("Correct!");
      setCorrectWords((prev) => [...prev, currentWord]);
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

  const handleCreateCustomGroup = (groupName, words) => {
    const newCustomGroups = {
      ...customGroups,
      [groupName]: words,
    };
    setCustomGroups(newCustomGroups);

    // Save to localStorage
    try {
      localStorage.setItem("customGroups", JSON.stringify(newCustomGroups));
    } catch (error) {
      console.error("Error saving custom groups:", error);
    }

    // Close modal and reset inputs
    setShowCustomGroupModal(false);
    setCustomGroupInput("");
    setCustomGroupName("");

    // Auto-select the new group
    setSelectedGroups([groupName]);
  };

  const handleDeleteCustomGroup = (groupName) => {
    setGroupToDelete(groupName);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomGroup = () => {
    const newCustomGroups = { ...customGroups };
    delete newCustomGroups[groupToDelete];
    setCustomGroups(newCustomGroups);

    // Save to localStorage
    try {
      localStorage.setItem("customGroups", JSON.stringify(newCustomGroups));
    } catch (error) {
      console.error("Error saving custom groups:", error);
    }

    // Remove from selected groups if it was selected
    setSelectedGroups((prev) => prev.filter((g) => g !== groupToDelete));

    // Close modal and reset state
    setShowDeleteModal(false);
    setGroupToDelete("");
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

    const userAnswer = userInput.toLowerCase().trim();

    if (gameMode === "antonyms") {
      // Get antonyms array, handling cases where it might not exist
      const antonyms =
        currentWord.antonyms?.map((a) => a.toLowerCase().trim()) || [];

      if (!antonyms.length) {
        setFeedback("Sorry, no antonyms available for this word.");
        setTimeout(() => {
          setDisableInput(false);
          loadNewWord();
        }, 2000);
        return;
      }

      // Compare with each antonym and get the highest match
      const antonymScores = antonyms.map((ant) =>
        stringSimilarity.compareTwoStrings(userAnswer, ant)
      );
      const bestSimilarity = Math.max(...antonymScores);
      setSimilarityScore(bestSimilarity);

      if (bestSimilarity >= 0.5) {
        setFeedback(
          `Correct! (${Math.round(
            bestSimilarity * 100
          )}% match)\nAntonyms: ${antonyms.join(", ")}`
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
          )}% match)\nAntonyms: ${antonyms.join(", ")}`
        );
        setIncorrectWords((prev) => [
          ...prev,
          {
            ...currentWord,
            userGuess: userInput,
            similarity: bestSimilarity,
          },
        ]);
        updateIncorrectWordsGroup((prev) => new Set([...prev, currentWord]));
        setAskedWords((prev) => new Set([...prev, currentWord.word]));
        setTimeout(() => {
          setDisableInput(false);
          setSimilarityScore(null);
          loadNewWord();
        }, 3500);
      }
      return;
    }

    // Original meaning mode logic
    const userMeaning = userAnswer;
    const correctMeaning = currentWord.meaning.toLowerCase().trim();
    const correctWord = currentWord.word.toLowerCase().trim();
    const synonyms = currentWord.synonyms.map((s) => s.toLowerCase().trim());

    // Compare with meaning
    const correctParts = correctMeaning
      .split(/;|\/|\bor\b/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const scores = correctParts.map((part) =>
      stringSimilarity.compareTwoStrings(userMeaning, part)
    );

    const similarityMeaning = Math.max(...scores);

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

        <div className="card game-mode-card">
          <h3>Game Mode</h3>
          <div className="game-mode-toggle">
            <button
              className={`mode-button ${gameMode === "word" ? "selected" : ""}`}
              onClick={() => setGameMode("word")}
            >
              Word
            </button>
            <button
              className={`mode-button ${
                gameMode === "meaning" ? "selected" : ""
              }`}
              onClick={() => setGameMode("meaning")}
            >
              Meaning (BETA)
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
                gameMode === "mcq-synonyms" ? "selected" : ""
              }`}
              onClick={() => setGameMode("mcq-synonyms")}
            >
              MCQ - Synonyms
            </button>
            <button
              className={`mode-button ${
                gameMode === "mcq-antonyms" ? "selected" : ""
              }`}
              onClick={() => setGameMode("mcq-antonyms")}
            >
              MCQ - Antonyms
            </button>

            <button
              className={`mode-button ${
                gameMode === "antonyms" ? "selected" : ""
              }`}
              onClick={() => setGameMode("antonyms")}
            >
              Antonyms (BETA)
            </button>
          </div>
        </div>

        <div className="card group-card">
          <h3
            onClick={() => setGroupSectionOpen(!groupSectionOpen)}
            style={{ cursor: "pointer" }}
          >
            Select Groups
            <span className="sort-button">{groupSectionOpen ? "▲" : "▼"}</span>
          </h3>

          {groupSectionOpen && (
            <>
              <button
                className="eye-button"
                onClick={() => {
                  handleSearchChange("");
                  setShowGroupWordsModal(true);
                }}
              >
                🔍
              </button>
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

              {/* Custom Groups Section */}
              <div className="custom-groups-section">
                <h4>Custom Groups</h4>
                <div className="create-custom-group-section">
                  <button
                    className="create-custom-group-button"
                    onClick={() => setShowCustomGroupModal(true)}
                  >
                    Create Custom Group
                  </button>
                </div>
                {Object.keys(customGroups).length > 0 && (
                  <div className="group-buttons">
                    {Object.keys(customGroups).map((groupName) => (
                      <div key={groupName} className="custom-group-item">
                        <button
                          className={`group-button ${
                            selectedGroups.includes(groupName) ? "selected" : ""
                          }`}
                          onClick={() => handleGroupToggle(groupName)}
                        >
                          {groupName} ({customGroups[groupName].length})
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteCustomGroup(groupName)}
                          title="Delete custom group"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                <button
                  className="eye-button"
                  onClick={() => setShowIncorrectWordsModal(true)}
                  disabled={incorrectWordsGroup.size === 0}
                >
                  👁️
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
            </>
          )}
          <p className="group-info">
            {selectedGroups.length === 0
              ? "All groups selected"
              : `${selectedGroups.length} group${
                  selectedGroups.length === 1 ? "" : "s"
                } selected`}
          </p>
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
          <div className="card game-complete">
            <h2>All words have been asked!</h2>
            <button onClick={resetGame} className="reset-button">
              Start Again
            </button>
          </div>
        ) : (
          <div className="card game-content-card">
            <div className="meaning-box">
              <div className="word-meaning-display">
                <span className="word-meaning-label">
                  {gameMode === "meaning" ||
                  gameMode === "mcq-meaning" ||
                  gameMode === "antonyms" ||
                  gameMode === "mcq-synonyms" ||
                  gameMode === "mcq-antonyms"
                    ? "Word:"
                    : "Meaning:"}
                </span>
                <span className="word-meaning-text">
                  {gameMode === "meaning" ||
                  gameMode === "mcq-meaning" ||
                  gameMode === "antonyms" ||
                  gameMode === "mcq-synonyms" ||
                  gameMode === "mcq-antonyms"
                    ? currentWord.word
                    : currentWord.meaning}
                </span>
              </div>
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

            {gameMode === "antonyms" && (
              <form onSubmit={handleMeaningSubmit} className="word-form">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter an antonym for this word"
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

            {(gameMode === "mcq-synonyms" || gameMode === "mcq-antonyms") && (
              <div className="mcq-synonyms-container">
                <div className="mcq-options">
                  {mcqOptions.map((option, index) => {
                    const isSelected = selectedMcqOptions.has(option);
                    const correctWords = new Set(
                      gameMode === "mcq-antonyms"
                        ? currentWord.antonyms
                        : currentWord.synonyms
                    );
                    let buttonClass = "mcq-option";

                    // Only show feedback colors after submission (when feedback is shown)
                    if (feedback) {
                      if (correctWords.has(option)) {
                        buttonClass += " correct";
                      } else if (isSelected) {
                        buttonClass += " incorrect";
                      }
                    } else if (isSelected) {
                      buttonClass += " selected";
                    }

                    return (
                      <button
                        key={index}
                        className={buttonClass}
                        onClick={() => {
                          if (!feedback) {
                            // Only allow selection before submission
                            setSelectedMcqOptions((prev) => {
                              const newSet = new Set(prev);
                              if (isSelected) {
                                newSet.delete(option);
                              } else {
                                newSet.add(option);
                              }
                              return newSet;
                            });
                          }
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="submit-btn"
                  disabled={feedback !== ""} // Disable submit button after submission
                  onClick={() => {
                    const correctWords = new Set(
                      gameMode === "mcq-antonyms"
                        ? currentWord.antonyms
                        : currentWord.synonyms
                    );
                    const selectedOptions = Array.from(selectedMcqOptions);

                    // Check if all selected options are correct
                    const allCorrect = selectedOptions.every((opt) =>
                      correctWords.has(opt)
                    );
                    // Check if all correct words were selected
                    const allSelected = Array.from(correctWords).every((word) =>
                      selectedMcqOptions.has(word)
                    );

                    if (allCorrect && allSelected) {
                      setFeedback(
                        `Correct! You found all the ${
                          gameMode === "mcq-antonyms" ? "antonyms" : "synonyms"
                        }: ${Array.from(correctWords).join(", ")}`
                      );
                      setCorrectWords((prev) => [...prev, currentWord]);
                      handleCorrectAnswer(currentWord);
                    } else {
                      setFeedback(
                        `Incorrect. The correct ${
                          gameMode === "mcq-antonyms" ? "antonyms" : "synonyms"
                        } were: ${Array.from(correctWords).join(", ")}`
                      );
                      setIncorrectWords((prev) => [
                        ...prev,
                        {
                          ...currentWord,
                          userGuess: Array.from(selectedMcqOptions).join(", "),
                        },
                      ]);
                      updateIncorrectWordsGroup(
                        (prev) => new Set([...prev, currentWord])
                      );
                    }

                    setAskedWords(
                      (prev) => new Set([...prev, currentWord.word])
                    );

                    // Move to next word after delay
                    setTimeout(() => {
                      setFeedback("");
                      setSelectedMcqOptions(new Set());
                      loadNewWord();
                    }, 2500);
                  }}
                >
                  Submit
                </button>
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
          </div>
        )}

        <div className="card incorrect-words-card">
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

        <div className="card correct-words-card">
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

      {showIncorrectWordsModal && (
        <IncorrectWordsModal
          words={incorrectWordsGroup}
          onClose={() => setShowIncorrectWordsModal(false)}
          onWordClick={(word) => {
            const allMeanings = findAllMeanings(word.word);
            setSelectedWord({
              word: word.word,
              meanings: allMeanings,
            });
            setShowModal(true);
          }}
        />
      )}

      {showModal && selectedWord && (
        <div className="meaning-modal-wrapper">
          <Modal
            word={selectedWord.word}
            meanings={selectedWord.meanings}
            onClose={() => {
              setShowModal(false);
              setSelectedWord(null);
            }}
          />
        </div>
      )}

      {showGroupWordsModal && (
        <GroupWordsModal
          words={filteredGroupWords}
          onClose={() => setShowGroupWordsModal(false)}
          onWordClick={(word) => {
            const allMeanings = findAllMeanings(word.word);
            setSelectedWord({
              word: word.word,
              meanings: allMeanings,
            });
            setShowModal(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRandomize={handleRandomize}
        />
      )}

      {showCustomGroupModal && (
        <CustomGroupModal
          onClose={() => {
            setShowCustomGroupModal(false);
            setCustomGroupInput("");
            setCustomGroupName("");
          }}
          onCreateGroup={handleCreateCustomGroup}
          customGroupInput={customGroupInput}
          setCustomGroupInput={setCustomGroupInput}
          customGroupName={customGroupName}
          setCustomGroupName={setCustomGroupName}
        />
      )}

      {showDeleteModal && (
        <DeleteCustomGroupModal
          groupName={groupToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setGroupToDelete("");
          }}
          onConfirm={confirmDeleteCustomGroup}
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
