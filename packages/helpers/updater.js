const {
  playlists,
  playlistsSubscribers,
  artists,
  artistsSubscribers,
  notificationQueue,
} = require('../models');

const {
  getSpotifyAuthToken,
  getPlaylist,
  getArtist,
} = require('./spotify');

const { toHref } = require('./markdown');

const { createResponseObject } = require('./lambda');

const updatePlaylists = async () => {
  try {
    const playlistArray = await playlists.getAll();

    const deleteBlankPlaylists = async (playlistPayload, index = 0) => {
      let localPlaylists = [ ...playlistPayload ];
      const playlistId = localPlaylists[index].id;
      const subscribers = await playlistsSubscribers
        .getAllPlaylistEntries(playlistId);

      if (subscribers.length === 0) {
        await playlists.remove(playlistId);
        localPlaylists = localPlaylists
          .filter((_, playlistIndex) => playlistIndex !== index);
      }

      if (playlistPayload.length === index + 1) {
        return playlistPayload;
      }

      return await deleteBlankPlaylists(
        localPlaylists,
        index + 1
      );
    };
    const filteredPlaylists = await deleteBlankPlaylists(playlistArray);

    const updatePlaylists = async (playlistArr, token, index = 0) => {
      const oldPlaylistSnapshot = playlistArr[index];
      const newPlaylistSnapshot = await getPlaylist(token, oldPlaylistSnapshot.id);

      const newTracks = newPlaylistSnapshot.tracks
        .filter(newItem => oldPlaylistSnapshot.tracks.indexOf(newItem) === -1);

      if (newTracks.length > 0) {
        const subscribers = await playlistsSubscribers.getAllPlaylistEntries(newPlaylistSnapshot.id);
        const message = `"${toHref(newPlaylistSnapshot.name, newPlaylistSnapshot.url
        )}" was updated with ${newTracks.length} new ${newTracks.length > 1 ? 'tracks' : 'track'}`;

        const notificationPromises = subscribers.map((subscriber) => (
          notificationQueue.set({ chatId: subscriber.chatId, message })
        ));
        await Promise.all(notificationPromises);
      }

      await playlists.set(newPlaylistSnapshot);

      if (playlistArr.length === index + 1) {
        return;
      }

      return await updatePlaylists(playlistArr, token, index + 1);
    };

    const spotifyToken = await getSpotifyAuthToken(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET
    );

    await updatePlaylists(filteredPlaylists, spotifyToken);

    return createResponseObject(200, 'Successful playlist update ');
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};

const generateArtistUpdateMessage = (albumType, artist, releaseName, releaseUrl) => {
  switch (albumType) {
    case 'album':
      return `*${artist}* released the new album "${toHref(releaseName, releaseUrl)}"`;
    case 'single':
      return `*${artist}* released the new album "${toHref(releaseName, releaseUrl)}"`;
    case 'appears_on':
      return `*${artist}* appears on "${toHref(releaseName, releaseUrl)}"`;
    case 'compilation':
      return `*${artist}* released the new compilation "${toHref(releaseName, releaseUrl)}"`;
  }
};

const updateArtists = async () => {
  try {
    const artistArray = await artists.getAll();

    const deleteBlankArtists = async (artistPayload, index = 0) => {
      let localArtists = [ ...artistPayload ];
      const artistId = localArtists[index].id;
      const subscribers = await artistsSubscribers
        .getAllArtistEntries(artistId);

      if (subscribers.length === 0) {
        await artists.remove(artistId);
        localArtists = localArtists
          .filter((_, artistIndex) => artistIndex !== index);
      }

      if (artistPayload.length === index + 1) {
        return artistPayload;
      }

      return await deleteBlankArtists(
        localArtists,
        index + 1
      );
    };
    const filteredArtists = await deleteBlankArtists(artistArray);

    const updateArtists = async (artistArr, token, index = 0) => {
      const oldArtistSnapshot = artistArr[index];
      const newArtistSnapshot = await getArtist(token, oldArtistSnapshot.id);

      console.log(oldArtistSnapshot.name);
      const newReleases = newArtistSnapshot.releases
        .filter(newItem => oldArtistSnapshot.releases.indexOf(newItem.id) === -1);

      console.log('oldArtistSnapshot', oldArtistSnapshot.releases.length);
      console.log('newArtistSnapshot', newArtistSnapshot.releases.length);
      console.log('newReleases', newReleases);
      if (newReleases.length > 0) {
        const subscribers = await artistsSubscribers.getAllArtistEntries(newArtistSnapshot.id);

        const notificationPromises = newReleases.reduce(
          (accumulator, release) => accumulator.concat(
            ...subscribers.map(subscriber => (
              notificationQueue.set({
                chatId: subscriber.chatId,
                message: generateArtistUpdateMessage(
                  release.albumType,
                  oldArtistSnapshot.name,
                  release.name,
                  release.url,
                ),
                cover: release.cover,
              })
            )),
          ), []
        );
        await Promise.all(notificationPromises);
      }

      await artists.set({
        ...newArtistSnapshot,
        releases: newArtistSnapshot.releases.map(release => release.id),
      });

      if (artistArr.length === index + 1) {
        return;
      }

      return await updateArtists(artistArr, token, index + 1);
    };

    const spotifyToken = await getSpotifyAuthToken(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET
    );

    console.log('updatePlaylists first invocation');
    await updateArtists(filteredArtists, spotifyToken);

    return createResponseObject(200, 'Successful artist update ');
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};

module.exports = {
  updatePlaylists,
  updateArtists,
};
