const axios = require('axios');

const sendMessageToTelegram = async (chatId, text) => {
  try {
    return await axios({
      method: 'GET',
      url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/sendMessage`,
      params: { chat_id: chatId, text, parse_mode: 'markdown' },
    });
  } catch (e) {
    console.log(e);
  }
};

const sendPhotoToTelegram = async (chatId, imageUrl, caption) => {
  try {
    return await axios({
      method: 'GET',
      url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/sendPhoto`,
      params: {
        chat_id: chatId,
        photo: imageUrl,
        caption,
        parse_mode: 'markdown',
      },
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  sendMessageToTelegram,
  sendPhotoToTelegram,
};
