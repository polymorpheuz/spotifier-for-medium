const {
  updatePlaylists,
  createResponseObject,
} = require('@spotifier/helpers');

module.exports.songUpdater = async () => {
  try {
    return await updatePlaylists();
  } catch (e) {
    console.log(e.message);
    return createResponseObject(200, e.message);
  }
};
