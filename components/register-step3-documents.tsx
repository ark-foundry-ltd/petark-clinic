// src/components/register-step3-documents.tsx

import { ShieldCheck, FileText, CreditCard, Camera } from "lucide-react";
import { FieldIcon } from "./register-field-icon";
import { DocumentCard, AdditionalDocumentsCard } from "./register-document-card";

type Step3Props = {
    licenseNumber: string;
    setLicenseNumber: (v: string) => void;
    licenseDocument: File | null;
    setLicenseDocument: (f: File | null) => void;
    ownerIDCard: File | null;
    setOwnerIDCard: (f: File | null) => void;
    ownerPassport: File | null;
    setOwnerPassport: (f: File | null) => void;
    additionalDocuments: File[];
    onFileChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'license' | 'certificate' | 'passport'
    ) => void;
    onAdditionalDocuments: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveAdditionalDocument: (index: number) => void;
    onViewFile: (file: File) => void;
};

export default function RegisterStepDocuments({
    licenseNumber,
    setLicenseNumber,
    licenseDocument,
    setLicenseDocument,
    ownerIDCard,
    setOwnerIDCard,
    ownerPassport,
    setOwnerPassport,
    additionalDocuments,
    onFileChange,
    onAdditionalDocuments,
    onRemoveAdditionalDocument,
    onViewFile,
}: Step3Props) {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1.5">
                    Veterinary License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FieldIcon icon={ShieldCheck} />
                    <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                        placeholder="VCN/REG/2019/0842"
                    />
                </div>
            </div>

            <DocumentCard
                icon={FileText}
                title="Clinic License Document"
                tag="Required"
                description="Upload your practice license (PDF, JPG, or PNG · Max 10MB)"
                file={licenseDocument}
                onFileChange={(e) => onFileChange(e, 'license')}
                onRemove={() => setLicenseDocument(null)}
                onView={onViewFile}
            />

            <DocumentCard
                icon={CreditCard}
                title="Owner Government ID Card"
                tag="Required"
                description="National ID (NIN), Voter's Card, or International Passport"
                file={ownerIDCard}
                onFileChange={(e) => onFileChange(e, 'certificate')}
                onRemove={() => setOwnerIDCard(null)}
                onView={onViewFile}
            />

            <DocumentCard
                icon={Camera}
                title="Owner Passport Photograph"
                tag="Optional"
                description="Clear frontal headshot with white or light background"
                file={ownerPassport}
                onFileChange={(e) => onFileChange(e, 'passport')}
                onRemove={() => setOwnerPassport(null)}
                onView={onViewFile}
                uploadLabel="Upload photo"
            />

            <AdditionalDocumentsCard
                files={additionalDocuments}
                onAdd={onAdditionalDocuments}
                onRemove={onRemoveAdditionalDocument}
            />
        </div>
    );
}