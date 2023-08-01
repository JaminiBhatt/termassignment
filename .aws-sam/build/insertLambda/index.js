const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'tblTask';

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'ASIATVLZYESXMT4VASOU',
  secretAccessKey: 'u+grTq39HqQBk7rHQRgCkwk9VCGv/9hmtFzq7nU4',
  sessionToken: 'FwoGZXIvYXdzECIaDJGutlC3LNDQkPvJGyLAAXRzXrB6vIsXSjMhI46cqAE4GekH2soRjbDyiQd2giYWJIcZz1YCiRDCfyxebMKRJsLo6PzwXtxpGaNCTvh8Dn2J9+/bBNCYrVh36TurTwUxQ0C5ZniYZHLccsUotstz2QM5A5MV5IiwP3ygA3qHMjIWSD0lC3WbNmD2oHpvYJvTecrNxVt1gIzCKqeS6jLg65L4cdb9KdFEZLYCFS1pLVtDDOzCLGV1vwNrCDgS5Vpldc6HjNRbZjAXabbxQyntRiiFoZqmBjItSRwpjO3XTbmrxtgVirvdIBdQgGIXd6UBbRLDEOUxUAXMdQQ4hfy3VXr5txaD',
});


exports.insertLambdahandler = async (event) => {
  try {
    const { id, title, description, status } = event;
    
    // Store the new data in DynamoDB
    const params = {
      TableName: tableName,
      Item: {
        id: id,
        title: title,
        description: description,
        status: status
      },
    };
    console.log(params);
    await dynamoDB.put(params).promise();

    return {
      statusCode: 200,
      body: 'Data stored in DynamoDB successfully!',
    };
  } catch (error) {
    console.error('Error storing data in DynamoDB:', error);
    return {
      statusCode: 500,
      body: error,
    };
  }
};

