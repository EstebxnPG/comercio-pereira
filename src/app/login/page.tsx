import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signInAction } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Iniciar sesion",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "El correo o la contrasena no son validos.",
  missing_credentials: "Ingresa correo y contrasena.",
  supabase_not_configured: "Supabase Auth no esta configurado.",
};

export default async function LoginPage(props: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/admin/postulaciones");
  }

  const searchParams = await props.searchParams;
  const error = getSingleParam(searchParams.error);
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 py-12 text-[#22211f]">
      <form
        action={signInAction}
        className="grid w-full max-w-sm gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div>
          <p className="text-sm font-black uppercase text-[#B3262E]">
            Acceso privado
          </p>
          <h1 className="mt-2 text-2xl font-black">Iniciar sesion</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
            Usa una cuenta autorizada para administrar Compra en Pereira.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-xl bg-[#ffdad8] px-3 py-2 text-sm font-bold text-[#410006]">
            {errorMessage}
          </p>
        ) : null}

        <label className="grid gap-2 text-sm font-black text-stone-800">
          Correo
          <input
            autoComplete="email"
            className="md-field"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-stone-800">
          Contrasena
          <input
            autoComplete="current-password"
            className="md-field"
            name="password"
            required
            type="password"
          />
        </label>
        <button className="md-filled-button px-4" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
