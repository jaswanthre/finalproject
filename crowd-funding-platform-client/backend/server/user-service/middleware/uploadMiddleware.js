import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import s3 from "../db/aws.js";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();

const upload = multer({ storage });

// if (process.env.NODE_ENV === "development") {
//   console.log("AWS Region:", process.env.MY_AWS_REGION);
//   console.log("AWS S3 Bucket:", process.env.MY_AWS_S3_BUCKET);
// }

export const profileUpload = upload.single("profile_image");

export const uploadToS3 = async (file, folder) => {
  if (!file) return null;
  try {
    const uploader = new Upload({
      client: s3,
      params: {
        Bucket: process.env.MY_AWS_S3_BUCKET,
        Key: `${folder}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });
    const result = await uploader.done();
    return result.Location;
  } catch (err) {
    console.error("S3 upload failed:", err);
    return null;
  }
};
