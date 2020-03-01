const AWS = require('aws-sdk');
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });

const playlistsTable = process.env.PLAYLISTS_TABLE;

const get = id => dynamoDBClient.get({
  TableName: playlistsTable,
  Key: { id },
}).promise().then(result => result.Item);

const getAll = () => dynamoDBClient.scan({
  TableName: playlistsTable,
}).promise().then(result => result.Items);

const set = item => dynamoDBClient.put({
  TableName: playlistsTable,
  Item: item,
}).promise();

const remove = id => dynamoDBClient.delete({
  TableName: playlistsTable,
  Key: { id },
}).promise();

module.exports = {
  get,
  getAll,
  set,
  remove,
};
