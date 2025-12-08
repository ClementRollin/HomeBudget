"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

type LoginValues = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    const response = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl,
    });

    if (response?.error) {
      setErrorMessage("Identifiants incorrects.");
      return;
    }

    router.push(response?.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email", { required: true })}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-slate-300">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          {...register("password", { required: true })}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />
      </div>
      {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent py-3 text-center text-sm font-semibold uppercase tracking-widest text-slate-900 disabled:opacity-50"
      >
        Se connecter
      </button>
    </form>
  );
};

export default LoginForm;
