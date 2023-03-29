const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const randomWords = require('random-words');

const token = '6106706434:AAFW_RoIgDywRQY4WyZYSAx1mN4ABjdFCcw';
const bot = new TelegramBot(token, { polling: true });

let gameInProgress = false;
const games = {};

function hangman(msg) {
  try {
    const word = randomWords();
    console.log(word);
    let guessedLetters = new Set();
    let lives = 6;
    let result = '_'.repeat(word.length);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Let's begin! Your word has ${word.length} letters.`);

    while (result.includes('_') && lives > 0) {
      bot.on('message', (msg) => {
        const letter = msg.text.toLowerCase();
        if (guessedLetters.has(letter)) {
          bot.sendMessage(chatId, `You already guessed the letter "${letter}"`);
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
            bot.sendMessage(chatId, `Good guess! The word now looks like this: ${result}`);
          } else {
            lives--;
            if (lives === 0) {
              bot.sendMessage(chatId, `Sorry, you ran out of lives. The word was "${word}".`);
              bot.removeAllListeners('message');
              gameInProgress = false;
              return;
            }
            bot.sendMessage(chatId, `Bad luck! The letter "${letter}" is not in the word. You have ${lives} lives left.`);
          }
          // Check if the word has been completely guessed
          if (!result.includes('_')) {
            bot.sendMessage(chatId, `Congratulations! You guessed the word "${word}"`);
            bot.removeAllListeners('message');
            gameInProgress = false;
            return;
          }
        }
      });
    }
  } catch (error) {
    throw error;
    gameInProgress = false;
  }
}


bot.onText(/\/single/, (msg) => {
  const chatId= msg.chat.id
  if (gameInProgress) {
    bot.sendMessage(msg.chat.id, 'Sorry, a game is already in progress.');
  } else {
    gameInProgress = true;
    // Start the game
    hangman(chatId);
  }
});

bot.onText(/\/start/, (msg) => {
  const username = msg.from.username;
  bot.sendMessage(msg.chat.id, `Hello ${username}, welcome to the Hangman Bot.`);
});

bot.onText(/\/stop/, (msg) => {
 gameInProgress= false
 bot.sendMessage(msg.chat.id, `Game stopped`);
});

