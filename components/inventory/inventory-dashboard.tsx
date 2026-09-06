// components/inventory/inventory-dashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    listInventoryItems,
    getInventoryStats,
    type InventoryItemRecord,
    type InventoryCategory,
} from "@/lib/inventory";
import { useClinicLocations } from "@/hooks/useClinicLocations";
import LocationBar from "@/components/inventory/location-bar";
import FilterBar from "@/components/inventory/filter-bar";
import StatCard from "@/components/inventory/stat-card";
import InventoryTable from "@/components/inventory/inventory-table";
import AddItemModal from "@/components/inventory/add-item-modal";
import UpdateItemModal from "@/components/inventory/update-item-modal";

const PAGE_SIZE = 8;

interface InventoryDashboardProps {
    // When provided (e.g. rendered inside a specific location's own page),
    // the dashboard is locked to this location — no switcher, no fetch of
    // the full location list. Omit to get the standalone dropdown behavior.
    locationId?: string;
    // Controls Add Item + edit pencils + the UpdateItemModal rendering at all.
    // Defaults true so existing clinic-side call sites (which never passed
    // this) keep working unchanged.
    canManage?: boolean;
    // Controls the Cost Price field inside UpdateItemModal. Defaults true —
    // the two stats cards (Inventory Value, Monthly Growth) are sellingPrice-
    // derived on the backend, confirmed safe for anyone with VIEW_INVENTORY,
    // so they are NOT gated by this.
    canViewCost?: boolean;
}

