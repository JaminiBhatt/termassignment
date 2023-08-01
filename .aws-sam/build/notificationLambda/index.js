const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: 'ASIATVLZYESXMT4VASOU',
    secretAccessKey: 'u+grTq39HqQBk7rHQRgCkwk9VCGv/9hmtFzq7nU4',
    sessionToken: 'FwoGZXIvYXdzECIaDJGutlC3LNDQkPvJGyLAAXRzXrB6vIsXSjMhI46cqAE4GekH2soRjbDyiQd2giYWJIcZz1YCiRDCfyxebMKRJsLo6PzwXtxpGaNCTvh8Dn2J9+/bBNCYrVh36TurTwUxQ0C5ZniYZHLccsUotstz2QM5A5MV5IiwP3ygA3qHMjIWSD0lC3WbNmD2oHpvYJvTecrNxVt1gIzCKqeS6jLg65L4cdb9KdFEZLYCFS1pLVtDDOzCLGV1vwNrCDgS5Vpldc6HjNRbZjAXabbxQyntRiiFoZqmBjItSRwpjO3XTbmrxtgVirvdIBdQgGIXd6UBbRLDEOUxUAXMdQQ4hfy3VXr5txaD',
});

const sqs = new AWS.SQS();

exports.queueHandler = async (event) => {
    try {
        const { text } = event;

        const queueUrl = 'https://sqs.us-east-1.amazonaws.com/252047795374/notificationQueue';
        const params = {
            MessageBody: JSON.stringify(text),
            QueueUrl: queueUrl,
        };

        await sqs.sendMessage(params).promise();
        console.log('Notification sent:', event);

        console.log('All order messages sent successfully');
        return {
            statusCode: 200,
            body: JSON.stringify('All order messages sent successfully'),
        };
    } catch (error) {
        console.error('Error sending order messages:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error sending order messages'),
        };
    }
};

const sns = new AWS.SNS();

exports.notificationHandler = async (event) => {
    try {
        const QueueUrl = 'https://sqs.us-east-1.amazonaws.com/252047795374/notificationQueue';
        const message = await receiveMessageFromQueue(QueueUrl);

        const order = {
            email: JSON.parse(message.Body)
        };

        const topicArn = 'arn:aws:sns:us-east-1:252047795374:notificationTopic';
        const publishParams = {
            Message: JSON.stringify(order),
            TopicArn: topicArn,
        };

        await sns.publish(publishParams).promise();
        console.log('Details sent to SNS topic.');

        await deleteMessageFromQueue(QueueUrl, message.ReceiptHandle);

        return {
            statusCode: 200,
            body: JSON.stringify('Success!'),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error'),
        };
    }
};

async function receiveMessageFromQueue(queueUrl) {
    const receiveParams = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 0,
    };

    const data = await sqs.receiveMessage(receiveParams).promise();
    if (!data.Messages || !data.Messages[0]) {
        throw new Error('No messages in the queue.');
    }

    return data.Messages[0];
}

async function deleteMessageFromQueue(queueUrl, receiptHandle) {
    const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
    };
    await sqs.deleteMessage(deleteParams).promise();
}
