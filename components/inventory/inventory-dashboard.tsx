// components/inventory/inventory-dashboard.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
    listInventoryItems,
    type InventoryItemRecord,
    type InventoryCategory,
} from "@/lib/inventory";
import FilterBar from "@/components/inventory/filter-bar";
import StatCard from "@/components/inventory/stat-card";
import InventoryTable from "@/components/inventory/inventory-table";

const PAGE_SIZE = 4;

export default function InventoryDashboard() {
    const [items, setItems] = useState<InventoryItemRecord[]>([]);
    const [category, setCategory] = useState<InventoryCategory | "all">("all");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Debounce search so we're not firing a request on every keystroke
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const filterKey = `${category}|${lowStockOnly}|${debouncedSearch}`;

    // Reset to page 1 whenever the filters change — done during render by
    // comparing against the previous filter key (useState, not useRef, since
    // ref.current can't be read during render). React's documented
    // "adjusting state when a prop changes" pattern:
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    if (prevFilterKey !== filterKey) {
        setPrevFilterKey(filterKey);
        if (page !== 1) setPage(1);
    }

    // `loading` is derived, not imperatively toggled — it's true whenever
    // the most recently *completed* fetch doesn't match the current filters.
    // This avoids ever calling setState synchronously in the effect body:
    // the only setState calls below happen inside the .then/.catch callback,
    // which is exactly the pattern the "cascading renders" warning endorses
    // ("calling setState in a callback function when external state changes").
    const [lastLoadedKey, setLastLoadedKey] = useState<string | null>(null);
    const loading = lastLoadedKey !== filterKey;

    useEffect(() => {
        let cancelled = false;

        listInventoryItems({
            category: category === "all" ? undefined : category,
            lowStockOnly,
            search: debouncedSearch || undefined,
        })
            .then((data) => {
                if (cancelled) return;
                setItems(data);
                setLastLoadedKey(filterKey);
            })
            .catch(() => {
                if (cancelled) return;
                setItems([]);
                setLastLoadedKey(filterKey);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKey]);

    const stats = useMemo(() => {
        const totalSkus = items.length;
        const lowStock = items.filter(
            (i) => i.reorderThreshold != null && i.currentStock <= i.reorderThreshold
        ).length;
        const inventoryValue = items.reduce(
            (sum, i) => sum + i.sellingPrice * i.currentStock,
            0
        );
        return { totalSkus, lowStock, inventoryValue };
    }, [items]);

    const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pry-ff">
            <h1 className="mb-4 text-2xl font-semibold text-slate-800">Inventory</h1>

            <FilterBar
                category={category}
                onCategoryChange={setCategory}
                lowStockOnly={lowStockOnly}
                onLowStockToggle={() => setLowStockOnly((v) => !v)}
                search={search}
                onSearchChange={setSearch}
                onAddItem={() => {
                    // TODO: open Add Item form/modal
                }}
            />

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total SKUs" value={stats.totalSkus.toLocaleString()} />
                <StatCard
                    label="Low Stock Alerts"
                    value={stats.lowStock.toString()}
                    valueClassName="text-amber-600"
                />
                <StatCard
                    label="Inventory Value"
                    value={`$${stats.inventoryValue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                    })}`}
                />
                <StatCard label="Monthly Growth" value="+8.4%" valueClassName="text-acc-clr" />
            </div>

            <InventoryTable
                items={pageItems}
                loading={loading}
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={items.length}
                onPageChange={setPage}
                onEditItem={(item) => {
                    // TODO: open Edit Item form/modal, prefilled with `item`
                }}
            />
        </div>
    );
}