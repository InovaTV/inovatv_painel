import { Readable } from "node:stream";

import SftpClient from "ssh2-sftp-client";
import { Client as FtpClient } from "basic-ftp";

import type { StorageProvider, UploadInput } from "./types";

const HOST = process.env.HOSTINGER_HOST!;
const USER = process.env.HOSTINGER_USER!;
const PASSWORD = process.env.HOSTINGER_PASSWORD!;
const ROOT_PATH = (process.env.HOSTINGER_ROOT_PATH ?? "").replace(/\/+$/, "");
const PUBLIC_BASE_URL = (process.env.HOSTINGER_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
const SFTP_PORT = Number(process.env.HOSTINGER_SFTP_PORT ?? 22);
const FTP_PORT = Number(process.env.HOSTINGER_FTP_PORT ?? 21);
const FORCED_PROTOCOL = process.env.HOSTINGER_PROTOCOL as "sftp" | "ftp" | undefined;

type Protocol = "sftp" | "ftp";

// Detectado uma vez por processo e reutilizado — evita reconectar via SFTP a
// cada chamada só para descobrir que precisa cair para FTP. Preferência
// SFTP > FTP decidida pelo usuário (2026-08-06, ver STORAGE.md).
let cachedProtocol: Protocol | null = null;

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
  const client = new FtpClient();
  const full = remotePath(input.path);
  const { dir, file } = splitDirAndFile(full);

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: true });

  try {
    if (dir) {
      await client.ensureDir(dir);
    }
    await client.uploadFrom(Readable.from(input.data), file);
  } finally {
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
  const client = new FtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: true });

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
  const client = new FtpClient();

  await client.access({ host: HOST, port: FTP_PORT, user: USER, password: PASSWORD, secure: true });

  try {
    await client.size(remotePath(path));
    return true;
  } catch {
    return false;
  } finally {
    client.close();
  }
}

export function createHostingerProvider(): StorageProvider {
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

    getPublicUrl(path) {
      return `${PUBLIC_BASE_URL}/${path.replace(/^\/+/, "")}`;
    },
  };

  return provider;
}
