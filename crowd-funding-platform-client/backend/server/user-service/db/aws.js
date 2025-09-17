import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.MY_AWS_REGION);
console.log(process.env.MY_AWS_ACCESS_KEY_ID);
console.log(process.env.MY_AWS_SECRET_ACCESS_KEY);

if (process.env.NODE_ENV !== "test") {
  console.log(process.env.MY_AWS_REGION);
  console.log(process.env.MY_AWS_ACCESS_KEY_ID);
  console.log(process.env.MY_AWS_SECRET_ACCESS_KEY);
}

const s3 = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
