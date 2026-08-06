"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createAppAction } from "@/app/(dashboard)/apps/novo/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar Aplicativo"}
    </Button>
  );
}

export default function AppForm() {
  const router = useRouter();

  return (
    <form
      action={createAppAction}
      className="max-w-4xl rounded-xl border bg-white p-8"
    >
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nome
          </label>

          <Input
            name="name"
            required
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
            placeholder="unitv-mobile"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Versão
          </label>

          <Input
            name="version"
            required
            placeholder="3.24.2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Ordem
          </label>

          <Input
            name="display_order"
            type="number"
            min={1}
            defaultValue={1}
            required
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
            defaultValue="mobile"
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
            defaultValue="true"
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
          className="w-full rounded-md border p-3"
          placeholder="Descrição..."
        />
      </div>

      <hr className="my-8" />

      <h2 className="text-lg font-semibold mb-5">
        Arquivos
      </h2>

      <p className="text-sm text-muted-foreground mb-5">
        Upload de APK, ícone e banner será habilitado na próxima etapa
        (Supabase Storage).
      </p>

      <div className="grid grid-cols-3 gap-6">
        <Input type="file" disabled />
        <Input type="file" disabled />
        <Input type="file" disabled />
      </div>

      <div className="flex justify-end gap-3 mt-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/apps")}
        >
          Cancelar
        </Button>

        <SubmitButton />
      </div>
    </form>
  );
}
