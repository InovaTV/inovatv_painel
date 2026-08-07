import { Readable } from "node:stream";

import SftpClient from "ssh2-sftp-client";
import { Client as FtpClient } from "basic-ftp";

import type { AssetStat, StorageProvider, UploadInput } from "./types.ts";

const HOST = process.env.STORAGE_HOST!;
const USER = process.env.STORAGE_USER!;
const PASSWORD = process.env.STORAGE_PASSWORD!;
const ROOT_PATH = (process.env.STORAGE_ROOT_PATH ?? "").replace(/\/+$/, "");
const PUBLIC_BASE_URL = (process.env.STORAGE_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
// STORAGE_PORT é um fallback genérico — usado quando só existe uma porta
// configurada (comum em hospedagem compartilhada) em vez de uma por protocolo.
const GENERIC_PORT = process.env.STORAGE_PORT;
const SFTP_PORT = Number(process.env.STORAGE_SFTP_PORT ?? GENERIC_PORT ?? 22);
const FTP_PORT = Number(process.env.STORAGE_FTP_PORT ?? GENERIC_PORT ?? 21);
const FORCED_PROTOCOL = process.env.STORAGE_PROTOCOL as "sftp" | "ftp" | undefined;
const FORCED_FTP_SECURE =
  process.env.STORAGE_FTP_SECURE === undefined
    ? undefined
    : process.env.STORAGE_FTP_SECURE === "true";

// Hospedagem compartilhada atrás de load balancer costuma responder ao PASV
// com um host diferente da conexão de controle. Por padrão o basic-ftp
// ignora esse host "por segurança" (proteção contra bounce attack) e força
// o host da conexão de controle — que aqui não é alcançável, travando a
// conexão de dados até estourar "Timeout (control socket)". Confiável nesse
// caso porque o host é conhecido (STORAGE_HOST, não input de terceiros).
// Timeout também aumentado: os 30s padrão são curtos para um APK real.
// Medido: 20MB reais levaram ~28s nesse servidor (~0,7MB/s) — no mesmo
// ritmo, 300MB (teto decidido para APK) levaria ~7min. 20min dá margem.
const FTP_TIMEOUT_MS = 20 * 60 * 1000;

function createFtpClient() {
  return new FtpClient(FTP_TIMEOUT_MS, { allowSeparateTransferHost: true });
}

type Protocol = "sftp" | "ftp";

// Detectado uma vez por processo e reutilizado — evita reconectar via SFTP a
// cada chamada só para descobrir que precisa cair para FTP. Preferência
// SFTP > FTP decidida pelo usuário (2026-08-06, ver STORAGE.md).
let cachedProtocol: Protocol | null = null;

// Mesma lógica de detecção, um nível abaixo: dentro do fallback FTP, prefere
// FTPS (FTP explícito com TLS) e só cai para FTP puro se o servidor recusar.
let cachedFtpSecure: boolean | null = null;

async function resolveFtpSecure(): Promise<boolean> {
  if (FORCED_FTP_SECURE !== undefined) return FORCED_FTP_SECURE;
  if (cachedFtpSecure !== null) return cachedFtpSecure;

  const probe = createFtpClient();

  try {
    await probe.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: true });
    probe.close();
    cachedFtpSecure = true;
  } catch {
    cachedFtpSecure = false;
  }

  return cachedFtpSecure;
}

function remotePath(path: string) {
  const clean = path.replace(/^\/+/, "");
  return ROOT_PATH ? `${ROOT_PATH}/${clean}` : clean;
}

function splitDirAndFile(path: string) {
  const idx = path.lastIndexOf("/");
  return idx === -1
    ? { dir: "", file: path }
    : { dir: path.slice(0, idx), file: path.slice(idx + 1) };
}

async function resolveProtocol(): Promise<Protocol> {
  if (FORCED_PROTOCOL) return FORCED_PROTOCOL;
  if (cachedProtocol) return cachedProtocol;

  const sftp = new SftpClient();

  try {
    await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });
    await sftp.end();
    cachedProtocol = "sftp";
  } catch {
    cachedProtocol = "ftp";
  }

  return cachedProtocol;
}

async function uploadViaSftp(input: UploadInput) {
  const sftp = new SftpClient();
  const full = remotePath(input.path);
  const { dir } = splitDirAndFile(full);

  await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });

  try {
    if (dir) {
      await sftp.mkdir(dir, true);
    }
    await sftp.put(input.data, full);
  } finally {
    await sftp.end();
  }
}

async function uploadViaFtp(input: UploadInput) {
  const client = createFtpClient();
  const full = remotePath(input.path);
  const { dir, file } = splitDirAndFile(full);

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });

  try {
    if (dir) {
      await client.ensureDir(dir);
    }
    if (input.onProgress) {
      client.trackProgress((info) => input.onProgress!(info.bytes));
    }
    await client.uploadFrom(Readable.from(input.data), file);
  } finally {
    client.trackProgress();
    client.close();
  }
}

