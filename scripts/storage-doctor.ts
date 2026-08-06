// Diagnóstico de conectividade do Storage Provider — ver STORAGE.md.
// Uso: npm run storage:test
//
// Conecta, cria um diretório de teste, envia um arquivo pequeno, confirma
// existência, monta a URL pública e limpa tudo em seguida. Não deixa lixo
// no servidor mesmo se algum passo falhar no meio.

import { storage } from "../src/lib/storage/provider.ts";

const TEST_PATH = "__storage-doctor__/ping.txt";

function step(ok: boolean, label: string) {
  console.log(`${ok ? "✔" : "✘"} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  console.log(`Provider: ${process.env.STORAGE_PROVIDER ?? "hostinger"}\n`);

  try {
    await storage.upload({
      path: TEST_PATH,
      data: Buffer.from(`storage-doctor ${new Date().toISOString()}`),
    });
    step(true, "conecta + envia arquivo");
  } catch (error) {
    step(false, `conecta + envia arquivo — ${error}`);
    return;
  }

  try {
    const found = await storage.exists(TEST_PATH);
    step(found, "verifica existência");
  } catch (error) {
    step(false, `verifica existência — ${error}`);
  }

  const url = storage.getPublicUrl(TEST_PATH);
  step(Boolean(url), `monta URL pública — ${url}`);

  try {
    await storage.delete(TEST_PATH);
    step(true, "remove arquivo de teste");
  } catch (error) {
    step(false, `remove arquivo de teste — ${error}`);
    return;
  }

  try {
    const stillThere = await storage.exists(TEST_PATH);
    step(!stillThere, "confirma remoção");
  } catch (error) {
    step(false, `confirma remoção — ${error}`);
  }
}

main();
