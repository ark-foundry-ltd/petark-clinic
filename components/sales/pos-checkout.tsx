// components/sales/pos-checkout.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, Search, ShoppingCart, X, Check, Warehouse, Box } from "lucide-react";
import { listInventoryItems, type InventoryItemRecord } from "@/lib/inventory";
import { checkoutSale, type CheckoutSalePayload, type PaymentMethod, type SaleRecord } from "@/lib/sales";
import { useRouter } from "next/navigation";

interface CartLine {
    itemId: string;
    name: string;
    unit: string;
    unitPrice: number;
    quantity: number;
    maxStock: number;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    cash: "Cash",
    transfer: "Transfer",
    pos_card: "POS / Card",
};

export default function PosCheckout() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [results, setResults] = useState<InventoryItemRecord[]>([]);

    const [cart, setCart] = useState<Record<string, CartLine>>({});
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [customerUserId, setCustomerUserId] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<SaleRecord | null>(null);
    const router = useRouter();

    const navigateToInventory = () => {
        router.push("/dashboard/clinical/inventory");
    };

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const trimmedSearch = debouncedSearch.trim();

    // `searching` is derived, not imperatively toggled — true whenever the
    // most recently *completed* fetch doesn't match the current query.
    // No setState call happens synchronously in the effect body; every
    // setState below runs inside a .then/.catch callback, which is the
    // pattern React's "cascading renders" warning explicitly endorses.
    const [lastLoadedSearch, setLastLoadedSearch] = useState<string | null>(null);
    const searching = trimmedSearch !== "" && lastLoadedSearch !== trimmedSearch;

    useEffect(() => {
        if (!trimmedSearch) {
            return;
        }

        let cancelled = false;

        listInventoryItems({ search: trimmedSearch })
            .then((data) => {
                if (cancelled) return;
                setResults(data.filter((i) => i.isActive && i.currentStock > 0));
                setLastLoadedSearch(trimmedSearch);
            })
            .catch(() => {
                if (cancelled) return;
                setResults([]);
                setLastLoadedSearch(trimmedSearch);
            });

        return () => {
            cancelled = true;
        };
    }, [trimmedSearch]);

    const displayResults = trimmedSearch ? results : [];

    const cartLines = Object.values(cart);
    const totalAmount = cartLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const totalItems = cartLines.reduce((sum, line) => sum + line.quantity, 0);

    function addToCart(item: InventoryItemRecord) {
        setError(null);
        setCart((current) => {
            const existing = current[item._id];
            const nextQty = Math.min((existing?.quantity ?? 0) + 1, item.currentStock);
            return {
                ...current,
                [item._id]: {
                    itemId: item._id,
                    name: item.name,
                    unit: item.unit,
                    unitPrice: item.sellingPrice,
                    quantity: nextQty,
                    maxStock: item.currentStock,
                },
            };
        });
    }

    function changeQuantity(itemId: string, delta: number) {
        setError(null);
        setCart((current) => {
            const line = current[itemId];
            if (!line) return current;
            const nextQty = line.quantity + delta;
            if (nextQty <= 0) {
                const { [itemId]: _removed, ...rest } = current;
                return rest;
            }
            if (nextQty > line.maxStock) return current;
            return { ...current, [itemId]: { ...line, quantity: nextQty } };
        });
    }

    function removeFromCart(itemId: string) {
        setCart((current) => {
            const { [itemId]: _removed, ...rest } = current;
            return rest;
        });
    }

    function startNewSale() {
        setCart({});
        setSearch("");
        setResults([]);
        setLastLoadedSearch(null);
        setCustomerUserId("");
        setError(null);
        setReceipt(null);
    }

    async function handleCheckout() {
        setError(null);

        if (cartLines.length === 0) {
            setError("Add at least one item to the cart.");
            return;
        }

        if (customerUserId.trim() && !/^[0-9a-fA-F]{24}$/.test(customerUserId.trim())) {
            setError("Customer ID must be a valid ID format, or left blank.");
            return;
        }

        const payload: CheckoutSalePayload = {
            items: cartLines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
            paymentMethod,
        };
        if (customerUserId.trim()) {
            payload.userId = customerUserId.trim();
        }

        setSubmitting(true);
        try {
            const sale = await checkoutSale(payload);
            setReceipt(sale);
            setCart({});
        } catch (err) {
            setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (receipt) {
        return (
            <div className="mx-auto max-w-md rounded-xl border border-slate-100 bg-pry-clr p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-emerald-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                        <Check className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800">Sale complete</h2>
                </div>

                <div className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {receipt.items.map((line) => (
                        <div key={line.itemId} className="flex items-center justify-between px-3 py-2 text-sm">
                            <div>
                                <div className="font-medium text-slate-700">{line.name}</div>
                                <div className="text-xs text-slate-400">
                                    {line.quantity} × ₦{line.unitPrice.toFixed(2)}
                                </div>
                            </div>
                            <div className="font-medium text-slate-700">₦{line.subtotal.toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
                    <span>Payment method</span>
                    <span className="font-medium text-slate-700">{PAYMENT_LABELS[receipt.paymentMethod]}</span>
                </div>
                <div className="mb-6 flex items-center justify-between text-base font-semibold text-slate-800">
                    <span>Total</span>
                    <span>₦{receipt.totalAmount.toFixed(2)}</span>
                </div>

                <button
                    type="button"
                    onClick={startNewSale}
                    className="w-full rounded-lg bg-acc-clr px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                    Start new sale
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 pry-ff p-4">
            {/* Search & results */}
            <div className="lg:col-span-3">
                <section className="mb-4 flex items-center justify-between gap-4">
                    <div className="relative mb-3 max-w-2xl flex-1 lg:mb-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search items to add to cart..."
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                <div>
                    <button
                        type="button"
                        onClick={navigateToInventory}
                            className="rounded-lg bg-pry-clr px-3 py-2.5 text-sm font-medium text-acc-clr pry-ff hover:opacity-90 cursor-pointer shadow flex gap-2 hover:bg-acc-clr hover:text-pry-clr transition">
                            <Box className="h-4 w-4" />
                        View inventory
                    </button>
                </div>
                </section>

                <div className="rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                    {searching && (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    )}

                    {!searching && trimmedSearch && displayResults.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">
                            No in-stock items match &ldquo;{trimmedSearch}&rdquo;.
                        </p>
                    )}

                    {!searching && !trimmedSearch && (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">
                            Start typing to search inventory.
                        </p>
                    )}

                    {!searching && displayResults.length > 0 && (
                        <ul className="divide-y divide-slate-50">
                            {displayResults.map((item) => {
                                const inCart = cart[item._id];
                                const atMax = inCart && inCart.quantity >= item.currentStock;
                                return (
                                    <li key={item._id} className="flex items-center justify-between gap-3 px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-slate-700">{item.name}</div>
                                            <div className="text-xs text-slate-400">
                                                ₦{item.sellingPrice.toFixed(2)} · {item.currentStock} {item.unit} in stock
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addToCart(item)}
                                            disabled={atMax}
                                            className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {atMax ? "Max in cart" : inCart ? `In cart (${inCart.quantity})` : "Add"}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                        <ShoppingCart className="h-4 w-4 text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-800">
                            Cart {totalItems > 0 && <span className="text-slate-400">({totalItems})</span>}
                        </h2>
                    </div>

                    {error && (
                        <div className="mx-4 mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                            {error}
                        </div>
                    )}

                    {cartLines.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">Cart is empty.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
                            {cartLines.map((line) => (
                                <li key={line.itemId} className="flex items-center justify-between gap-2 px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium text-slate-700">{line.name}</div>
                                        <div className="text-xs text-slate-400">
                                            ₦{line.unitPrice.toFixed(2)} each
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(line.itemId, -1)}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-100"
                                            aria-label={`Decrease ${line.name} quantity`}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium text-slate-700">
                                            {line.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(line.itemId, 1)}
                                            disabled={line.quantity >= line.maxStock}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                                            aria-label={`Increase ${line.name} quantity`}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="w-16 text-right text-sm font-medium text-slate-700">
                                        ₦{(line.unitPrice * line.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(line.itemId)}
                                        className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                                        aria-label={`Remove ${line.name} from cart`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="border-t border-slate-100 px-4 py-4">
                        <div className="mb-3">
                            <label htmlFor="payment-method" className="mb-1 block text-xs font-medium text-slate-500">
                                Payment method
                            </label>
                            <select
                                id="payment-method"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                disabled={submitting}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                            >
                                {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="customer-id" className="mb-1 block text-xs font-medium text-slate-500">
                                Customer ID <span className="text-slate-300">(optional — for receipt email)</span>
                            </label>
                            <input
                                id="customer-id"
                                type="text"
                                value={customerUserId}
                                onChange={(e) => setCustomerUserId(e.target.value)}
                                disabled={submitting}
                                placeholder="Leave blank for walk-in"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-between text-base font-semibold text-slate-800">
                            <span>Total</span>
                            <span>₦{totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={submitting || cartLines.length === 0}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-acc-clr px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Charge ₦{totalAmount.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}