async function deleteViaSftp(path: string) {
  const sftp = new SftpClient();

  await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });

  try {
    await sftp.delete(remotePath(path));
  } finally {
    await sftp.end();
  }
}

async function deleteViaFtp(path: string) {
  const client = createFtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });

  try {
    await client.remove(remotePath(path));
  } finally {
    client.close();
  }
}

async function existsViaSftp(path: string) {
  const sftp = new SftpClient();

  await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });

  try {
    const result = await sftp.exists(remotePath(path));
    return result !== false;
  } finally {
    await sftp.end();
  }
}

async function existsViaFtp(path: string) {
  const client = createFtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });

  try {
    await client.size(remotePath(path));
    return true;
  } catch {
    return false;
  } finally {
    client.close();
  }
}

async function sizeViaSftp(path: string) {
  const sftp = new SftpClient();

  await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });

  try {
    const stat = await sftp.stat(remotePath(path));
    return stat.size;
  } finally {
    await sftp.end();
  }
}

async function sizeViaFtp(path: string) {
  const client = createFtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });

  try {
    return await client.size(remotePath(path));
  } finally {
    client.close();
  }
}

async function statViaSftp(path: string): Promise<AssetStat | null> {
  const sftp = new SftpClient();

  try {
    await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });
    const info = await sftp.stat(remotePath(path));
    return { size: info.size, modifiedAt: new Date(info.modifyTime) };
  } catch {
    return null;
  } finally {
    await sftp.end();
  }
}

async function statViaFtp(path: string): Promise<AssetStat | null> {
  const client = createFtpClient();

  try {
    await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });
    const full = remotePath(path);
    const size = await client.size(full);
    const modifiedAt = await client.lastMod(full);
    return { size, modifiedAt };
  } catch {
    return null;
  } finally {
    client.close();
  }
}

async function renameViaSftp(from: string, to: string) {
  const sftp = new SftpClient();

  await sftp.connect({ host: HOST, port: SFTP_PORT, username: USER, password: PASSWORD });

  try {
    await sftp.rename(remotePath(from), remotePath(to));
  } finally {
    await sftp.end();
  }
}

async function renameViaFtp(from: string, to: string) {
  const client = createFtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: await resolveFtpSecure() });

  try {
    await client.rename(remotePath(from), remotePath(to));
  } finally {
    client.close();
  }
}

async function deleteQuiet(path: string, protocol: Protocol) {
  try {
    if (protocol === "sftp") {
      await deleteViaSftp(path);
    } else {
      await deleteViaFtp(path);
    }
  } catch {
    // limpeza de melhor esforço — não mascarar o erro original com uma
    // falha secundária ao tentar apagar o temporário.
  }
}

export function createRemoteStorageProvider(): StorageProvider {
  const provider: StorageProvider = {
    async upload(input) {
      const protocol = await resolveProtocol();

      if (protocol === "sftp") {
        await uploadViaSftp(input);
      } else {
        await uploadViaFtp(input);
      }

      return { path: input.path, url: provider.getPublicUrl(input.path) };
    },

    async replace(input) {
      const protocol = await resolveProtocol();
      const tempPath = `${input.path}.uploading`;
      const tempInput: UploadInput = { ...input, path: tempPath };

      if (protocol === "sftp") {
        await uploadViaSftp(tempInput);
      } else {
        await uploadViaFtp(tempInput);
      }

      const uploadedSize = await (protocol === "sftp" ? sizeViaSftp(tempPath) : sizeViaFtp(tempPath));

      if (uploadedSize !== input.data.length) {
        await deleteQuiet(tempPath, protocol);
        throw new Error(
          `Upload incompleto para "${input.path}": esperado ${input.data.length} bytes, servidor tem ${uploadedSize}.`
        );
      }

      try {
        if (protocol === "sftp") {
          await renameViaSftp(tempPath, input.path);
        } else {
          await renameViaFtp(tempPath, input.path);
        }
      } catch (error) {
        await deleteQuiet(tempPath, protocol);
        throw error;
      }

      return { path: input.path, url: provider.getPublicUrl(input.path) };
    },

    async delete(path) {
      const protocol = await resolveProtocol();

      if (protocol === "sftp") {
        await deleteViaSftp(path);
      } else {
        await deleteViaFtp(path);
      }
    },

    async exists(path) {
      const protocol = await resolveProtocol();

      return protocol === "sftp" ? existsViaSftp(path) : existsViaFtp(path);
    },

    async stat(path) {
      const protocol = await resolveProtocol();

      return protocol === "sftp" ? statViaSftp(path) : statViaFtp(path);
    },

    getPublicUrl(path) {
      return `${PUBLIC_BASE_URL}/${path.replace(/^\/+/, "")}`;
    },
  };

  return provider;
}
