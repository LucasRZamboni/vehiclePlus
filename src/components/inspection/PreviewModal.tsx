import React, { useEffect, useState } from 'react';
import { X, Download, Eye, Printer, CheckSquare, Square } from 'lucide-react';
import { InspectionFormData } from '../../types';

interface PreviewModalProps {
  formData: InspectionFormData;
  onClose: () => void;
  onGenerate: () => Promise<void>;
}

const getDocumentType = (document: string): string => {
  const numbers = document.replace(/\D/g, '');
  return numbers.length === 11 ? 'CPF' : 'CNPJ';
};

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
  },
  approved: {
    label: 'Aprovado',
    color: 'text-green-700 bg-green-50 border-green-200'
  },
  approved_with_notes: {
    label: 'Aprovado com Ressalvas',
    color: 'text-orange-700 bg-orange-50 border-orange-200'
  },
  rejected: {
    label: 'Reprovado',
    color: 'text-red-700 bg-red-50 border-red-200'
  }
};

export function PreviewModal({ formData, onClose, onGenerate }: PreviewModalProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const urls = formData.photos.map(photo => URL.createObjectURL(photo));
    setPhotoUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [formData.photos]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  // Agrupar itens do checklist por categoria
  const groupedChecklist = formData.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof formData.checklist>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header - Fixo */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pré-visualização do Relatório
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Revise todas as informações antes de gerar o PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Rolável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Vehicle Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Informações do Veículo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoCard label="Placa" value={formData.vehicleInfo.plate} />
              <InfoCard label="Modelo" value={formData.vehicleInfo.model} />
              <InfoCard label="Tipo" value={formData.vehicleInfo.vehicleType} />
              <InfoCard label="Ano" value={formData.vehicleInfo.year.toString()} />
              <InfoCard label="Cor" value={formData.vehicleInfo.color} />
              <InfoCard label="Chassi" value={formData.vehicleInfo.chassis} />
            </div>
          </section>

          {/* Owner Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Informações do Proprietário
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Nome" value={formData.ownerInfo.fullName} />
              <InfoCard 
                label={getDocumentType(formData.ownerInfo.document)}
                value={formData.ownerInfo.document}
              />
              <InfoCard label="Telefone" value={formData.ownerInfo.phone} />
              <InfoCard label="Endereço" value={formData.ownerInfo.address} />
            </div>
          </section>

          {/* Checklist */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Checklist da Vistoria
            </h3>
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <span className="text-sm text-gray-500">
                    {items.filter(item => item.checked).length}/{items.length} itens verificados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        item.checked ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.checked ? (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                {formData.categoryObservations[category] && (
                  <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Observações:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.categoryObservations[category]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Status */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Status da Vistoria
            </h3>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              statusConfig[formData.status].color
            }`}>
              {statusConfig[formData.status].label}
            </div>
            {formData.generalObservations && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Observações Gerais:</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{formData.generalObservations}</p>
              </div>
            )}
          </section>

          {/* Photos */}
          {photoUrls.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Fotos da Vistoria ({photoUrls.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photoUrls.map((url, index) => (
                  <div 
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Signatures */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assinaturas
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {formData.technicianSignature && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Assinatura do Técnico
                  </p>
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={formData.technicianSignature}
                      alt="Assinatura do Técnico"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              )}
              {formData.clientSignature && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Assinatura do Cliente
                  </p>
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={formData.clientSignature}
                      alt="Assinatura do Cliente"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer - Fixo */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 shrink-0">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              <X className="h-5 w-5 mr-2" />
              Fechar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Gerar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
    </div>
  );
} 