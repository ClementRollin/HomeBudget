"use client";

import { Children, type ReactNode } from "react";

interface DynamicFieldSectionProps {
  title: string;
  description: string;
  emptyCta: string;
  children: ReactNode;
  onAdd: () => void;
}

export const DynamicFieldSection = ({
  title,
  description,
  emptyCta,
  children,
  onAdd,
}: DynamicFieldSectionProps) => {
  const isEmpty = Children.count(children) === 0;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-2xl border border-dashed border-white/10 px-4 py-2 text-sm text-slate-300"
      >
        {isEmpty ? emptyCta : "Ajouter un élément"}
      </button>
    </section>
  );
};
