const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6106706434:AAFW_RoIgDywRQY4WyZYSAx1mN4ABjdFCcw';
const bot = new TelegramBot(token, { polling: true });
const apiUrl = 'https://api.api-ninjas.com/v1/randomword';


const games = {};
function hangman(msg) {
    // Retrieve a random word from the API
    axios
      .get(apiUrl, {
        headers: {
          'X-Api-Key': 'qNA7BTKA279oPvKYq8Q/nw==0IFEzyslpydbeA8S',
        },
      })
      .then((response) => {
        const word = response.data.word.toLowerCase();
        console.log(word)
        let guessedLetters = new Set();
        let lives = 6;
        let result = '_'.repeat(word.length);
  
        //  welcome message and chatId
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, `Welcome to Hangman! Your word has ${word.length} letters.`);
  
        // Handle user input
        bot.on('message', (msg) => {
          if (msg.chat.id !== chatId) {
            return;
          }
  
          const letter = msg.text.toLowerCase();
        
          
          if (guessedLetters.has(letter)) {
            bot.sendMessage(chatId, `You already guessed the letter "${letter}".`);
            return;
          }
  
          // Add the letter to the set of guessed letters
          guessedLetters.add(letter);
  
          // Check if the letter is in the word
          if (word.includes(letter)) {
            // Update the result string
            for (let i = 0; i < word.length; i++) {
              if (word[i] === letter) {
                result = result.substring(0, i) + letter + result.substring(i + 1);
              }
            }
  
            // Check if the word has been completely guessed
            if (!result.includes('_')) {
              bot.sendMessage(chatId, `Congratulations! You guessed the word "${word}"`);
              bot.removeAllListeners('message');
              return;
            }
  
            bot.sendMessage(chatId, `Good guess! The word now looks like this: ${result}`);
          } else {
            // Decrement lives and check if the game is over
            if(letter.length > 1){
                bot.sendMessage(chatId, 'Please enter a letter per trial')
              }else{
            lives--;
            if (lives === 0) {
              bot.sendMessage(chatId, `Sorry, you ran out of lives. The word was "${word}".`);
              bot.removeAllListeners('message');
              return;
            }
  
            bot.sendMessage(chatId, `Bad luck! The letter "${letter}" is not in the word. You have ${lives} lives left.`);
          }
        }
        });
      })
      .catch((error) => {
        console.error(error);
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
      });
  }
  bot.onText(/\/hangman/, (msg) => {
    hangman(msg);
  });  

