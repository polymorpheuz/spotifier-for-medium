const AWS = require('aws-sdk');
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });

const playlistsSubscribersTable = process.env.PLAYLISTS_SUBSCRIBERS_TABLE;

const get = (id, chatId) => dynamoDBClient.get({
  TableName: playlistsSubscribersTable,
  Key: { id, chatId },
}).promise().then(result => result.Item);

const getAllPlaylistEntries = (id) => dynamoDBClient.query({
  TableName: playlistsSubscribersTable,
  KeyConditionExpression: "id = :id",
  ExpressionAttributeValues: {
    ":id": id
  }
}).promise().then(result => result.Items);

const getAllChatIdEntries = (chatId) => dynamoDBClient.query({
  TableName: playlistsSubscribersTable,
  IndexName: 'chatIdIndex',
  KeyConditionExpression: "chatId = :cid",
  ExpressionAttributeValues: {
    ":cid": chatId
  }
}).promise().then(result => result.Items);

const set = item => dynamoDBClient.put({
  TableName: playlistsSubscribersTable,
  Item: item,
}).promise();

const remove = (id, chatId) => dynamoDBClient.delete({
  TableName: playlistsSubscribersTable,
  Key: { id, chatId },
}).promise();

module.exports = {
  get,
  getAllPlaylistEntries,
  getAllChatIdEntries,
  set,
  remove,
};
