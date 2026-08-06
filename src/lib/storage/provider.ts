import { createRemoteStorageProvider } from "./remote-storage";

import type { StorageProvider } from "./types";

const PROVIDER = process.env.STORAGE_PROVIDER ?? "hostinger";

function resolveProvider(): StorageProvider {
  switch (PROVIDER) {
    case "hostinger":
      return createRemoteStorageProvider();
    default:
      throw new Error(`STORAGE_PROVIDER desconhecido: "${PROVIDER}"`);
  }
}

export const storage: StorageProvider = resolveProvider();

export type { StorageProvider, UploadInput } from "./types";
