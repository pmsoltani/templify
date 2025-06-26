import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3Client.js";

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
  const listObjectsResult = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: bucketPath,
    })
  );
  if (!listObjectsResult.Contents) throw new Error("Template is empty.");

  // Download each file into the temp directory
  for (const object of listObjectsResult.Contents) {
    const getObjectResult = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: object.Key,
      })
    );
    const localPath = path.join(tempDir, path.basename(object.Key));
    fs.writeFileSync(localPath, await getObjectResult.Body.transformToByteArray());
  }

  return tempDir;
};

const uploadPdf = async (userId, pdfBuffer) => {
  const pdfFileName = `generated-${userId}-${Date.now()}.pdf`;
  const pdfKey = `generatedPdfs/${userId}/${pdfFileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pdfKey,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    })
  );

  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: pdfKey });
  const signedUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 900 }); // 15 minutes
  return signedUrl;
};

const removeTemplate = async (bucketPath) => {
  const listObjectsResult = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: bucketPath,
    })
  );
  if (!listObjectsResult.Contents || listObjectsResult.Contents.length === 0) return;

  const removePromises = listObjectsResult.Contents.map((object) => {
    return s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: object.Key,
      })
    );
  });
  await Promise.all(removePromises);
};

export { unzipAndUpload, downloadTemplate, uploadPdf, removeTemplate };
