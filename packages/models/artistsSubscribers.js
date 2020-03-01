const AWS = require('aws-sdk');
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });

const artistsSubscribersTable = process.env.ARTISTS_SUBSCRIBERS_TABLE;

const get = (id, chatId) => dynamoDBClient.get({
  TableName: artistsSubscribersTable,
  Key: { id, chatId },
}).promise().then(result => result.Item);

const getAllArtistEntries = (id) => dynamoDBClient.query({
  TableName: artistsSubscribersTable,
  KeyConditionExpression: "id = :id",
  ExpressionAttributeValues: {
    ":id": id
  }
}).promise().then(result => result.Items);

const getAllChatIdEntries = (chatId) => dynamoDBClient.query({
  TableName: artistsSubscribersTable,
  IndexName: 'chatIdIndex',
  KeyConditionExpression: "chatId = :cid",
  ExpressionAttributeValues: {
    ":cid": chatId
  }
}).promise().then(result => result.Items);

const set = item => dynamoDBClient.put({
  TableName: artistsSubscribersTable,
  Item: item,
}).promise();

const remove = (id, chatId) => dynamoDBClient.delete({
  TableName: artistsSubscribersTable,
  Key: { id, chatId },
}).promise();

module.exports = {
  get,
  getAllArtistEntries,
  getAllChatIdEntries,
  set,
  remove,
};
