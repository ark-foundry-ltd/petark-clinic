// src/components/register-document-card.tsx
import { Check, Upload, X, Paperclip } from "lucide-react";
import { fileSizeLabel } from "./register-field-icon";

type DocumentCardProps = {
    icon: React.ElementType;
    title: string;
    tag: "Required" | "Optional";
    description: string;
    file: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    onView: (file: File) => void;
    uploadLabel?: string;
};

export function DocumentCard({
    icon: Icon,
    title,
    tag,
    description,
    file,
    onFileChange,
    onRemove,
    onView,
    uploadLabel = "Upload",
}: Readonly<DocumentCardProps>) {
    const isRequired = tag === "Required";

    return (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3 flex-1 min-w-0">
                <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isRequired ? "bg-acc-clr/10" : "bg-gray-100"
                    }`}
                >
                    <Icon className={`h-4 w-4 ${isRequired ? "text-acc-clr" : "text-sec-clr/60"}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-sec-clr break-words">{title}</span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                isRequired ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-sec-clr/60"
                            }`}
                        >
                            {tag}
                        </span>
                    </div>
                    <p className="text-xs text-sec-clr/60 mt-0.5 break-words">{description}</p>
                    {file && (
                        <div className="mt-2 flex items-center gap-2 min-w-0 bg-acc-clr/5 rounded-lg px-3 py-2 text-xs">
                            <Check className="h-3.5 w-3.5 text-acc-clr shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-sec-clr">{file.name}</span>
                            <span className="hidden min-[420px]:inline text-sec-clr/50 shrink-0">
                                ({fileSizeLabel(file)})
                            </span>
                            <span className="text-acc-clr font-medium shrink-0">Ready</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions: below content on mobile (aligned with text via pl-12), beside it on sm+ */}
            <div className="flex items-center gap-4 pl-12 sm:pl-0 sm:pt-1 sm:shrink-0">
                {file ? (
                    <>
                        <button
                            type="button"
                            onClick={() => onView(file)}
                            className="text-xs font-medium text-sec-clr/70 hover:text-acc-clr"
                        >
                            View
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-xs font-medium text-red-500 hover:text-red-600"
                        >
                            Remove
                        </button>
                    </>
                ) : (
                    <label className="flex items-center gap-1 text-xs font-medium text-acc-clr hover:text-acc-clr/80 cursor-pointer whitespace-nowrap">
                        <Upload className="h-3.5 w-3.5" />
                        {uploadLabel}
                        <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={onFileChange}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}

type AdditionalDocumentsCardProps = {
    files: File[];
    onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
};

export function AdditionalDocumentsCard({ files, onAdd, onRemove }: Readonly<AdditionalDocumentsCardProps>) {
    return (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Paperclip className="h-4 w-4 text-sec-clr/60" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-sec-clr break-words">
                                Additional Clinic Documents
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-gray-100 text-sec-clr/60">
                                Optional
                            </span>
                        </div>
                        <p className="text-xs text-sec-clr/60 mt-0.5 break-words">
                            Premises inspection certificate, tax clearance, or partner registrations
                        </p>
                    </div>
                </div>
                <label className="flex items-center gap-1 pl-12 sm:pl-0 sm:pt-1 sm:shrink-0 text-xs font-medium text-acc-clr hover:text-acc-clr/80 cursor-pointer whitespace-nowrap">
                    + Add files
                    <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={onAdd}
                    />
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-3 space-y-1.5 min-w-0">
                    {files.map((doc, index) => (
                        <div
                            key={`${doc.name}-${doc.size}-${doc.lastModified}-${index}`}
                            className="flex items-center gap-2 min-w-0 bg-acc-clr/5 rounded-lg px-3 py-2 text-xs"
                        >
                            <Check className="h-3.5 w-3.5 text-acc-clr shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-sec-clr">{doc.name}</span>
                            <span className="hidden min-[420px]:inline text-sec-clr/50 shrink-0">
                                ({fileSizeLabel(doc)})
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                aria-label={`Remove ${doc.name}`}
                                className="text-red-500 hover:text-red-600 shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}