import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export const useSearchParameterFilter = <T extends Record<string, unknown>>(
  defaultValues: T,
  debounceMs: number = 500,
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const defaultValuesRef = useRef(defaultValues);

  const [filters, setFilters] = useState<T>(() => {
    const initialState = { ...defaultValues };
    Object.keys(defaultValues).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        const defaultValue = defaultValues[key];
        if (typeof defaultValue === "boolean") {
          initialState[key as keyof T] = (urlValue === "true") as T[keyof T];
        } else if (typeof defaultValue === "number") {
          initialState[key as keyof T] = Number(urlValue) as T[keyof T];
        } else {
          initialState[key as keyof T] = urlValue as T[keyof T];
        }
      }
    });
    return initialState;
  });

  const updateFilter = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultValuesRef.current);
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        const defaultValue = defaultValuesRef.current[key];

        if (
          value !== defaultValue &&
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      const newQueryString = params.toString();
      const currentQueryString = searchParams.toString();

      if (newQueryString !== currentQueryString) {
        router.replace(`${pathname}?${newQueryString}`, { scroll: false });
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filters, pathname, router, searchParams, debounceMs]);

  return { filters, updateFilter, resetFilters };
};
