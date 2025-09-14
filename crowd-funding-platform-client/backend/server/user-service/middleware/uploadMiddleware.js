import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import s3 from "../db/aws.js";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

console.log(process.env.MY_AWS_S3_BUCKET);
console.log(process.env.MY_AWS_REGION);
console.log(process.env.MY_AWS_ACCESS_KEY_ID);
console.log(process.env.MY_AWS_SECRET_ACCESS_KEY);

export const profileUpload = upload.single("profile_image");

export const uploadToS3 = async (file, folder) => {
  if (!file) return null;
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.MY_AWS_S3_BUCKET,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });
  const result = await upload.done();
  return result.Location;
};
