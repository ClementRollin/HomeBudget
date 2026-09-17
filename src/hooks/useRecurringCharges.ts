"use client";

import { useEffect, useState } from "react";
import type { RecurringCharge } from "@/components/budget/RecurringCharges/ChargeRow";

export type { RecurringCharge };

export function useRecurringCharges() {
  const [charges, setCharges] = useState<RecurringCharge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recurring-charges")
      .then((r) => r.json())
      .then((data: RecurringCharge[]) => {
        setCharges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const add = async (
    data: Omit<RecurringCharge, "id" | "isActive" | "memberName">,
  ): Promise<boolean> => {
    const res = await fetch("/api/recurring-charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return false;
    const created: RecurringCharge = await res.json();
    setCharges((prev) => [...prev, created]);
    return true;
  };

  const toggle = async (id: string, isActive: boolean) => {
    setCharges((prev) => prev.map((c) => (c.id === id ? { ...c, isActive } : c)));
    await fetch(`/api/recurring-charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  };

  const remove = async (id: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/recurring-charges/${id}`, { method: "DELETE" });
  };

  const save = async (id: string, data: Partial<RecurringCharge>) => {
    const res = await fetch(`/api/recurring-charges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated: RecurringCharge = await res.json();
    setCharges((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const activeCharges = charges.filter((c) => c.isActive);
  const totalActive = activeCharges.reduce((sum, c) => sum + c.amount, 0);

  return { charges, loading, activeCharges, totalActive, add, toggle, remove, save };
}
