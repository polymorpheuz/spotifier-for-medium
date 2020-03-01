const AWS = require('aws-sdk');
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });

const artistsTable = process.env.ARTISTS_TABLE;

const get = id => dynamoDBClient.get({
  TableName: artistsTable,
  Key: { id },
}).promise().then(result => result.Item);

const getAll = () => dynamoDBClient.scan({
  TableName: artistsTable,
}).promise().then(result => result.Items);

const set = item => dynamoDBClient.put({
  TableName: artistsTable,
  Item: item,
}).promise();

const remove = id => dynamoDBClient.delete({
  TableName: artistsTable,
  Key: { id },
}).promise();

module.exports = {
  get,
  getAll,
  set,
  remove,
};
