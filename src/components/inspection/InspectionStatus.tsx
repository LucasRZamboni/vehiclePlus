import React from 'react';
import { InspectionStatus as InspectionStatusType } from '../../types';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface InspectionStatusProps {
  status: InspectionStatusType;
  onChange: (status: InspectionStatusType) => void;
  generalObservations: string;
  onGeneralObservationsChange: (observations: string) => void;
}

const statusConfig: Record<InspectionStatusType, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Pendente',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50'
  },
  approved: {
    label: 'Aprovado',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  approved_with_notes: {
    label: 'Aprovado com Ressalvas',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50'
  },
  rejected: {
    label: 'Reprovado',
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50'
  }
};

export function InspectionStatus({ 
  status, 
  onChange,
  generalObservations,
  onGeneralObservationsChange
}: InspectionStatusProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as InspectionStatusType)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
              status === key
                ? `${config.bgColor} ${config.color} border-${config.color.split('-')[1]}-200`
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={status === key ? config.color : 'text-gray-400'}>
              {config.icon}
            </div>
            <span className={`font-medium ${
              status === key ? config.color : 'text-gray-700'
            }`}>
              {config.label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
          Observações Gerais
        </label>
        <textarea
          id="observations"
          rows={4}
          value={generalObservations}
          onChange={(e) => onGeneralObservationsChange(e.target.value)}
          className="input resize-none"
          placeholder="Digite aqui observações adicionais sobre a vistoria..."
        />
      </div>
    </div>
  );
} 