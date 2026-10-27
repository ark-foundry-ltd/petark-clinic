import { useAuthStore } from "@/store/useStore";

/** Clinic owner -> /dashboard, every staff role (vet, etc.) -> /staff-dashboard */
export function useRecordsBasePath() {
    const role = useAuthStore((s) => s.role);
    return role === "clinic"
        ? "/dashboard/clinical/records"
        : "/staff-dashboard/clinical/records";
}