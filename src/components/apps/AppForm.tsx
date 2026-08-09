"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { CheckCircle2, MonitorSmartphone, Tv, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createAppAction } from "@/app/(dashboard)/apps/novo/actions";
import { updateAppAction } from "@/app/(dashboard)/apps/actions";
import AssetUploadField from "./AssetUploadField";

import { slugify } from "@/lib/utils";

import type { App, AppActionState } from "@/services/app.service";
import type { Product } from "@/services/product.service";
import type { AssetStat } from "@/lib/storage/types";

const NEW_PRODUCT_VALUE = "__new__";

const INITIAL_STATE: AppActionState = {};

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs text-destructive">
      {message}
    </p>
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
  iconUrl?: string | null;
  bannerUrl?: string | null;
}

export default function AppForm({
  app,
  products,
  apkStat,
  iconStat,
  bannerStat,
  iconUrl,
  bannerUrl,
}: Props) {
  const router = useRouter();

  const editing = Boolean(app);
  const action = app ? updateAppAction.bind(null, app.id) : createAppAction;
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const fieldErrors = state.fieldErrors ?? {};

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
      action={formAction}
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
    >
      <Card>
        <CardContent>
          {state.error && (
            <p className="mb-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="mb-2">
                Nome
              </Label>

              <Input
                name="name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="UniTV Mobile"
                className={fieldErrors.name ? "border-destructive" : undefined}
              />

              <FieldError message={fieldErrors.name} />
            </div>

            <div>
              <Label className="mb-2">
                Slug
              </Label>

              <Input
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="unitv-mobile"
                className={fieldErrors.slug ? "border-destructive" : undefined}
              />

              <FieldError message={fieldErrors.slug} />
            </div>

            <div>
              <Label className="mb-2">
                Produto
              </Label>

              <Select
                name="product_id"
                value={productId}
                onValueChange={setProductId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}

                  <SelectItem value={NEW_PRODUCT_VALUE}>
                    + Novo Produto
                  </SelectItem>
                </SelectContent>
              </Select>

              {productId === NEW_PRODUCT_VALUE && (
                <>
                  <Input
                    name="new_product_name"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Nome do novo produto"
                    className={`mt-2 ${fieldErrors.new_product_name ? "border-destructive" : ""}`}
                  />

                  <FieldError message={fieldErrors.new_product_name} />
                </>
              )}
            </div>

            <div>
              <Label className="mb-2">
                Versão
              </Label>

              <Input
                name="version"
                required
                defaultValue={app?.version}
                placeholder="3.24.2"
                className={fieldErrors.version ? "border-destructive" : undefined}
              />

              <FieldError message={fieldErrors.version} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <Label className="mb-2">
                Plataforma
              </Label>

              <Select
                name="platform"
                defaultValue={app?.platform ?? "mobile"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="mobile">
                    <MonitorSmartphone className="size-4" />
                    Mobile
                  </SelectItem>

                  <SelectItem value="tv">
                    <Tv className="size-4" />
                    TV Box
                  </SelectItem>
                </SelectContent>
              </Select>

              <FieldError message={fieldErrors.platform} />
            </div>

            <div>
              <Label className="mb-2">
                Status
              </Label>

              <Select
                name="is_active"
                defaultValue={app ? String(app.is_active) : "true"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="true">
                    <CheckCircle2 className="size-4" />
                    Ativo
                  </SelectItem>

                  <SelectItem value="false">
                    <XCircle className="size-4" />
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8">
            <Label className="mb-2">
              Descrição
            </Label>

            <Textarea
              name="description"
              rows={5}
              defaultValue={app?.description}
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
        </CardContent>
      </Card>

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
              previewUrl={iconUrl}
            />

            <AssetUploadField
              appId={app.id}
              type="banner"
              label="Banner"
              accept="image/*"
              current={toCurrentAsset(bannerStat)}
              previewUrl={bannerUrl}
            />
          </>
        ) : (
          <Card className="border-dashed" size="sm">
            <CardContent className="text-sm text-muted-foreground">
              Salve o aplicativo para habilitar o envio de arquivos.
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
