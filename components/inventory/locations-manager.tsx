// components/inventory/locations-manager.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
    listLocations,
    createLocation,
    updateLocation,
    toggleLocationStatus,
    type Location,
} from "@/lib/location";
import { useAuthStore } from "@/store/useStore";
import {
    MapPin,
    Plus,
    Loader2,
    Pencil,
    Power,
    Lock,
    Star,
    X,
} from "lucide-react";
import { getPlanInfo } from "@/lib/plan";

interface LocationFormState {
    name: string;
    address: string;
    phoneNumber: string;
}

const EMPTY_FORM: LocationFormState = { name: "", address: "", phoneNumber: "" };

// A handful of old/manually-inserted location records were stored with
// `address` as an object (the same shape as a clinic's own User.address —
// {street, city, state, country, zipCode}) instead of the plain string the
// current form always produces. Normalize both shapes here so a stale
// record can't crash rendering or corrupt the edit form.
interface LocationAddressObject {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string | null;
}

function formatAddress(
    address: string | LocationAddressObject | null | undefined
): string {
    if (!address) return "";
    if (typeof address === "string") return address;
    return [address.street, address.city, address.state, address.country, address.zipCode]
        .filter(Boolean)
        .join(", ");
}

export default function LocationsManager() {
    const router = useRouter();
    const { profile } = useAuthStore();
    
    const { plan, status } = getPlanInfo(profile);
    const hasLocationAccess = plan !== "free" && plan != null && status === "active";

    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [form, setForm] = useState<LocationFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        if (!hasLocationAccess) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const data = await listLocations();
                if (cancelled) return;
                setLocations(data);
            } catch {
                if (cancelled) return;
                setLoadError("Couldn't load your locations.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [hasLocationAccess]);

    function openAddModal() {
        setEditingLocation(null);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    }

    function openEditModal(location: Location) {
        setEditingLocation(location);
        setForm({
            name: location.name,
            address: formatAddress(location.address),
            phoneNumber: location.phoneNumber || "",
        });
        setIsModalOpen(true);
    }

    function extractErrorMessage(err: unknown, fallback: string): string {
        if (axios.isAxiosError(err)) {
            return (
                err.response?.data?.message ??
                (typeof err.response?.data === "string" ? err.response.data : fallback)
            );
        }
        return fallback;
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.address.trim()) {
            toast.error("Name and address are required");
            return;
        }
        setSaving(true);
        try {
            if (editingLocation) {
                const updated = await updateLocation(editingLocation._id, {
                    name: form.name.trim(),
                    address: form.address.trim(),
                    phoneNumber: form.phoneNumber.trim() || undefined,
                });
                setLocations((prev) =>
                    prev.map((l) => (l._id === updated._id ? updated : l))
                );
                toast.success("Location updated");
            } else {
                const created = await createLocation({
                    name: form.name.trim(),
                    address: form.address.trim(),
                    phoneNumber: form.phoneNumber.trim() || undefined,
                });
                setLocations((prev) => [
                    ...prev,
                    {
                        _id: created.locationId,
                        clinicId: profile?.id ?? "",
                        name: created.name,
                        address: created.address,
                        phoneNumber: form.phoneNumber.trim() || null,
                        isPrimary: created.isPrimary,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ]);
                toast.success("Location added");
            }
            setIsModalOpen(false);
        } catch (err) {
            toast.error(extractErrorMessage(err, "Failed to save location"));
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleStatus(location: Location) {
        if (location.isPrimary && location.isActive) {
            toast.error("Cannot deactivate the primary location");
            return;
        }
        setTogglingId(location._id);
        try {
            const result = await toggleLocationStatus(location._id, !location.isActive);
            setLocations((prev) =>
                prev.map((l) =>
                    l._id === location._id ? { ...l, isActive: result.isActive } : l
                )
            );
            toast.success(
                result.isActive ? "Location activated" : "Location deactivated"
            );
        } catch (err) {
            toast.error(extractErrorMessage(err, "Failed to update location status"));
        } finally {
            setTogglingId(null);
        }
    }

    if (!hasLocationAccess) {
        return (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-500 mb-1">Locations</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">
                    Manage multiple branches from a Standard plan or above.
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/profile/upgrade")}
                    className="inline-flex items-center gap-2 bg-acc-clr text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition"
                >
                    Upgrade Plan
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pry-ff">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-sec-clr">Locations</h2>
                    <p className="text-sm text-gray-500">
                        Manage the branches your clinic operates from.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-acc-clr text-white text-sm font-semibold px-3.5 py-2 rounded-xl hover:opacity-90 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Location
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-5 h-5 text-acc-clr animate-spin" />
                </div>
            ) : loadError ? (
                <p className="text-sm text-red-500 text-center py-8">{loadError}</p>
            ) : locations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                    No locations yet — add your first branch.
                </p>
            ) : (
                <div className="space-y-3">
                    {locations.map((location) => (
                        <div
                            onClick={() => router.push(`/dashboard/clinical/locations/${location._id}`)}
                            key={location._id}
                            className={`bg-pry-clr border border-gray-100 rounded-xl p-4 flex items-start gap-3 cursor-pointer ${
                                !location.isActive ? "opacity-60" : ""
                            }`}
                        >
                            <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4 text-acc-clr" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-sec-clr truncate">
                                        {location.name}
                                    </p>
                                    {location.isPrimary && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                                            <Star className="w-2.5 h-2.5 fill-current" />
                                            Primary
                                        </span>
                                    )}
                                    {!location.isActive && (
                                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                    {formatAddress(location.address)}
                                </p>
                                {location.phoneNumber && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {location.phoneNumber}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(location)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(location)}
                                    disabled={
                                        togglingId === location._id ||
                                        (location.isPrimary && location.isActive)
                                    }
                                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                        location.isActive
                                            ? "hover:bg-red-50 text-red-500"
                                            : "hover:bg-green-50 text-green-600"
                                    }`}
                                    title={
                                        location.isPrimary && location.isActive
                                            ? "Primary location can't be deactivated"
                                            : location.isActive
                                              ? "Deactivate"
                                              : "Activate"
                                    }
                                >
                                    {togglingId === location._id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Power className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
                    <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-sec-clr">
                                {editingLocation ? "Edit Location" : "Add Location"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-sec-clr mb-1.5 block">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Downtown Branch"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-sec-clr mb-1.5 block">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                    placeholder="Street, city, state"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-sec-clr mb-1.5 block">
                                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                    placeholder="e.g. 08012345678"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-5 pt-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={saving}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 bg-acc-clr hover:opacity-90 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : editingLocation ? (
                                    "Save Changes"
                                ) : (
                                    "Add Location"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}