const {
  sendMessageToTelegram,
  parseEntityId,
  playlistSubscribe,
  playlistUnsubscribe,
  artistSubscribe,
  artistUnsubscribe,
  getSubscriptionList,
  createResponseObject,
} = require('@spotifier/helpers');

const {
  NO_PLAYLIST_ID,
  INVALID_COMMAND,
} = require('@spotifier/messages');

const {
  playlistSubscribeRegex,
  playlistUnsubscribeRegex,
  artistSubscribeRegex,
  artistUnsubscribeRegex,
  listRegex,
} = require('@spotifier/regexps');

module.exports.interface = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (!data.message) {
      return createResponseObject(200, 'There\'s no valid telegram event object');
    }

    const message = data.message.text;
    const chatId = data.message.chat.id.toString();

    if (playlistSubscribeRegex.test(message)) {
      const playlistId = parseEntityId(message, playlistSubscribeRegex);
      if (playlistId) {
        return await playlistSubscribe(chatId, playlistId);
      } else {
        await sendMessageToTelegram(chatId, NO_PLAYLIST_ID);
        return createResponseObject(200, 'No playlist id provided')
      }
    } else if (playlistUnsubscribeRegex.test(message)) {
      const playlistId = parseEntityId(message, playlistUnsubscribeRegex);
      if (playlistId) {
        return await playlistUnsubscribe(chatId, playlistId);
      } else {
        await sendMessageToTelegram(chatId, NO_PLAYLIST_ID);
        return createResponseObject(200, 'No playlist id provided')
      }
    } else if (artistSubscribeRegex.test(message)) {
      const playlistId = parseEntityId(message, artistSubscribeRegex);
      if (playlistId) {
        return await artistSubscribe(chatId, playlistId);
      } else {
        await sendMessageToTelegram(chatId, NO_PLAYLIST_ID);
        return createResponseObject(200, 'No artist id provided')
      }
    } else if (artistUnsubscribeRegex.test(message)) {
      const playlistId = parseEntityId(message, artistUnsubscribeRegex);
      if (playlistId) {
        return await artistUnsubscribe(chatId, playlistId);
      } else {
        await sendMessageToTelegram(chatId, NO_PLAYLIST_ID);
        return createResponseObject(200, 'No artist id provided')
      }
    } else if (listRegex.test(message)) {
      await getSubscriptionList(chatId);
      return createResponseObject(200, 'Subscription list was successfully sent')
    } else {
      await sendMessageToTelegram(chatId, INVALID_COMMAND);
      return createResponseObject(200, 'The command is not supported')
    }
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};
