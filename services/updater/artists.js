const {
  updateArtists,
  createResponseObject,
} = require('@spotifier/helpers');

module.exports.releaseUpdater = async () => {
  try {
    return await updateArtists();
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};
