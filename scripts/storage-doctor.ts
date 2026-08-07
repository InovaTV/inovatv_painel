// Diagnóstico de conectividade do Storage Provider — ver STORAGE.md.
// Uso: npm run storage:test
//
// Conecta, cria um diretório de teste, envia um arquivo pequeno, confirma
// existência, monta a URL pública e limpa tudo em seguida. Não deixa lixo
// no servidor mesmo se algum passo falhar no meio.

import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

const TEST_PATH = "__storage-doctor__/ping.txt";

function step(ok: boolean, label: string) {
  console.log(`${ok ? "✔" : "✘"} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  // Import dinâmico DEPOIS de loadEnvConfig: um `import` estático seria
  // hoisted e avaliaria remote-storage.ts (que lê process.env no topo do
  // módulo) antes do env carregar. Usa o mesmo carregador do Next (não
  // `node --env-file`) porque o Next expande `$VAR` dentro de .env* — um
  // `$` literal em STORAGE_PASSWORD precisa estar escapado (`\$`) e só
  // esse loader entende o escape do jeito que o app em runtime entende.
  loadEnvConfig(process.cwd());
  const { storage } = await import("../src/lib/storage/provider.ts");

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
    await storage.replace({
      path: TEST_PATH,
      data: Buffer.from(`storage-doctor replace ${new Date().toISOString()}`),
    });
    const stillFound = await storage.exists(TEST_PATH);
    step(stillFound, "replace() — envia temp, valida tamanho, renomeia por cima");
  } catch (error) {
    step(false, `replace() — ${error}`);
  }

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
