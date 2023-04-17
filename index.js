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
let guessedLetters = new Set();


function debounce(callback, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}


async function startRound(currentPlayer, word, guessedLetters, wordState) {
  let gameOver = false;

  await bot.sendMessage(currentPlayer.chatId, `The Word has ${word.length} characters!`);

  await bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, you have ${currentPlayer.lives} lives left. Guess a letter!`);

  const messageHandler = debounce(async (msg) => {
    if (msg.from.username !== currentPlayer.username) {
      return;
    }

    const letter = msg.text.toLowerCase();
    if (letter.length > 1) {
      await bot.sendMessage(currentPlayer.chatId,`@${currentPlayer.username}, please enter only one letter at a time.`);
      return;
    }

    if (guessedLetters.has(letter)) {
      await bot.sendMessage(currentPlayer.chatId,` @${currentPlayer.username}, The letter "${letter}" has been guessed`);
    } else {
      guessedLetters.add(letter);

      if (!word.includes(letter)) {
        currentPlayer.lives--;
        if (currentPlayer.lives === 0) {
          await bot.sendMessage(currentPlayer.chatId, `@${currentPlayer.username}, sorry, you ran out of lives`);
          players.splice(players.indexOf(currentPlayer), 1);
        } else {
          await bot.sendMessage(currentPlayer.chatId,` @${currentPlayer.username}, bad luck! The letter "${letter}" is not in the word. You have ${currentPlayer.lives} lives left.`);
          await bot.sendMessage(currentPlayer.chatId, ` The word now looks like this: ${wordState.join(' ')}`);
        }
      } else {
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            wordState[i] = letter;
          }
        }

        if (!wordState.includes(null)) {
          const playersWithLives = players.filter(player => player.lives > 0);
          if (playersWithLives.length > 1) {
            for (let player of playersWithLives) {
              await bot.sendMessage(player.chatId, `Congratulations! You guessed the word "${word}"`);
            }
            const nextPlayerIndex = (players.indexOf(currentPlayer) + 1) % players.length;
            const nextPlayer = players[nextPlayerIndex];
            await startRound(nextPlayer, word, new Set(), Array(word.length).fill(null));
          } else {
            for (let player of playersWithLives) {
              await bot.sendMessage(player.chatId, `Game over! @${player.username} won!! The word was "${word}".`);
            }
            gameOver = true;
          }
        } else {
          await bot.sendMessage(currentPlayer.chatId,` @${currentPlayer.username}, good guess! The letter "${letter}" is in the word.`);
          await bot.sendMessage(currentPlayer.chatId, ` The word now looks like this: ${wordState.join(' ')}`);
        }
      }

      if (!gameOver) {
        if (!wordState.includes(null)) {
          for (let player of players) {
            await bot.sendMessage(player.chatId, `Congratulations! You guessed the word "${word}"`);
          }
          gameOver = true;
        } else if (players.length === 1) {
          for (let player of players) {
            await bot.sendMessage(player.chatId,`Game over! @${player.username} won!! The word was "${word}".`);
          }
          gameOver = true;
        }

      if (!gameOver) {
        let nextPlayerIndex = (players.indexOf(currentPlayer) + 1) % players.length;
        let nextPlayer = players[nextPlayerIndex];
        
        await startRound(nextPlayer, word, guessedLetters, wordState);
        bot.off('message', messageHandler);
      
      };
    };
     
    };
  },7500);

  bot.on('message', messageHandler);
}



bot.onText(/\/multi/, async (msg) => {
  console.log('multi fired')
  if(gameStarting){
    bot.sendMessage(msg.chat.id, 'A game is already in progress. Please wait for it to finish.');
    return;
  }
  gameStarting = true
  players.push({ chatId: msg.chat.id, username: msg.from.username });
  await bot.sendMessage(msg.chat.id, `@${msg.from.username} started a game! send /join to join the game.`)
  gameStarting = true;
  gameTimer = setTimeout(async () => {
    if (players.length < 2) {
      await bot.sendMessage(msg.chat.id, 'Not enough players joined the game. Game cancelled!')
      gameStarting = false
    } else {
      console.log('Game is starting')
     
      for (let player of players) {
        player.lives = 6;
      }
      const word = randomWords();
  console.log(word)
  let wordState = Array(word.length).fill(null);
      gameInProgress=true
      startRound(players[0], word, guessedLetters, wordState);
    }
  }, 30000);
})
  // if(gameInProgress || gameStarting){
  //   bot.sendMessage(msg.chat.id, 'A game is already in progress or starting. Please wait')
  // }else{
  //   players =[{chatId: msg.chat.id, username:msg.from,username}];
  //   bot.sendMessage(msg.chat.id, `@${msg.from.username} started a game! send /join to join the game.` )
  //   gameStarting= true;
  //   gameTimer =setTimeout(()=>{
  //     if (players.length < 2){
  //       bot.sendMessage(msg.chat.id, 'Not enough players joined the game. Game cancelled!')
  //       gameStarting = false
  //     }else{
  //       console.log('Game is starting')
  //       startGame()
  //     }
  //   }, 30000)
  // }


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
bot.removeAllListeners()

}})
;

bot.on('message', (msg) => {
if (msg.text && msg.text.toLowerCase() === 'ping') {
bot.sendMessage(msg.chat.id, 'pong');
}
});