export default function InventoryDashboard({
    locationId: lockedLocationId,
    canManage = true,
    canViewCost = true,
}: Readonly<InventoryDashboardProps> = {}) {
    const scoped = !!lockedLocationId;

    const {
        activeLocations,
        activeLocationId: hookActiveLocationId,
        setActiveLocationId,
        loading: locationsLoading,
        hasAnyLocation: hookHasAnyLocation,
    } = useClinicLocations(scoped); // skip the fetch entirely when already scoped

    const activeLocationId = scoped ? lockedLocationId! : hookActiveLocationId;
    const hasAnyLocation = scoped ? true : hookHasAnyLocation;

    const [items, setItems] = useState<InventoryItemRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [category, setCategory] = useState<InventoryCategory | "all">("all");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItemRecord | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const [stats, setStats] = useState({
        totalSkus: 0,
        lowStock: 0,
        inventoryValue: 0,
        monthlyGrowthPercent: 0 as number | null,
    });
    const [statsToken, setStatsToken] = useState(0);

    // Debounce search so we're not firing a request on every keystroke
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Everything that should reset pagination back to page 1 when it changes —
    // page itself is intentionally excluded so paging doesn't self-reset.
    const filterKey = `${category}|${lowStockOnly}|${debouncedSearch}|${activeLocationId}|${reloadToken}`;

    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    if (prevFilterKey !== filterKey) {
        setPrevFilterKey(filterKey);
        if (page !== 1) setPage(1);
    }

    const [lastLoadedKey, setLastLoadedKey] = useState<string | null>(null);
    const currentRequestKey = `${filterKey}|${page}`;
    const loading = lastLoadedKey !== currentRequestKey;

    useEffect(() => {
        // Don't fetch until we know what location we're scoped to — avoids a
        // flash of "no items" before the locations hook resolves.
        if (locationsLoading) return;

        let cancelled = false;

        listInventoryItems({
            category: category === "all" ? undefined : category,
            lowStockOnly,
            search: debouncedSearch || undefined,
            locationId: activeLocationId ?? undefined,
            page,
            limit: PAGE_SIZE,
        })
            .then((data) => {
                if (cancelled) return;
                setItems(data.items);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setLastLoadedKey(currentRequestKey);
            })
            .catch(() => {
                if (cancelled) return;
                setItems([]);
                setTotal(0);
                setTotalPages(1);
                setLastLoadedKey(currentRequestKey);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRequestKey, locationsLoading]);

    useEffect(() => {
        if (locationsLoading) return;
        let cancelled = false;
        getInventoryStats(activeLocationId ?? undefined)
            .then((data) => {
                if (!cancelled) {
                    setStats({
                        totalSkus: data.totalSkus,
                        lowStock: data.lowStock,
                        inventoryValue: data.inventoryValue,
                        monthlyGrowthPercent: data.monthlyGrowthPercent,
                    });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStats((s) => ({ ...s, monthlyGrowthPercent: null }));
                }
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statsToken, activeLocationId, locationsLoading]);

    function handleAddItemClick() {
        if (!hasAnyLocation) {
            toast.error("Add a location before adding inventory items.");
            return;
        }
        setAddModalOpen(true);
    }

    return (
        <div className="min-h-screen p-6 pry-ff">
            {!scoped && <h1 className="mb-4 text-2xl font-semibold text-slate-800">Inventory</h1>}

            {!scoped && (
                <LocationBar
                    locations={activeLocations}
                    activeLocationId={activeLocationId}
                    onChange={setActiveLocationId}
                    loading={locationsLoading}
                    hasAnyLocation={hasAnyLocation}
                />
            )}

            <FilterBar
                category={category}
                onCategoryChange={setCategory}
                lowStockOnly={lowStockOnly}
                onLowStockToggle={() => setLowStockOnly((v) => !v)}
                search={search}
                onSearchChange={setSearch}
                onAddItem={handleAddItemClick}
                canManage={canManage}
            />

            {canManage && activeLocationId && (
                <AddItemModal
                    open={addModalOpen}
                    locationId={activeLocationId}
                    onClose={() => setAddModalOpen(false)}
                    onCreated={() => {
                        setReloadToken((t) => t + 1);
                        setStatsToken((t) => t + 1);
                    }}
                />
            )}

            {/* key forces a full remount whenever the item being edited changes
               (or the modal closes and reopens on a different row), so the
               form always re-seeds from `item` instead of reusing whatever
               state was left over from the previous edit session. */}
            {canManage && activeLocationId && (
                <UpdateItemModal
                    key={editItem?._id ?? "closed"}
                    item={editItem}
                    locationId={activeLocationId}
                    open={editItem !== null}
                    onClose={() => setEditItem(null)}
                    canViewCost={canViewCost}
                    onUpdated={(updatedItem) => {
                        setItems((current) =>
                            current.map((item) => (item._id === updatedItem._id ? updatedItem : item))
                        );
                        setEditItem(null);
                        setStatsToken((t) => t + 1);
                    }}
                    onStockAdjusted={(updatedItem) => {
                        setItems((current) =>
                            current.map((item) => (item._id === updatedItem._id ? updatedItem : item))
                        );
                        setStatsToken((t) => t + 1);
                        // deliberately no setEditItem(null) — modal stays open after a stock adjustment
                    }}
                />
            )}

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total SKUs" value={stats.totalSkus.toLocaleString()} />
                <StatCard
                    label="Low Stock Alerts"
                    value={stats.lowStock.toString()}
                    valueClassName="text-amber-600"
                />
                <StatCard
                    label="Inventory Value"
                    value={`₦${stats.inventoryValue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                    })}`}
                />
                <StatCard
                    label="Monthly Growth"
                    value={
                        stats.monthlyGrowthPercent === null
                            ? "—"
                            : `${stats.monthlyGrowthPercent >= 0 ? "+" : ""}${stats.monthlyGrowthPercent}%`
                    }
                    valueClassName={
                        stats.monthlyGrowthPercent === null
                            ? "text-slate-400"
                            : stats.monthlyGrowthPercent >= 0
                              ? "text-acc-clr"
                              : "text-red-600"
                    }
                />
            </div>

            <InventoryTable
                items={items}
                loading={loading}
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={total}
                onPageChange={setPage}
                onEditItem={(item) => setEditItem(item)}
                canManage={canManage}
            />
        </div>
    );
}