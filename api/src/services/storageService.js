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
import { BUCKETS, s3Client } from "../config/s3Client.js";
import AppError from "../utils/AppError.js";
import getMime from "../utils/getMime.js";

const downloadTemplate = async (bucket, bucketPath) => {
  // Create a unique temporary directory on the local filesystem
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${APP_INFO.name}-`));

  // List all files in the template
  const listParams = { Bucket: bucket, Prefix: bucketPath };
  const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listParams));
  if (!listObjectsResult.Contents) throw new AppError("Template is empty.", 404);

  // Download each file into the temp directory
  for (const object of listObjectsResult.Contents) {
    const downloadParams = { Bucket: bucket, Key: object.Key };
    const getObjectResult = await s3Client.send(new GetObjectCommand(downloadParams));
    const localPath = path.join(tempDir, path.basename(object.Key));
    fs.writeFileSync(localPath, await getObjectResult.Body.transformToByteArray());
  }
  return tempDir;
};

const getBucketPath = (userPublicId, templatePublicId) => {
  return `templates/${userPublicId}/${templatePublicId}/`;
};

const getFileObject = async (objectKey) => {
  const params = { Bucket: BUCKETS.templates, Key: objectKey };
  const getObjectResult = await s3Client.send(new GetObjectCommand(params));
  if (!getObjectResult.Body) throw new AppError("File not found.", 404);
  return getObjectResult;
};

const getPresignedUrl = async (bucket, objectKey, expiresIn = 900) => {
  const params = { Bucket: bucket, Key: objectKey };
  return getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: expiresIn });
};

const removeFiles = async (bucket, fileKeys) => {
  const removePromises = fileKeys.map((key) => {
    const removeParams = { Bucket: bucket, Key: key };
    return s3Client.send(new DeleteObjectCommand(removeParams));
  });
  await Promise.all(removePromises);
};

const removeTemplate = async (bucketPath) => {
  const listParams = { Bucket: BUCKETS.templates, Prefix: bucketPath };
  const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listParams));
  listObjectsResult.Contents = listObjectsResult.Contents || [];
  const fileKeys = listObjectsResult.Contents.map((obj) => obj.Key);
  await removeFiles(BUCKETS.templates, fileKeys);
};

const uploadFiles = async (bucket, bucketPath, files) => {
  const uploadPromises = files.map(async (file) => {
    const uploadParams = {
      Bucket: bucket,
      Key: `${bucketPath}${file.originalname}`,
      Body: file.path ? fs.createReadStream(file.path) : file.buffer,
      ContentType: await getMime(file.path, file.buffer, file.originalname),
    };
    return s3Client.send(new PutObjectCommand(uploadParams));
  });
  await Promise.all(uploadPromises);
};

const uploadBuffer = async (bucket, bucketPath, name, buffer) => {
  const file = { originalname: name, buffer: buffer, path: null };
  await uploadFiles(bucket, bucketPath, [file]);
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
