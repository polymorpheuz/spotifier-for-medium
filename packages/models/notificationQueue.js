const AWS = require('aws-sdk');
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });

const notificationQueueTable = process.env.NOTIFICATION_QUEUE_TABLE;

const set = item => dynamoDBClient.put({
  TableName: notificationQueueTable,
  Item: item,
}).promise();

const remove = (chatId, message) => dynamoDBClient.delete({
  TableName: notificationQueueTable,
  Key: { chatId, message },
}).promise();

module.exports = {
  set,
  remove,
};
