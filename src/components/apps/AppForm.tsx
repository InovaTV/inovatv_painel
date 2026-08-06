"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createAppAction } from "@/app/(dashboard)/apps/novo/actions";
import { updateAppAction } from "@/app/(dashboard)/apps/actions";
import AssetUploadField from "./AssetUploadField";

import { slugify } from "@/lib/utils";

import type { App } from "@/services/app.service";
import type { Product } from "@/services/product.service";
import type { AssetStat } from "@/lib/storage/types";

const NEW_PRODUCT_VALUE = "__new__";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Salvando..."
        : editing
          ? "Salvar Alterações"
          : "Salvar Aplicativo"}
    </Button>
  );
}

function toCurrentAsset(stat?: AssetStat | null) {
  return stat ? { size: stat.size, modifiedAt: stat.modifiedAt.toISOString() } : null;
}

interface Props {
  app?: App;
  products: Product[];
  apkStat?: AssetStat | null;
  iconStat?: AssetStat | null;
  bannerStat?: AssetStat | null;
}

export default function AppForm({ app, products, apkStat, iconStat, bannerStat }: Props) {
  const router = useRouter();

  const editing = Boolean(app);
  const action = app ? updateAppAction.bind(null, app.id) : createAppAction;

  const [name, setName] = useState(app?.name ?? "");
  const [slug, setSlug] = useState(app?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);

  function handleNameChange(value: string) {
    setName(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  const initialProductId =
    products.find((product) => product.asset_folder === app?.asset_folder)?.id ??
    products[0]?.id ??
    NEW_PRODUCT_VALUE;

  const [productId, setProductId] = useState(initialProductId);
  const [newProductName, setNewProductName] = useState("");

  return (
    <form
      action={action}
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
    >
      <div className="rounded-xl border bg-white p-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nome
            </label>

            <Input
              name="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="UniTV Mobile"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Slug
            </label>

            <Input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="unitv-mobile"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Produto
            </label>

            <select
              name="product_id"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}

              <option value={NEW_PRODUCT_VALUE}>
                + Novo Produto
              </option>
            </select>

            {productId === NEW_PRODUCT_VALUE && (
              <Input
                name="new_product_name"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Nome do novo produto"
                className="mt-2"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Versão
            </label>

            <Input
              name="version"
              required
              defaultValue={app?.version}
              placeholder="3.24.2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Plataforma
            </label>

            <select
              name="platform"
              defaultValue={app?.platform ?? "mobile"}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="mobile">
                📱 Mobile
              </option>

              <option value="tv">
                📺 TV Box
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="is_active"
              defaultValue={app ? String(app.is_active) : "true"}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="true">
                🟢 Ativo
              </option>

              <option value="false">
                ⚪ Inativo
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium">
            Descrição
          </label>

          <textarea
            name="description"
            rows={5}
            defaultValue={app?.description}
            className="w-full rounded-md border p-3"
            placeholder="Descrição..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/apps")}
          >
            Cancelar
          </Button>

          <SubmitButton editing={editing} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Arquivos
        </h2>

        {app ? (
          <>
            <AssetUploadField
              appId={app.id}
              type="apk"
              label="APK"
              accept=".apk,application/vnd.android.package-archive"
              current={toCurrentAsset(apkStat)}
            />

            <AssetUploadField
              appId={app.id}
              type="icon"
              label="Ícone"
              accept="image/*"
              current={toCurrentAsset(iconStat)}
            />

            <AssetUploadField
              appId={app.id}
              type="banner"
              label="Banner"
              accept="image/*"
              current={toCurrentAsset(bannerStat)}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Salve o aplicativo para habilitar o envio de arquivos.
          </div>
        )}
      </div>
    </form>
  );
}
