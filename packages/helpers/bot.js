const { sendMessageToTelegram } = require('./telegram');
const {
  playlists,
  playlistsSubscribers,
  artists,
  artistsSubscribers,
} = require('../models');
const {
  getSpotifyAuthToken,
  getPlaylist,
  getArtist,
} = require('./spotify');
const { createResponseObject } = require('./lambda');
const {
  SUBSCRIBED,
  UNSUBSCRIBED,
  EMPTY_SUBSCRIPTIONS,
  ALREADY_SUBSCRIBED,
  NO_SUBSCRIPTION,
  WRONG_PLAYLIST_ID,
  WRONG_ARTIST_ID,
} = require('../messages');

const parseEntityId = (str, regex) => str
  .replace(regex, '')
  .trim();

const playlistSubscribe = async (chatId, playlistId) => {
  try {
    const isAlreadySubscribed = await playlistsSubscribers.get(playlistId, chatId);
    console.log('is already subscribed', isAlreadySubscribed);
    if (isAlreadySubscribed) {
      await sendMessageToTelegram(chatId, ALREADY_SUBSCRIBED);
      return createResponseObject(200, 'User is already subscribed')
    }

    const dbPlaylist = await playlists.get(playlistId);

    let playlist = dbPlaylist;
    if (!dbPlaylist) {
      const spotifyToken = await getSpotifyAuthToken(
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );
      playlist = await getPlaylist(spotifyToken, playlistId);
      await playlists.set({ ...playlist });
    }

    await playlistsSubscribers.set({ id: playlistId, chatId, name: playlist.name });
    await sendMessageToTelegram(chatId, SUBSCRIBED.replace(/{entity}/, playlist.name));
    return createResponseObject(200, 'Successful playlist subscription ');
  } catch (e) {
    console.log(e.message);
    if (e.response && e.response.status === 404) {
      sendMessageToTelegram(chatId, WRONG_PLAYLIST_ID);
      return createResponseObject(200, WRONG_PLAYLIST_ID);
    }
    return createResponseObject(500, e.message);
  }
};

const playlistUnsubscribe = async (chatId, playlistId) => {
  try {
    const subscription = await playlistsSubscribers.get(playlistId, chatId);
    if (!subscription) {
      await sendMessageToTelegram(chatId, NO_SUBSCRIPTION);
      return createResponseObject(200, 'There\'s no such subscription');
    }

    await playlistsSubscribers.remove(playlistId, chatId);
    await sendMessageToTelegram(chatId, UNSUBSCRIBED.replace(/{entity}/, subscription.name));
    return createResponseObject(200, 'Successful playlist unsubscription');
  } catch (e) {
    console.log(e.message);
    createResponseObject(500, e.message);
  }
};

const artistSubscribe = async (chatId, artistId) => {
  try {
    const isAlreadySubscribed = await artistsSubscribers.get(artistId, chatId);
    if (isAlreadySubscribed) {
      await sendMessageToTelegram(chatId, ALREADY_SUBSCRIBED);
      return createResponseObject(200, 'User is already subscribed')
    }

    const dbArtist = await artists.get(artistId);

    let artist = dbArtist;
    if (!dbArtist) {
      const spotifyToken = await getSpotifyAuthToken(
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );
      artist = await getArtist(spotifyToken, artistId);
      await artists.set({
        ...artist,
        releases: artist.releases.map(release => release.id),
      });
    }

    await artistsSubscribers.set({ id: artistId, chatId, name: artist.name });
    await sendMessageToTelegram(chatId, SUBSCRIBED.replace(/{entity}/, artist.name));
    return createResponseObject(200, 'Successful artist subscription ');
  } catch (e) {
    console.log(e.message);
    if (e.response && e.response.status === 404) {
      sendMessageToTelegram(chatId, WRONG_ARTIST_ID);
      return createResponseObject(200, WRONG_ARTIST_ID);
    }
    return createResponseObject(500, e.message);
  }
};

const artistUnsubscribe = async (chatId, artistId) => {
  try {
    const subscription = await artistsSubscribers.get(artistId, chatId);
    if (!subscription) {
      await sendMessageToTelegram(chatId, NO_SUBSCRIPTION);
      return createResponseObject(200, 'There\'s no such subscription');
    }

    await artistsSubscribers.remove(artistId, chatId);
    await sendMessageToTelegram(chatId, UNSUBSCRIBED.replace(/{entity}/, subscription.name));
    return createResponseObject(200, 'Successful artist unsubscription ');
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};

const getSubscriptionList = async (chatId) => {
  try {
    const playlists = await playlistsSubscribers.getAllChatIdEntries(chatId);
    const artists = await artistsSubscribers.getAllChatIdEntries(chatId);

    if (playlists.length === 0 && artists.length === 0) {
      await sendMessageToTelegram(chatId, EMPTY_SUBSCRIPTIONS);
      return createResponseObject(200, 'Subscription list is empty');
    }

    let playlistsString = '';

    let artistsString = '';

    if (artists.length > 0) {
      artistsString = '*Artists:*\n'.concat(artists.map(artist => (
        `${artist.name}(${artist.id})\n`
      )));
    }

    if (playlists.length > 0) {
      playlistsString = '\r\n*Playlists:*\n'.concat(playlists.map(playlist => (
        `${playlist.name}(${playlist.id})\n`
      )));
    }

    await sendMessageToTelegram(chatId, playlistsString + artistsString);
    return createResponseObject(200, 'Successful subscription list retrieval');
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};

module.exports = {
  playlistSubscribe,
  playlistUnsubscribe,
  artistSubscribe,
  artistUnsubscribe,
  parseEntityId,
  getSubscriptionList,
};
