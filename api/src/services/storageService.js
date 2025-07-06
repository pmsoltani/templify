import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AdmZip from "adm-zip";
import fs from "fs";
import os from "os";
import path from "path";
import s3Client from "../config/s3Client.js";
import AppError from "../utils/AppError.js";

const getBucketPath = (userPublicId, templatePublicId) => {
  return `userFiles/${userPublicId}/templates/${templatePublicId}/`;
};

const getFile = async (objectKey) => {
  const params = { Bucket: process.env.R2_BUCKET_NAME, Key: objectKey };
  const getObjectResult = await s3Client.send(new GetObjectCommand(params));
  if (!getObjectResult.Body) throw new AppError("File not found.", 404);
  return getObjectResult;
};

const getPresignedUrl = async (objectKey, expiresIn = 900) => {
  const params = { Bucket: process.env.R2_BUCKET_NAME, Key: objectKey };
  return getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: expiresIn });
};

const unzipAndUpload = async (zipFilePath, bucketPathPrefix) => {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  const uploadPromises = zipEntries.map((entry) => {
    if (entry.isDirectory) return null; // Skip directories

    const key = `${bucketPathPrefix}/${entry.entryName}`;
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: entry.getData(), // Get file content directly from zip entry
      ContentType: entry.mimeType,
    };
    return s3Client.send(new PutObjectCommand(params));
  });
  await Promise.all(uploadPromises);
};

const downloadTemplate = async (bucketPath) => {
  // Create a unique temporary directory on the local filesystem
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "templify-"));

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

const uploadFile = async (name, tempPath, bucketPath) => {
  const key = `${bucketPath}${name}`;
  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fs.createReadStream(tempPath),
    ContentType: "application/octet-stream",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return key;
};

const uploadPdf = async (publicId, userPublicId, pdfBuffer) => {
  const pdfKey = `userFiles/${userPublicId}/pdfs/${publicId}.pdf`;
  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: pdfKey,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
  return pdfKey;
};

const removeTemplate = async (bucketPath) => {
  const listParams = { Bucket: process.env.R2_BUCKET_NAME, Prefix: bucketPath };
  const listObjectsResult = await s3Client.send(new ListObjectsV2Command(listParams));
  if (!listObjectsResult.Contents || listObjectsResult.Contents.length === 0) return;

  const removePromises = listObjectsResult.Contents.map((object) => {
    const removeParams = { Bucket: process.env.R2_BUCKET_NAME, Key: object.Key };
    return s3Client.send(new DeleteObjectCommand(removeParams));
  });
  await Promise.all(removePromises);
};

const removeFiles = async (fileKeys) => {
  const removePromises = fileKeys.map((key) => {
    const removeParams = { Bucket: process.env.R2_BUCKET_NAME, Key: key };
    return s3Client.send(new DeleteObjectCommand(removeParams));
  });
  await Promise.all(removePromises);
};

export {
  downloadTemplate,
  getBucketPath,
  getFile,
  getPresignedUrl,
  removeFiles,
  removeTemplate,
  unzipAndUpload,
  uploadFile,
  uploadPdf,
};
