export interface ChecklistItem {
  label: string;
  checked: boolean;
  category: string;
}

export type InspectionStatus = 'pending' | 'approved' | 'approved_with_notes' | 'rejected';

export interface VehicleInfo {
  plate: string;
  model: string;
  year: number;
  color: string;
  chassis: string;
  vehicleType: string;
}

export interface OwnerInfo {
  fullName: string;
  document: string;
  phone: string;
  address: string;
}

export interface InspectionFormData {
  vehicleInfo: VehicleInfo;
  ownerInfo: OwnerInfo;
  checklist: ChecklistItem[];
  status: InspectionStatus;
  photos: File[];
  generalObservations: string;
  technicianSignature: string;
  clientSignature: string;
  categoryObservations: Record<string, string>;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  categoryObservations: Record<string, string>;
  onCategoryObservationChange: (category: string, observation: string) => void;
}

export interface InspectionStatusProps {
  status: InspectionStatus;
  onChange: (status: InspectionStatus) => void;
  generalObservations: string;
  onGeneralObservationsChange: (observations: string) => void;
}

export interface PreviewModalProps {
  formData: InspectionFormData;
  onClose: () => void;
  onGenerate: () => Promise<void>;
} 