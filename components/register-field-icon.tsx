// src/components/register-field-icon.tsx

export function FieldIcon({ icon: Icon }: Readonly<{ icon: React.ElementType }>) {
    return (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    );
}

export function fileSizeLabel(file: File) {
    return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
}