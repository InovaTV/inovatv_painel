import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signInAction } from "@/lib/actions/auth";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">InovaTV Painel</h1>

          <p className="mt-1 text-sm text-slate-500">
            Acesso administrativo
          </p>
        </div>

        <form action={signInAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              E-mail
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@inovatv.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Senha
            </label>

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
