import { supabaseServer } from "@/supabase";
import { RECEIPT_MIME_TO_EXTENSION, ReceiptImageMimeType } from "@/types/storage";

const BUCKET_NAME = "receipts";

export async function uploadReceiptImage(
  userId: string,
  fileBuffer: Buffer,
  mimeType: ReceiptImageMimeType
) {
  const extension = RECEIPT_MIME_TO_EXTENSION[mimeType];
  const fileName = `${userId}/${Date.now()}.${extension}`;

  const { error } = await supabaseServer.storage.from(BUCKET_NAME).upload(fileName, fileBuffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw error;

  const { data, error: signedError } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .createSignedUrl(fileName, 60);

  if (signedError) throw signedError;

  return {
    path: fileName,
    signedUrl: data.signedUrl,
  };
}
