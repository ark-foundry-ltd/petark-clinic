// hooks/use-has-permission.ts
import { useAuthStore } from "@/store/useStore";

export function useHasPermission(permission: string): boolean {
    const permissions = useAuthStore((s) => s.permissions);
    return permissions.includes("all_permissions") || permissions.includes(permission);
}