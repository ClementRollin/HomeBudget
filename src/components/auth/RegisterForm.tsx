"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const baseFields = {
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
};

const registerSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    ...baseFields,
    familyName: z.string().min(2, "Nom de famille requis"),
    inviteCode: z.string().optional(),
  }),
  z.object({
    mode: z.literal("join"),
    ...baseFields,
    familyName: z.string().optional(),
    inviteCode: z.string().min(4, "Code famille requis"),
  }),
]);

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    clearErrors,
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      mode: "create",
      name: "",
      email: "",
      password: "",
      familyName: "",
      inviteCode: "",
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const mode = watch("mode");

  const handleModeChange = (nextMode: RegisterValues["mode"]) => {
    if (nextMode === mode) return;
    setValue("mode", nextMode);
    setServerMessage(null);
    if (nextMode === "create") {
      setValue("inviteCode", "");
    } else {
      setValue("familyName", "");
    }
    clearErrors(["familyName", "inviteCode"]);
  };

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

    const payload = await response.json();
    setServerMessage(
      payload?.familyInviteCode
        ? `Famille créée. Partagez le code ${payload.familyInviteCode} pour inviter vos proches.`
        : "Compte créé. Connexion en cours...",
    );

    const authResponse = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (authResponse?.error) {
      setServerMessage("Compte créé mais la connexion a échoué. Essayez de vous connecter.");
      return;
    }

    reset();
    router.push(authResponse?.url ?? "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("mode")} />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("create")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "create" ? "bg-accent text-slate-900" : "bg-black/20 text-slate-300"
            }`}
          >
            Créer une famille
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("join")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "join" ? "bg-accent text-slate-900" : "bg-black/20 text-slate-300"
            }`}
          >
            Rejoindre avec un code
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-300">
          {mode === "create"
            ? "Choisissez un nom pour votre foyer. Un code d'invitation sera généré automatiquement."
            : "Saisissez le code transmis par votre partenaire pour rejoindre son espace."}
        </p>
      </div>
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
        {mode === "create" ? (
          <div>
            <label className="text-sm text-slate-300">Nom de la famille</label>
            <input
              type="text"
              {...register("familyName")}
              placeholder="Ex. Famille Dupont"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            />
            {errors.familyName && (
              <p className="text-xs text-rose-400">{errors.familyName.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="text-sm text-slate-300">Code famille</label>
            <input
              type="text"
              {...register("inviteCode")}
              placeholder="XXXXXX"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            />
            {errors.inviteCode && (
              <p className="text-xs text-rose-400">{errors.inviteCode.message}</p>
            )}
          </div>
        )}
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
      {mode === "create" ? null : (
        <div className="rounded-2xl border border-dashed border-white/10 p-4 text-xs text-slate-400">
          Vous n&apos;avez pas encore de famille ? Repassez dans l&apos;onglet &quot;Créer une famille&quot;.
        </div>
      )}
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
