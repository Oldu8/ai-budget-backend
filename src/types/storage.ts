export const RECEIPT_MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ReceiptImageMimeType = keyof typeof RECEIPT_MIME_TO_EXTENSION;
export type ReceiptImageExtension = (typeof RECEIPT_MIME_TO_EXTENSION)[ReceiptImageMimeType];
