"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
  familyName: z.string().min(2, "Nom de famille requis"),
  inviteCode: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      familyName: "",
      inviteCode: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerMessage(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setServerMessage(error?.message ?? "Impossible de créer le compte.");
      return;
    }

    reset();
    const payload = await response.json();
    setServerMessage(
      payload?.familyInviteCode
        ? `Famille créée. Partagez le code ${payload.familyInviteCode} pour inviter vos proches.`
        : "Compte créé. Vous pouvez vous connecter.",
    );

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-300">Prénom</label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
          {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-300">Nom de la famille</label>
          <input
            type="text"
            {...register("familyName")}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
          {errors.familyName && (
            <p className="text-xs text-rose-400">{errors.familyName.message}</p>
          )}
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-300">Email</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />
        {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
      </div>
      <div>
        <label className="text-sm text-slate-300">Mot de passe</label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />
        {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
      </div>
      <div>
        <label className="text-sm text-slate-300">Code famille (facultatif)</label>
        <input
          type="text"
          {...register("inviteCode")}
          placeholder="Rejoindre une famille existante"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        />
      </div>
      {serverMessage ? <p className="text-sm text-emerald-300">{serverMessage}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent py-3 text-center text-sm font-semibold uppercase tracking-widest text-slate-900 disabled:opacity-50"
      >
        Créer un compte
      </button>
    </form>
  );
};

export default RegisterForm;
