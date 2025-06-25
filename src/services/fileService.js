import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
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
  const pdfKey = `generated_pdfs/${userId}/${pdfFileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pdfKey,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${pdfKey}`;
};

export { unzipAndUpload, downloadTemplate, uploadPdf };
