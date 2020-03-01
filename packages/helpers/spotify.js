const axios = require('axios');
const { createResponseObject } = require('./lambda');

const getSpotifyAuthToken = async (client_id, client_secret) => {
  try {
    const { data: { access_token }} = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
      },
      params: {
        grant_type: 'client_credentials',
      },
    });
    return access_token;
  } catch (e) {
    return createResponseObject(500, e.message);
  }
};

const getAllPlaylistTracks = async (token, playlistId, payloadTracks = [], offset) => {
  const { data: { items } } = await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=100`,
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (items.length > 99) {
    return await getAllPlaylistTracks(token, playlistId, payloadTracks.concat(items), offset + 100);
  }
  return payloadTracks.concat(items);
};

const getPlaylist = async (token, playlistId) => {
  const { data: { name, id, external_urls: { spotify }, tracks: { items } } } = await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  let allTracks = items;
  if (items.length > 99) {
    allTracks = await getAllPlaylistTracks(token, playlistId, items, 100);
  }

  return {
    name,
    id,
    url: spotify,
    tracks: allTracks.map(item => item.track.id)
  };
};

const getArtistReleases = async (token, artistId, payloadReleases = [], offset = 0) => {
  const { data: { items } } = await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&offset=${offset}`,
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  console.log(items.length, offset, payloadReleases.length);
  if (items.length > 49) {
    return await getArtistReleases(token, artistId, payloadReleases.concat(items), offset + 50);
  }
  return payloadReleases.concat(items);
};

const getArtist = async (token, artistId) => {
  const { data: { name, id, external_urls: { spotify } } } = await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/artists/${artistId}`,
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  const allReleases = await getArtistReleases(token, artistId);

  return {
    name,
    id,
    url: spotify,
    releases: allReleases.map(item => ({
      id: item.id,
      name: item.name,
      cover: item.images[0].url,
      albumType: item.album_group,
      url: item.external_urls.spotify,
      markets: item.available_markets,
    }))
  };
};

module.exports = {
  getSpotifyAuthToken,
  getPlaylist,
  getAllPlaylistTracks,
  getArtist,
  getArtistReleases,
};
