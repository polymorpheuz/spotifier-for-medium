const {
  sendMessageToTelegram,
  sendPhotoToTelegram,
} = require('./telegram');
const {
  parseEntityId,
  playlistSubscribe,
  playlistUnsubscribe,
  artistSubscribe,
  artistUnsubscribe,
  getSubscriptionList,
} = require('./bot');
const {
  updatePlaylists,
  updateArtists,
} = require('./updater');

const { createResponseObject } = require('./lambda');

module.exports = {
  sendMessageToTelegram,
  sendPhotoToTelegram,
  parseEntityId,
  playlistSubscribe,
  playlistUnsubscribe,
  artistSubscribe,
  artistUnsubscribe,
  getSubscriptionList,
  updatePlaylists,
  updateArtists,
  createResponseObject,
};
