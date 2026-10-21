import { get, set, del } from "idb-keyval";

const TEXT_KEY = "petark-clinic-signup";
const FILES_KEY = "petark-clinic-signup-files";
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // drop drafts after 24h (ID documents on a shared phone)

export type DraftText = {
    savedAt: number;
    step: number;
    clinicName: string;
    ownerName: string;
    email: string;
    phoneNumber: string;
    referralCode: string;
    licenseNumber: string;
    address: { street: string; city: string; state: string; zipCode: string; country: string };
};

export type DraftFiles = {
    licenseDocument: File | null;
    ownerIDCard: File | null;
    ownerPassport: File | null;
    additionalDocuments: File[];
};

export function loadDraftText(): DraftText | null {
    try {
        const raw = localStorage.getItem(TEXT_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw) as DraftText;
        if (Date.now() - draft.savedAt > MAX_AGE_MS) {
            clearDraft();
            return null;
        }
        return draft;
    } catch {
        return null;
    }
}

export function saveDraftText(draft: Omit<DraftText, "savedAt">) {
    try {
        localStorage.setItem(TEXT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
    } catch {}
}

export async function loadDraftFiles(): Promise<DraftFiles | null> {
    try {
        return (await get<DraftFiles>(FILES_KEY)) ?? null;
    } catch {
        return null;
    }
}

export function saveDraftFiles(files: DraftFiles) {
    set(FILES_KEY, files).catch(() => {}); // private mode / full storage: just skip
}

export function clearDraft() {
    try { localStorage.removeItem(TEXT_KEY); } catch {}
    del(FILES_KEY).catch(() => {});
}