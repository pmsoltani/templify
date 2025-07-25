import { S3Client } from "@aws-sdk/client-s3";

const BUCKETS = {
  hub: process.env.STORAGE_BUCKET_HUB,
  pdfs: process.env.STORAGE_BUCKET_PDFS,
  previews: process.env.STORAGE_BUCKET_PREVIEWS,
  templates: process.env.STORAGE_BUCKET_TEMPLATES,
};

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  },
});

export { BUCKETS, s3Client };
