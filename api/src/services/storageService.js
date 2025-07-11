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

const unzip = async (zipFilePath) => {
  return new AdmZip(zipFilePath)
    .getEntries()
    .filter((e) => !e.isDirectory)
    .map((e) => ({ name: e.name, size: e.header.size, data: e.getData() }));
};

const uploadFiles = async (bucketPath, files) => {
  const uploadPromises = files.map((file) => {
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${bucketPath}${file.originalname}`,
      Body: file.path ? fs.createReadStream(file.path) : file.buffer,
      ContentType: "application/octet-stream",
    };
    return s3Client.send(new PutObjectCommand(uploadParams));
  });
  await Promise.all(uploadPromises);
};

const uploadBuffer = async (bucketPath, name, buffer) => {
  const file = { originalname: name, buffer: buffer, path: null };
  await uploadFiles(bucketPath, [file]);
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

const uploadPreviewPdf = async (templatePublicId, pdfBuffer) => {
  const timestamp = Date.now();
  const previewKey = `previews/${templatePublicId}/${timestamp}.pdf`;

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: previewKey,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return previewKey;
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

export {
  downloadTemplate,
  getBucketPath,
  getFile,
  getPresignedUrl,
  removeFiles,
  removeTemplate,
  unzip,
  uploadBuffer,
  uploadFiles,
  uploadPdf,
  uploadPreviewPdf,
};
