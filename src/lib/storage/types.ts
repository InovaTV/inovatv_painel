export interface UploadInput {
  path: string;
  data: Buffer;
  contentType?: string;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<{ path: string; url: string }>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getPublicUrl(path: string): string;
}
