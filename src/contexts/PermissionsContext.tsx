import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthContext";
import type { Database } from "@/lib/supabase/types";

export type AppModule = Database["public"]["Enums"]["app_module"];

type Permission = { module: AppModule; can_write: boolean };

type PermissionsContextValue = {
  can: (module: AppModule, level: "read" | "write") => boolean;
  loading: boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["user-permissions", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("roles!role_id(role_permissions(module, can_write))")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data?.roles as any)?.role_permissions ?? []) as Permission[];
    },
  });

  const can = useMemo(
    () =>
      (module: AppModule, level: "read" | "write"): boolean => {
        if (isLoading) return false;
        const perm = permissions.find((p) => p.module === module);
        if (!perm) return false;
        return level === "read" ? true : perm.can_write;
      },
    [permissions, isLoading],
  );

  return (
    <PermissionsContext.Provider value={{ can, loading: isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used inside PermissionsProvider");
  return ctx;
}
