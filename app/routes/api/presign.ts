import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { Route } from "./+types/presign";

const BUCKET_NAME = "ai-captions";

function creates3Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 environment variables. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();

    const actionType = formData.get("action") as string;

    if (actionType === "download") {
      const key = formData.get("key") as string;
      console.log("Received download request for key:", key);

      if (!key) {
        return new Response(JSON.stringify({ error: "Missing file key" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const s3Client=creates3Client()

      const presignedUrl=await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket:BUCKET_NAME,
        Key:key
      }),{expiresIn : 120})

       const result={
        presignedUrl,
        key
        }
        console.log('Successfully generated download presigned URL');
        return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
        });

    }else{
        const fileName = formData.get('fileName') as string;
        const fileType = formData.get('fileType') as string;
         console.log('Received upload request:', { fileName, fileType });
        if (!fileName || !fileType) {
            return new Response(
            JSON.stringify({ error: 'Missing file information' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
            );
        }
        const s3Client = creates3Client();

        const timestamp = Date.now();

        const key = `videos/${timestamp}-${fileName}`;

        console.log('Generating presigned URL for key:', key);

        const presignedUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: fileType,
        }),
        { expiresIn: 60 } // 1 minute
      );
      const result = {
        presignedUrl,
        key,
        uploadUrl: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`,
      };
        console.log('Successfully generated presigned URL');

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });

    }
   
  } catch (error) {
    console.error('Action error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Failed to generate presigned URL',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
