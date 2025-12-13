"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const accountFormSchema = z
  .object({
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    currentPassword: z.string().min(6, "Mot de passe actuel invalide").optional(),
    newPassword: z.string().min(6, "Nouveau mot de passe trop court").optional(),
  })
  .refine(
    (values) => {
      if (values.newPassword) {
        return Boolean(values.currentPassword);
      }
      return true;
    },
    { path: ["currentPassword"], message: "Mot de passe actuel requis" },
  );

export type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  initialName: string;
  initialEmail: string;
}

const AccountForm = ({ initialName, initialEmail }: AccountFormProps) => {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialName,
      email: initialEmail,
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (values: AccountFormValues) => {
    setFeedback(null);

    const payload: Record<string, unknown> = {
      name: values.name,
      email: values.email,
    };

    if (values.newPassword) {
      payload.currentPassword = values.currentPassword;
      payload.newPassword = values.newPassword;
    }

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      setFeedback({ type: "error", message: error?.message ?? "Impossible de mettre a jour le compte." });
      return;
    }

    const result = await response.json().catch(() => null);
    setFeedback({ type: "success", message: result?.message ?? "Profil mis a jour." });
    form.reset({
      name: values.name,
      email: values.email,
      currentPassword: "",
      newPassword: "",
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400" htmlFor="name">
            Nom complet
          </label>
          <input
            id="name"
            {...register("name")}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
            placeholder="Votre nom"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-400" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
            placeholder="vous@email.com"
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
        </div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-white">Modifier le mot de passe</p>
        <p className="text-xs text-slate-400">Remplissez les deux champs pour enregistrer un nouveau mot de passe.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400" htmlFor="currentPassword">
              Mot de passe actuel
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
              placeholder="********"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-rose-400">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-400" htmlFor="newPassword">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-accent focus:outline-none"
              placeholder="********"
            />
            {errors.newPassword && <p className="mt-1 text-xs text-rose-400">{errors.newPassword.message}</p>}
          </div>
        </div>
      </div>
      {feedback ? (
        <p className={`text-sm ${feedback.type === "success" ? "text-emerald-300" : "text-rose-400"}`}>
          {feedback.message}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-teal-300 disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Mettre a jour"}
        </button>
        <p className="text-xs text-slate-500">Les modifications sont immediates sur votre compte.</p>
      </div>
    </form>
  );
};

export default AccountForm;
