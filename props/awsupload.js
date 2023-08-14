// Trying to connect to AWS, but it doesn't work.
// I'm keeping this file for future reference.

// const AWS = require('aws-sdk');
const multer=require('multer')
// Multer configuration
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Amazon S3 configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.AWS_REGION,
    },
  });
// Upload function
const uploadToS3 = async (key, body) => {
    try {
      const command = new PutObjectCommand({
        Bucket: 'cyclic-dark-teal-piranha-gown-ap-south-1',
        Key: key,
        Body: JSON.stringify(body),
      });
      await s3Client.send(command);
      console.log('File uploaded to S3 successfully');
    } catch (error) {
      console.error('Error uploading file to S3:', error);
    }
  };
  

// Get function
const getFromS3 = async (key) => {
    try {
      const command = new GetObjectCommand({
        Bucket: 'cyclic-dark-teal-piranha-gown-ap-south-1',
        Key: key,
      });
      const response = await s3Client.send(command);
      return JSON.parse(response.Body.toString());
    } catch (error) {
      console.error('Error fetching file from S3:', error);
      return null;
    }
  };
module.exports={uploadToS3,getFromS3,upload}
