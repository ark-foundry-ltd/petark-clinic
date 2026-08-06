// components/inventory/filter-bar.tsx
import { Search, Plus } from "lucide-react";
import type { InventoryCategory } from "@/lib/inventory";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const CATEGORY_LABELS: Record<InventoryCategory | "all", string> = {
    all: "All Categories",
    medication: "Medication",
    vaccine: "Vaccines",
    consumable: "Consumables",
    surgical: "Surgical Supplies",
    lab_reagent: "Lab Reagents",
    other: "Other",
};

interface FilterBarProps {
    category: InventoryCategory | "all";
    onCategoryChange: (value: InventoryCategory | "all") => void;
    lowStockOnly: boolean;
    onLowStockToggle: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    onAddItem: () => void;
}

export default function FilterBar({
    category,
    onCategoryChange,
    lowStockOnly,
    onLowStockToggle,
    search,
    onSearchChange,
    onAddItem,
}: Readonly<FilterBarProps>) {
    const router = useRouter();

    const navigateToSales = () => {
        router.push("/dashboard/clinical/sales");
    };
    return (
        <div className="mb-4 flex flex-wrap items-center gap-4">
            <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as InventoryCategory | "all")}
                className="rounded-lg border border-slate-200 bg-pry-clr px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
            >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-600">
    <button
        type="button"
        role="switch"
        aria-checked={lowStockOnly}
        onClick={onLowStockToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 appearance-none items-center rounded-full border-0 p-0 transition-colors ${
            lowStockOnly ? "bg-acc-clr" : "bg-slate-200"
        }`}
    >
        <span
            className={`inline-block h-4 w-4 shrink-0 translate-x-0.5 rounded-full bg-pry-clr shadow transition-transform ${
                lowStockOnly ? "translate-x-4" : "translate-x-0.5"
            }`}
        />
    </button>
    <span className="leading-none">Low Stock Only</span>
</label>

            <div className="relative flex-1 min-w-55 max-w-sm">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search items or SKU..."
                    aria-label="Search inventory items"
                    className="w-full rounded-lg border border-slate-200 bg-pry-clr py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
                />
            </div>

            <button
                type="button"
                onClick={onAddItem}
                className="ml-auto flex items-center gap-2 rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-pry-clr shadow-sm hover:bg-acc-clr"
            >
                <Plus className="h-4 w-4" />
                Add Item
            </button>

            <button
                type="button"
                onClick={navigateToSales}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-pry-clr pry-ff hover:opacity-90 cursor-pointer">
                Go to Sales
            </button>

        </div>
    );
}