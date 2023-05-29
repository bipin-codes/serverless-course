'use strict';

const {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, body) => {
  return { statusCode, body: JSON.stringify(body) };
};

module.exports.createNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { id, title, body } = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: { S: id },
        title: { S: title },
        body: { S: body },
      },
      ConditionExpression: 'attribute_not_exists(notesId)',
    };

    await client.send(new PutItemCommand(params));
    return send(201, { id, title, body });
  } catch (e) {
    return send(500, e.message);
  }
};

module.exports.updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId: { S: notesId } },
      UpdateExpression: `set #title = :title, #body = :body`,
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body',
      },
      ExpressionAttributeValues: {
        ':title': { S: data.title },
        ':body': { S: data.body },
      },
      ConditionExpression: 'attribute_exists(notesId)',
    };
    await client.send(new UpdateItemCommand(params));

    return send(200, data);
  } catch (err) {
    return send(500, err.message);
  }
};

module.exports.deleteNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: notesId } = event.pathParameters;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId: { S: notesId } },
      ConditionExpression: 'attribute_exists(notesId)',
    };
    await client.send(new DeleteItemCommand(params));

    return send(200, `A note with id  ${notesId} has been deleted!`);
  } catch (e) {
    return send(500, e.message);
  }
};

module.exports.getAllNotes = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const params = { TableName: NOTES_TABLE_NAME };
  try {
    const notes = await client.send(new ScanCommand(params));

    return send(200, notes);
  } catch (e) {
    return send(500, e.message);
  }
};
