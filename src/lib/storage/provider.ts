import { createHostingerProvider } from "./hostinger";

import type { StorageProvider } from "./types";

export const storage: StorageProvider = createHostingerProvider();

export type { StorageProvider, UploadInput } from "./types";
