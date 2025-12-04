import { useState } from 'react'
import gameConfig from './data/gameConfig.json'

const GAME_STATES = {
  STARTING: 'starting',
  PLAYING: 'playing',
  DONE: 'done',
}

const MAX_ROUNDS = Math.min(15, gameConfig.puzzles.length)
const MIN_ROUNDS = 3

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.STARTING)
  const [gameLength, setGameLength] = useState(5)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [usedIndices, setUsedIndices] = useState(new Set())
  const [currentPuzzle, setCurrentPuzzle] = useState(null)

  const isCorrect = selectedOption === currentPuzzle?.solution

  const getRandomPuzzle = (excluded) => {
    const available = gameConfig.puzzles
      .map((_, i) => i)
      .filter(i => !excluded.has(i))
    const randomIdx = available[Math.floor(Math.random() * available.length)]
    return { puzzle: gameConfig.puzzles[randomIdx], index: randomIdx }
  }

  const startGame = () => {
    const newUsed = new Set()
    const { puzzle, index } = getRandomPuzzle(newUsed)
    newUsed.add(index)

    setUsedIndices(newUsed)
    setCurrentPuzzle(puzzle)
    setCurrentTurn(0)
    setScore(0)
    setSelectedOption(null)
    setGameState(GAME_STATES.PLAYING)
  }

  const selectOption = (option) => {
    if (selectedOption) return
    setSelectedOption(option)
    if (option === currentPuzzle.solution) {
      setScore(s => s + 1)
    }
  }

  const nextTurn = () => {
    if (currentTurn + 1 >= gameLength) {
      setGameState(GAME_STATES.DONE)
    } else {
      const { puzzle, index } = getRandomPuzzle(usedIndices)
      setUsedIndices(prev => new Set([...prev, index]))
      setCurrentPuzzle(puzzle)
      setCurrentTurn(t => t + 1)
      setSelectedOption(null)
    }
  }

  const restart = () => {
    setGameState(GAME_STATES.STARTING)
    setSelectedOption(null)
    setUsedIndices(new Set())
    setCurrentPuzzle(null)
  }

  // Starting Screen
  if (gameState === GAME_STATES.STARTING) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-4xl font-bold mb-6 text-purple-400">🎨 ASCII Art Guesser</h1>
          <p className="text-gray-300 mb-8">Guess what each ASCII art represents!</p>

          <div className="mb-8">
            <label className="block text-gray-400 mb-3">
              Number of Rounds: <span className="text-purple-400 font-bold text-xl">{gameLength}</span>
            </label>
            <input
              type="range"
              min={MIN_ROUNDS}
              max={MAX_ROUNDS}
              value={gameLength}
              onChange={(e) => setGameLength(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{MIN_ROUNDS}</span>
              <span>{MAX_ROUNDS}</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-xl transition-all hover:scale-105"
          >
            🚀 Start Game
          </button>
        </div>
      </div>
    )
  }

  // Done Screen
  if (gameState === GAME_STATES.DONE) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-4xl font-bold mb-6 text-purple-400">🎮 Game Over!</h1>
          <p className="text-2xl mb-2">Final Score</p>
          <p className="text-6xl font-bold text-green-400 mb-6">{score}/{gameLength}</p>

          {score === gameLength && <p className="text-xl text-yellow-400 mb-6">🏆 Perfect!</p>}
          {score >= gameLength / 2 && score < gameLength && <p className="text-xl text-blue-400 mb-6">👍 Great job!</p>}
          {score < gameLength / 2 && <p className="text-xl text-orange-400 mb-6">💪 Keep practicing!</p>}

          <button
            onClick={restart}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl text-xl transition-all hover:scale-105"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    )
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-400">🎨 ASCII Art Guesser</h1>
          <div className="text-right">
            <p className="text-sm text-gray-400">Turn {currentTurn + 1}/{gameLength}</p>
            <p className="text-lg font-bold text-green-400">Score: {score}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 flex justify-center">
          <pre className="text-green-400 font-mono text-lg leading-tight">
            {currentPuzzle?.ascii_art_string}
          </pre>
        </div>

        <p className="text-center text-gray-300 mb-4">What does this ASCII art represent?</p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {currentPuzzle?.options.map((option) => {
            let cls = "w-full py-3 px-4 rounded-xl font-semibold transition-all "
            if (selectedOption) {
              if (option === currentPuzzle.solution) cls += "bg-green-600 text-white"
              else if (option === selectedOption) cls += "bg-red-600 text-white"
              else cls += "bg-gray-700 text-gray-400"
            } else {
              cls += "bg-gray-700 hover:bg-purple-600 text-white"
            }
            return (
              <button
                key={option}
                onClick={() => selectOption(option)}
                className={cls}
                disabled={!!selectedOption}
              >
                {option}
              </button>
            )
          })}
        </div>

        {selectedOption && (
          <div className="text-center">
            <p className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
            </p>
            {!isCorrect && (
              <p className="text-gray-400 mb-4">
                Answer: <span className="text-green-400 font-bold">{currentPuzzle.solution}</span>
              </p>
            )}
            <button
              onClick={nextTurn}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
            >
              {currentTurn + 1 >= gameLength ? '🏁 See Results' : '➡️ Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
