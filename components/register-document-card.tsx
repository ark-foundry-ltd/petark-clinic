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
}: DocumentCardProps) {
    const isRequired = tag === "Required";

    return (
        <div className="rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
                <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isRequired ? "bg-acc-clr/10" : "bg-gray-100"
                    }`}
                >
                    <Icon className={`h-4 w-4 ${isRequired ? "text-acc-clr" : "text-sec-clr/60"}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-sec-clr">{title}</span>
                        <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isRequired ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-sec-clr/60"
                            }`}
                        >
                            {tag}
                        </span>
                    </div>
                    <p className="text-xs text-sec-clr/60 mt-0.5">{description}</p>
                    {file && (
                        <div className="mt-2 flex items-center gap-2 bg-acc-clr/5 rounded-lg px-3 py-2 text-xs">
                            <Check className="h-3.5 w-3.5 text-acc-clr flex-shrink-0" />
                            <span className="min-w-0 flex-1 truncate text-sec-clr">{file.name}</span>
                            <span className="hidden sm:inline text-sec-clr/50 flex-shrink-0">
                                ({fileSizeLabel(file)})
                            </span>
                            <span className="text-acc-clr font-medium flex-shrink-0">Ready</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 pt-1">
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

export function AdditionalDocumentsCard({ files, onAdd, onRemove }: AdditionalDocumentsCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Paperclip className="h-4 w-4 text-sec-clr/60" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-sec-clr">Additional Clinic Documents</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-sec-clr/60">
                                Optional
                            </span>
                        </div>
                        <p className="text-xs text-sec-clr/60 mt-0.5">
                            Premises inspection certificate, tax clearance, or partner registrations
                        </p>
                    </div>
                </div>
                <label className="flex items-center gap-1 text-xs font-medium text-acc-clr hover:text-acc-clr/80 cursor-pointer whitespace-nowrap flex-shrink-0 pt-1">
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
                <div className="mt-3 space-y-1.5">
                    {files.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 bg-acc-clr/5 rounded-lg px-3 py-2 text-xs">
                            <Check className="h-3.5 w-3.5 text-acc-clr flex-shrink-0" />
                            <span className="truncate text-sec-clr">{doc.name}</span>
                            <span className="text-sec-clr/50 flex-shrink-0">({fileSizeLabel(doc)})</span>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="ml-auto text-red-500 hover:text-red-600 flex-shrink-0"
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