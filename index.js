// const TelegramBot = require('node-telegram-bot-api');
// const randomWords = require('random-words');
// const token = '6106706434:AAFW_RoIgDywRQY4WyZYSAx1mN4ABjdFCcw';
// const bot = new TelegramBot(token, { polling: true });

// let gameInProgress = false;
// const games = {}

// function hangman(msg) {
//   try {
//     const word = randomWords();
//     console.log(word);
//     let guessedLetters = new Set();
//     let lives = 6;
//     let result = '_'.repeat(word.length);
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, `Let's begin! Your word has ${word.length} letters: ${result}`);

//     bot.on('message', (msg) => {
//       const letter = msg.text.toLowerCase();
//       if (guessedLetters.has(letter)) {
//         bot.sendMessage(chatId, `You already guessed the letter "${letter}"`);
//       } else {
//         guessedLetters.add(letter);
//         if (word.includes(letter)) {
//           result = result.split('').map((char, index) => {
//             if (word[index] === letter) {
//               return letter;
//             } else {
//               return char;
//             }
//           }).join('');
//           bot.sendMessage(chatId, `Good guess! The word now looks like this: ${result}`);
//         } else {
//           lives--;
//           if (lives === 0) {
//             bot.sendMessage(chatId, `Sorry, you ran out of lives. The word was "${word}". Try again! /single `);
//             bot.removeAllListeners('message');
//             gameInProgress = false;
//             return;
//           }
//           bot.sendMessage(chatId, `Bad luck! The letter "${letter}" is not in the word. You have ${lives} lives left.`);
//         }
//         // Check if the word has been completely guessed
//         if (!result.includes('_')) {
//           bot.sendMessage(chatId, `Congratulations! You guessed the word "${word}"`);
//           bot.removeAllListeners('message');
//           gameInProgress = false;
//           return;
//           hangman(chatId)
//         }
//       }
//     });
//   } catch (error) {
//     throw error;
//   }
// }

// bot.onText(/\/single/, (msg) => {
//   if (gameInProgress) {
//     bot.sendMessage(msg.chat.id, 'Sorry, a game is already in progress. Type /stop to end the current game.');
//   } else {
//     gameInProgress = true;
//     // Start the game
//     hangman(msg);
//   }
// });

// bot.onText(/\/start/, (msg) => {
//   const username = msg.from.username;
//   bot.sendMessage(msg.chat.id, `Hello ${username}, welcome to the Hangman Bot.`);
//   bot.sendMessage(msg.chat.id, 'Welcome to Hangman Bot! Type /single to start a new game.');
// });

// bot.onText(/\/stop/, (msg) => {
//   gameInProgress = false;
//   bot.sendMessage(msg.chat.id, `Game stopped`);
//   bot.removeAllListeners('message');
// });

const TelegramBot = require('node-telegram-bot-api');
console.log('Bot is starting') 
const randomWords = require('random-words');

const token = '6106706434:AAFW_RoIgDywRQY4WyZYSAx1mN4ABjdFCcw';
const bot = new TelegramBot(token, { polling: true });

let gameInProgress = false;
let gameStarting = false;
let gameTimer;
let players = [];

function startGame() {
  gameInProgress = true;
  gameStarting = false;

  let word = randomWords();
  let guessedLetters = new Set();
  let lives = new Map();
  let result = '_'.repeat(word.length);
  let gameOver = false;
  let currentPlayerIndex = 0;

  for (let player of players) {
    lives.set(player.chatId, 6);
    bot.sendMessage(player.chatId, `Starting new game! Your word has ${word.length} letters: ${result}`);
  }
  const intervalTime = 15000;

  let interval = setInterval(() => {
    console.log('Players:', players);
    let currentPlayer = players[currentPlayerIndex];
    let playerLives = lives.get(currentPlayer.chatId);
  
    console.log('Current player:', currentPlayer) 
    bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, you have ${playerLives} lives left. Guess a letter!`);
  
    const messageHandler = (msg) => {
      if (msg.from.username !== currentPlayer.username) {
        return;
      }
  
      const letter = msg.text.toLowerCase();
  
      if (guessedLetters.has(letter)) {
        bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, you already guessed the letter "${letter}"`);
      } else {
        guessedLetters.add(letter);
  
        if (word.includes(letter)) {
          result = result.split('').map((char, index) => {
            if (word[index] === letter) {
              return letter;
            } else {
              return char;
            }
          }).join('');
          bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, good guess! The word now looks like this: ${result}`);
        } else {
          playerLives--;
          lives.set(currentPlayer.chatId, playerLives);
          if (playerLives === 0) {
            bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, sorry, you ran out of lives. The word was "${word}".`);
            players.splice(currentPlayerIndex, 1);
            currentPlayerIndex--;
          } else {
            bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, bad luck! The letter "${letter}" is not in the word. You have ${playerLives} lives left.`);
          }
        }
  
        if (!result.includes('_')) {
          for (let player of players) {
            bot.sendMessage(player.chatId, `Congratulations! You guessed the word "${word}"`);
          }
          clearInterval(interval);
        } else if (players.length === 1) {
          for (let player of players) {
            bot.sendMessage(player.chatId, `Game over! The word was "${word}".`);
          }
          clearInterval(interval);
        }
  
        if (!gameOver) {
          currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
          console.log(currentPlayerIndex)
          currentPlayer = players[currentPlayerIndex];
          bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, you have ${lives.get(currentPlayer.chatId)} lives left. Guess a letter!`);
        }
      }
    };
  
    bot.on('message', messageHandler);
  
    setTimeout(() => {
      bot.removeListener('message', messageHandler);
      if (!gameOver) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentPlayer = players[currentPlayerIndex];
        bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, you have ${lives.get(currentPlayer.chatId)} lives left. Guess a letter!`);
      }
    }, intervalTime);
  
  }, intervalTime);
  
}

bot.onText(/\/multi/, (msg) => {
if (gameInProgress || gameStarting) {
bot.sendMessage(msg.chat.id, 'A game is already in progress or starting. Please wait.');
} else {
players = [{ chatId: msg.chat.id, username: msg.from.username }];
bot.sendMessage(msg.chat.id, 'Starting new game! Send /join to join the game.');
gameStarting = true;
gameTimer = setTimeout(() => {
if (players.length < 2) {
bot.sendMessage(msg.chat.id, 'Not enough players joined the game. Game cancelled.');
gameStarting = false;
} else {
  console.log('Game is starting')
startGame();

}
}, 30000);
}
});

bot.onText(/\/join/, (msg) => {
if (!gameStarting ) {
bot.sendMessage(msg.chat.id, 'No game is currently starting. Send /multi to start a new game.');
} else if (gameInProgress) {
bot.sendMessage(msg.chat.id, 'A game is already in progress. Please wait for the next game to start.');
} else {
players.push({ chatId: msg.chat.id, username: msg.from.username });
bot.sendMessage(msg.chat.id,` @${msg.from.username} has joined the game!`);

}
});

bot.onText(/endgame/, (msg) => {
if (!gameInProgress && !gameStarting) {
bot.sendMessage(msg.chat.id, 'No game is currently in progress or starting.');
} else {
players = [];
clearTimeout(gameTimer);
gameStarting = false;
gameInProgress = false;
bot.sendMessage(msg.chat.id, 'The game has been ended.');
}
});

bot.on('message', (msg) => {
if (msg.text && msg.text.toLowerCase() === 'ping') {
bot.sendMessage(msg.chat.id, 'pong');
}
});







