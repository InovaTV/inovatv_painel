export interface UploadInput {
  path: string;
  data: Buffer;
  contentType?: string;
  /** Bytes já enviados ao servidor remoto — chamado periodicamente durante a transferência (só FTP; SFTP não reporta progresso). */
  onProgress?: (sentBytes: number) => void;
}

export interface AssetStat {
  size: number;
  modifiedAt: Date;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<{ path: string; url: string }>;
  /**
   * Como upload(), mas seguro para sobrescrever um arquivo existente no
   * mesmo `path`: envia para um caminho temporário, confirma o tamanho e só
   * então renomeia por cima do destino final. Se cair no meio do envio, o
   * arquivo antigo em `path` continua intacto. Usar para qualquer upload
   * que possa estar substituindo um arquivo já publicado (APK, ícone,
   * banner) — `upload()` fica só para o primeiro envio de um path novo.
   */
  replace(input: UploadInput): Promise<{ path: string; url: string }>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  /** null se o arquivo não existe — não lança erro para esse caso. */
  stat(path: string): Promise<AssetStat | null>;
  getPublicUrl(path: string): string;
}
