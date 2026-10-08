export default function TabPlaceholder({
    title,
    note,
}: Readonly<{ title: string; note?: string }>) {
    return (
        <div className="flex flex-col items-center text-center py-12 px-4 border border-dashed border-gray-200 rounded-xl">
            <h3 className="font-semibold text-sec-clr mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{note ?? "Coming soon."}</p>
        </div>
    );
}