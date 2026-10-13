import { useCallback, useEffect, useState } from "react";
import { api } from "../../shared/api/client";
export interface Practitioner {
  id: string;
  displayName: string;
  specialty: string;
  categoryId: string;
  categoryLabel: string;
  city: string;
  address: string;
  phone: string;
  sourceUrl: string | null;
  photoUrl: string | null;
  accountId: string | null;
  sourceCheckedAt?: string;
}
export interface PractitionerCategory {
  id: string;
  label: string;
  count: number;
}
export function usePractitioners() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [categories, setCategories] = useState<PractitionerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{
        practitioners: Practitioner[];
        categories: PractitionerCategory[];
      }>("/practitioners");
      setPractitioners(data.practitioners);
      setCategories(data.categories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت اطلاعات پزشکان انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { practitioners, categories, loading, error, reload: load };
}
export const normalizeSearch = (text: string) =>
  text
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, " ")
    .trim()
    .toLowerCase();
