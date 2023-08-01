const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'tblTask';


AWS.config.update({
    region: 'us-east-1',
    accessKeyId: 'ASIATVLZYESXMT4VASOU',
    secretAccessKey: 'u+grTq39HqQBk7rHQRgCkwk9VCGv/9hmtFzq7nU4',
    sessionToken: 'FwoGZXIvYXdzECIaDJGutlC3LNDQkPvJGyLAAXRzXrB6vIsXSjMhI46cqAE4GekH2soRjbDyiQd2giYWJIcZz1YCiRDCfyxebMKRJsLo6PzwXtxpGaNCTvh8Dn2J9+/bBNCYrVh36TurTwUxQ0C5ZniYZHLccsUotstz2QM5A5MV5IiwP3ygA3qHMjIWSD0lC3WbNmD2oHpvYJvTecrNxVt1gIzCKqeS6jLg65L4cdb9KdFEZLYCFS1pLVtDDOzCLGV1vwNrCDgS5Vpldc6HjNRbZjAXabbxQyntRiiFoZqmBjItSRwpjO3XTbmrxtgVirvdIBdQgGIXd6UBbRLDEOUxUAXMdQQ4hfy3VXr5txaD',
});

exports.editLambdahandler = async (event) => {
    try {
        const { id, newStatus } = event;
        let ID = parseInt(id);
    
        // Check if the instanceId already exists in DynamoDB
        const checkParams = {
          TableName: tableName,
          Key: {
            id: ID,
          },
        };
    
        const existingData = await dynamoDB.get(checkParams).promise();
        if (existingData && existingData.Item) {
          // If the instanceId exists, update the existing entry
          const updateParams = {
            TableName: tableName,
            Key: {
              id: ID,
            },
            UpdateExpression: 'SET #status = :newStatusValue',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':newStatusValue': newStatus,
            },
          };
    
          console.log(updateParams);
          await dynamoDB.update(updateParams).promise();
        } else {
          console.error('Item with the provided id does not exist in DynamoDB.');
          return {
            statusCode: 404,
            body: 'Item not found in DynamoDB.',
          };
        }
    
        return {
          statusCode: 200,
          body: 'Data updated in DynamoDB successfully!',
        };
      } catch (error) {
        console.error('Error updating data in DynamoDB:', error);
        return {
          statusCode: 500,
          body: error,
        };
      }
};
