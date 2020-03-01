const AWS = require('aws-sdk');
const { unmarshall } = AWS.DynamoDB.Converter;
const {
  notificationQueue,
} = require('@spotifier/models');
const {
  sendMessageToTelegram,
  sendPhotoToTelegram,
} = require('@spotifier/helpers');
const {
  createResponseObject,
} = require('@spotifier/helpers');

module.exports.handler = async (event) => {
  try {
    const messages = event.Records
      .map(e => {
        if (e.eventName === 'INSERT') {
          return unmarshall(e.dynamodb.NewImage);
        }
      })
      .filter(i => !!i);

    if (messages.length === 0) {
      return createResponseObject(200, 'There\'s no messages to process');
    }

    const processNotifications = async (messagesArr, index = 0) => {
      if (messagesArr[index].cover) {
        await sendPhotoToTelegram(
          messagesArr[index].chatId,
          messagesArr[index].cover,
          messagesArr[index].message
        );
      } else {
        await sendMessageToTelegram(
          messagesArr[index].chatId,
          messagesArr[index].message,
        );
      }

      await notificationQueue.remove(messagesArr[index].chatId, messagesArr[index].message);

      if (messagesArr.length === index + 1) {
        return;
      }
      return await processNotifications(messagesArr, index + 1);
    };
    await processNotifications(messages);
  } catch (e) {
    console.log(e.message);
    return createResponseObject(500, e.message);
  }
};
