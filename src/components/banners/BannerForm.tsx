"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { CheckCircle2, XCircle } from "lucide-react";

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

import { createBannerAction } from "@/app/(dashboard)/banners/novo/actions";
import { updateBannerAction } from "@/app/(dashboard)/banners/actions";
import AssetUploadField from "@/components/apps/AssetUploadField";

import {
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
  BANNER_ACTION_TYPES,
  BANNER_ACTION_TYPE_LABELS,
  type BannerActionType,
} from "@/lib/banner-constants";

import type { Banner, BannerActionState } from "@/services/banner.service";
import type { App } from "@/services/app.service";
import type { AssetStat } from "@/lib/storage/types";

const INITIAL_STATE: BannerActionState = {};

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Salvando..."
        : editing
          ? "Salvar Alterações"
          : "Salvar Banner"}
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
  banner?: Banner;
  apps: App[];
  imageStat?: AssetStat | null;
  imageUrl?: string | null;
}

export default function BannerForm({
  banner,
  apps,
  imageStat,
  imageUrl,
}: Props) {
  const router = useRouter();

  const editing = Boolean(banner);
  const action = banner ? updateBannerAction.bind(null, banner.id) : createBannerAction;
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const fieldErrors = state.fieldErrors ?? {};

  const [actionType, setActionType] = useState<BannerActionType>(
    banner?.action_type ?? "none"
  );
  const [actionTarget, setActionTarget] = useState(banner?.action_target ?? "");

  function handleActionTypeChange(value: BannerActionType) {
    setActionType(value);
    setActionTarget("");
  }

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
                Título
              </Label>

              <Input
                name="title"
                required
                defaultValue={banner?.title}
                placeholder="Nova versão disponível"
                className={fieldErrors.title ? "border-destructive" : undefined}
              />

              <FieldError message={fieldErrors.title} />
            </div>

            <div>
              <Label className="mb-2">
                Categoria
              </Label>

              <Select
                name="category"
                defaultValue={banner?.category}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>

                <SelectContent>
                  {BANNER_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {BANNER_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError message={fieldErrors.category} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <Label className="mb-2">
                Ação
              </Label>

              <Select
                name="action_type"
                value={actionType}
                onValueChange={(value) => handleActionTypeChange(value as BannerActionType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {BANNER_ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {BANNER_ACTION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">
                Status
              </Label>

              <Select
                name="is_active"
                defaultValue={banner ? String(banner.is_active) : "true"}
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

          {actionType !== "none" && (
            <div className="mt-8">
              <Label className="mb-2">
                {actionType === "app" ? "Aplicativo" : "URL"}
              </Label>

              {actionType === "app" ? (
                <Select
                  name="action_target"
                  value={actionTarget}
                  onValueChange={setActionTarget}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um aplicativo" />
                  </SelectTrigger>

                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.slug}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name="action_target"
                  type="url"
                  value={actionTarget}
                  onChange={(e) => setActionTarget(e.target.value)}
                  placeholder="https://..."
                  className={fieldErrors.action_target ? "border-destructive" : undefined}
                />
              )}

              <FieldError message={fieldErrors.action_target} />
            </div>
          )}

          <div className="mt-8">
            <Label className="mb-2">
              Subtítulo
            </Label>

            <Textarea
              name="subtitle"
              rows={3}
              defaultValue={banner?.subtitle}
              placeholder="Atualize agora o UniTV Mobile."
            />
          </div>

          <div className="flex justify-end gap-3 mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/banners")}
            >
              Cancelar
            </Button>

            <SubmitButton editing={editing} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Imagem
        </h2>

        {banner ? (
          <AssetUploadField
            uploadUrl={`/api/banners/${banner.id}/upload`}
            formFieldType="image"
            label="Imagem"
            accept="image/*"
            acceptCaption="PNG, JPG, WEBP"
            previewAspect="video"
            current={toCurrentAsset(imageStat)}
            previewUrl={imageUrl}
          />
        ) : (
          <Card className="border-dashed" size="sm">
            <CardContent className="text-sm text-muted-foreground">
              Salve o banner para habilitar o envio da imagem.
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
