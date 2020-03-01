const { toCode, toHref } = require('../helpers/markdown');

const NO_PLAYLIST_ID = `There's no playlist provided. Message should be like ${
  toCode('/playlistsubscribe 32Vrp5ol37W4IbsbCrImD5')}. You can find out how to find it ${toHref('here', 'https://telegra.ph/How-to-find-a-Spotify-playlist-ID-06-30')}.`;
const NO_ARTIST_ID = `There's no playlist provided. Message should be like ${
  toCode('/artistsubscribe 1PmVyfIR9KtCxbHWuga8E5')}. You can find out how to find it ${toHref('here', 'https://telegra.ph/How-to-find-a-Spotify-artist-02-11')}.`;
const WRONG_PLAYLIST_ID = 'Wrong playlist id';
const WRONG_ARTIST_ID = 'Wrong artist id';
const INVALID_COMMAND = 'Invalid command';
const ALREADY_SUBSCRIBED = 'You\'re already subscribed on this';
const SUBSCRIBED = 'You\'ve been successfully subscribed on "{entity}"';
const UNSUBSCRIBED = 'You\'ve been successfully unsubscribed from "{entity}"';
const NO_SUBSCRIPTION = 'There\'s no such subscription in your list';
const EMPTY_SUBSCRIPTIONS = 'You\'re not subscribed on anything yet';

module.exports = {
  NO_PLAYLIST_ID,
  NO_ARTIST_ID,
  INVALID_COMMAND,
  WRONG_PLAYLIST_ID,
  WRONG_ARTIST_ID,
  SUBSCRIBED,
  UNSUBSCRIBED,
  ALREADY_SUBSCRIBED,
  NO_SUBSCRIPTION,
  EMPTY_SUBSCRIPTIONS,
};
