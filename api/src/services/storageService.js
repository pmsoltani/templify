import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import os from "os";
import path from "path";
import { APP_INFO } from "../config/constants.js";
import s3Client from "../config/s3Client.js";
import AppError from "../utils/AppError.js";

const downloadTemplate = async (bucketPath) => {
  // Create a unique temporary directory on the local filesystem
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${APP_INFO.name}-`));

  // List all files in the template
  const listParams = { Bucket: process.env.R2_BUCKET_NAME, Prefix: bucketPath };
  const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listParams));
  if (!listObjectsResult.Contents) throw new AppError("Template is empty.", 404);

  // Download each file into the temp directory
  for (const object of listObjectsResult.Contents) {
    const downloadParams = { Bucket: process.env.R2_BUCKET_NAME, Key: object.Key };
    const getObjectResult = await s3Client.send(new GetObjectCommand(downloadParams));
    const localPath = path.join(tempDir, path.basename(object.Key));
    fs.writeFileSync(localPath, await getObjectResult.Body.transformToByteArray());
  }
  return tempDir;
};

const getBucketPath = (userPublicId, templatePublicId) => {
  return `userFiles/${userPublicId}/templates/${templatePublicId}/`;
};

const getFileObject = async (objectKey) => {
  const params = { Bucket: process.env.R2_BUCKET_NAME, Key: objectKey };
  const getObjectResult = await s3Client.send(new GetObjectCommand(params));
  if (!getObjectResult.Body) throw new AppError("File not found.", 404);
  return getObjectResult;
};

const getPresignedUrl = async (objectKey, expiresIn = 900) => {
  const params = { Bucket: process.env.R2_BUCKET_NAME, Key: objectKey };
  return getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: expiresIn });
};

const removeFiles = async (fileKeys) => {
  const removePromises = fileKeys.map((key) => {
    const removeParams = { Bucket: process.env.R2_BUCKET_NAME, Key: key };
    return s3Client.send(new DeleteObjectCommand(removeParams));
  });
  await Promise.all(removePromises);
};

const removeTemplate = async (bucketPath) => {
  const listParams = { Bucket: process.env.R2_BUCKET_NAME, Prefix: bucketPath };
  const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listParams));
  listObjectsResult.Contents = listObjectsResult.Contents || [];
  await removeFiles(listObjectsResult.Contents.map((object) => object.Key));
};

const uploadFiles = async (bucketPath, files) => {
  const uploadPromises = files.map((file) => {
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${bucketPath}${file.originalname}`,
      Body: file.path ? fs.createReadStream(file.path) : file.buffer,
      ContentType: file.originalname.endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream",
    };
    return s3Client.send(new PutObjectCommand(uploadParams));
  });
  await Promise.all(uploadPromises);
};

const uploadBuffer = async (bucketPath, name, buffer) => {
  const file = { originalname: name, buffer: buffer, path: null };
  await uploadFiles(bucketPath, [file]);
};

export {
  downloadTemplate,
  getBucketPath,
  getFileObject,
  getPresignedUrl,
  removeFiles,
  removeTemplate,
  uploadBuffer,
  uploadFiles,
};
