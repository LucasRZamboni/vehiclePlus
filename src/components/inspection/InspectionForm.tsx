import React, { useState } from 'react';
import { Clipboard, Car, Download, X, FileText, Camera, CheckSquare, User } from 'lucide-react';
import { VehicleInfo } from './VehicleInfo';
import { OwnerInfo } from './OwnerInfo';
import { Checklist } from './Checklist';
import { PhotoUpload } from './PhotoUpload';
import { InspectionStatus } from './InspectionStatus';
import { Signatures } from './Signatures';
import { PreviewModal } from './PreviewModal';
import { InspectionFormData, ChecklistItem, InspectionStatus as InspectionStatusType } from '../../types';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialChecklist: ChecklistItem[] = [
  // Informações Gerais do Veículo
  { category: "Informações Gerais do Veículo", label: 'Placa', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Renavam', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Chassi', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Marca/Modelo', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Ano de Fabricação', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Ano do Modelo', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Cor', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Categoria (Passeio, Carga, Moto, etc.)', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Tipo de Combustível', checked: false },
  { category: "Informações Gerais do Veículo", label: 'Quilometragem', checked: false },

  // Condições Externas
  { category: "Condições Externas", label: 'Pintura', checked: false },
  { category: "Condições Externas", label: 'Amassados/Riscos', checked: false },
  { category: "Condições Externas", label: 'Vidros e Retrovisores', checked: false },
  { category: "Condições Externas", label: 'Faróis e Lanternas', checked: false },
  { category: "Condições Externas", label: 'Para-choques', checked: false },
  { category: "Condições Externas", label: 'Pneus', checked: false },
  { category: "Condições Externas", label: 'Estepe e Macaco', checked: false },

  // Condições Internas
  { category: "Condições Internas", label: 'Painel e Iluminação Interna', checked: false },
  { category: "Condições Internas", label: 'Banco do Motorista e Passageiros', checked: false },
  { category: "Condições Internas", label: 'Cintos de Segurança', checked: false },
  { category: "Condições Internas", label: 'Tapetes e Forração', checked: false },
  { category: "Condições Internas", label: 'Sistema de Som/Mídia', checked: false },
  { category: "Condições Internas", label: 'Ar-condicionado', checked: false },

  // Parte Mecânica e Funcionamento
  { category: "Parte Mecânica e Funcionamento", label: 'Motor', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Câmbio', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Suspensão', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Freios', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Direção', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Óleo e Fluídos', checked: false },
  { category: "Parte Mecânica e Funcionamento", label: 'Sistema Elétrico', checked: false },

  // Documentação e Procedência
  { category: "Documentação e Procedência", label: 'Sinistro Registrado', checked: false },
  { category: "Documentação e Procedência", label: 'Leilão ou Recuperado', checked: false },
];

const getDocumentType = (document: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = document.replace(/\D/g, '');
  return numbers.length === 11 ? 'CPF' : 'CNPJ';
};

const statusLabels: Record<string, string> = {
  'pending': 'Pendente',
  'approved': 'Aprovado',
  'approved_with_notes': 'Aprovado com Ressalvas',
  'rejected': 'Reprovado'
};

export function InspectionForm() {
  const [formData, setFormData] = useState<InspectionFormData>({
    vehicleInfo: {
      plate: '',
      model: '',
      year: 2024,
      color: '',
      chassis: '',
      vehicleType: '',
    },
    ownerInfo: {
      fullName: '',
      document: '',
      phone: '',
      address: '',
    },
    checklist: initialChecklist,
    status: 'pending',
    photos: [],
    generalObservations: '',
    technicianSignature: '',
    clientSignature: '',
    categoryObservations: {},
  });

  const [categoryObservations, setCategoryObservations] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    vehicleInfo?: string[];
    ownerInfo?: string[];
  }>({});

  const handleCategoryObservationChange = (category: string, observation: string) => {
    setCategoryObservations(prev => ({
      ...prev,
      [category]: observation
    }));
  };

  const validateRequiredFields = () => {
    const errors: typeof validationErrors = {};
    
    // Validar informações do veículo
    const vehicleErrors: string[] = [];
    if (!formData.vehicleInfo.plate) vehicleErrors.push('Placa');
    if (!formData.vehicleInfo.model) vehicleErrors.push('Modelo');
    if (!formData.vehicleInfo.chassis) vehicleErrors.push('Chassi');
    if (vehicleErrors.length > 0) {
      errors.vehicleInfo = vehicleErrors;
    }

    // Validar informações do proprietário
    const ownerErrors: string[] = [];
    if (!formData.ownerInfo.fullName) ownerErrors.push('Nome Completo');
    if (!formData.ownerInfo.document) ownerErrors.push('Documento (CPF/CNPJ)');
    if (!formData.ownerInfo.phone) ownerErrors.push('Telefone');
    if (ownerErrors.length > 0) {
      errors.ownerInfo = ownerErrors;
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessages = [];
      if (errors.vehicleInfo) {
        errorMessages.push(`Informações do Veículo: ${errors.vehicleInfo.join(', ')}`);
      }
      if (errors.ownerInfo) {
        errorMessages.push(`Informações do Proprietário: ${errors.ownerInfo.join(', ')}`);
      }
      
      toast.error(
        <div className="space-y-2">
          <p className="font-medium">Por favor, preencha os campos obrigatórios:</p>
          {errorMessages.map((msg, index) => (
            <p key={index} className="text-sm">• {msg}</p>
          ))}
        </div>,
        {
          autoClose: 5000,
          style: { maxWidth: '100%', width: 'auto' }
        }
      );
      return false;
    }

    return true;
  };

  const generatePDF = async () => {
    if (!validateRequiredFields()) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Vistoria Veicular', 105, yPos, { align: 'center' });
    yPos += 20;

    // Informações do Veículo
    doc.setFontSize(16);
    doc.text('Informações do Veículo', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Placa: ${formData.vehicleInfo.plate}`, 20, yPos);
    yPos += 7;
    doc.text(`Modelo: ${formData.vehicleInfo.model}`, 20, yPos);
    yPos += 7;
    doc.text(`Ano: ${formData.vehicleInfo.year}`, 20, yPos);
    yPos += 7;
    doc.text(`Cor: ${formData.vehicleInfo.color}`, 20, yPos);
    yPos += 7;
    doc.text(`Chassi: ${formData.vehicleInfo.chassis}`, 20, yPos);
    yPos += 15;

    // Informações do Proprietário
    doc.setFontSize(16);
    doc.text('Informações do Proprietário', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Nome: ${formData.ownerInfo.fullName}`, 20, yPos);
    yPos += 7;
    doc.text(`${getDocumentType(formData.ownerInfo.document)}: ${formData.ownerInfo.document}`, 20, yPos);
    yPos += 7;
    doc.text(`Telefone: ${formData.ownerInfo.phone}`, 20, yPos);
    yPos += 7;
    doc.text(`Endereço: ${formData.ownerInfo.address}`, 20, yPos);
    yPos += 15;

    // Checklist
    doc.setFontSize(16);
    doc.text('Checklist da Vistoria', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);

    // Agrupar itens por categoria
    const groupedItems = formData.checklist.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);

    // Adicionar cada categoria e seus itens
    Object.entries(groupedItems).forEach(([category, items]) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(category, 20, yPos);
      yPos += 10;
      doc.setFontSize(12);

      items.forEach(item => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`[${item.checked ? 'X' : ' '}] ${item.label}`, 25, yPos);
        yPos += 7;
      });

      // Adicionar observações da categoria
      if (categoryObservations[category]) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text('Observações:', 25, yPos);
        yPos += 7;
        const splitText = doc.splitTextToSize(categoryObservations[category], 170);
        doc.text(splitText, 30, yPos);
        yPos += (splitText.length * 7) + 5;
      }
      yPos += 5;
    });

    // Status da Vistoria
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.text('Status da Vistoria', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Status: ${statusLabels[formData.status] || formData.status}`, 20, yPos);
    yPos += 15;

    // Observações Gerais
    if (formData.generalObservations) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.text('Observações Gerais', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(formData.generalObservations, 170);
      doc.text(splitText, 20, yPos);
      yPos += (splitText.length * 7) + 15;
    }

    // Assinaturas
    if (formData.technicianSignature || formData.clientSignature) {
      if (yPos > 200) { // Usar 200 em vez de 250 para garantir espaço para as assinaturas
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.text('Assinaturas', 20, yPos);
      yPos += 15;

      const addSignature = async (signature: string, label: string, xPos: number) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = signature;
          img.onload = () => {
            // Calcular dimensões mantendo proporção e limitando altura
            const maxHeight = 40;
            let width = img.width;
            let height = img.height;
            
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            doc.addImage(signature, 'PNG', xPos, yPos, width, height);
            doc.setFontSize(10);
            doc.text(label, xPos, yPos + height + 5);
            resolve();
          };
        });
      };

      const addSignatures = async () => {
        const promises = [];
        
        if (formData.technicianSignature) {
          promises.push(addSignature(formData.technicianSignature, 'Assinatura do Técnico', 20));
        }
        
        if (formData.clientSignature) {
          promises.push(addSignature(formData.clientSignature, 'Assinatura do Cliente', 110));
        }

        await Promise.all(promises);
      };

      await addSignatures();
      yPos += 60; // Espaço para as assinaturas + labels
    }

    // Fotos
    if (formData.photos.length > 0) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.text('Fotos da Vistoria', 105, yPos, { align: 'center' });
      yPos += 15;

      // Função para adicionar imagem com dimensões máximas
      const addImageWithMaxDimensions = async (file: File, maxWidth: number, maxHeight: number) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          
          img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calcular as dimensões proporcionais
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            doc.addImage(url, 'JPEG', (210 - width) / 2, yPos, width, height);
            URL.revokeObjectURL(url); // Liberar a URL após usar
            resolve();
          };

          img.src = url;
        });
      };

      // Adicionar cada foto em uma nova página
      const addPhotos = async () => {
        for (let i = 0; i < formData.photos.length; i++) {
          if (i > 0) {
            doc.addPage();
            yPos = 20;
          }
          await addImageWithMaxDimensions(formData.photos[i], 170, 220);
        }

        // Salvar o PDF após adicionar todas as fotos
        doc.save('relatorio-vistoria.pdf');
        toast.success('Relatório gerado com sucesso!');
        setIsPreviewOpen(false);
      };

      // Iniciar o processo de adicionar as fotos
      addPhotos();
      return; // Retornar aqui pois o PDF será salvo após adicionar as fotos
    }

    // Se não houver fotos, salvar o PDF diretamente
    doc.save('relatorio-vistoria.pdf');
    toast.success('Relatório gerado com sucesso!');
    setIsPreviewOpen(false);
  };

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar a vistoria? Todos os dados serão perdidos.')) {
      setFormData({
        vehicleInfo: {
          plate: '',
          model: '',
          year: 2024,
          color: '',
          chassis: '',
          vehicleType: '',
        },
        ownerInfo: {
          fullName: '',
          document: '',
          phone: '',
          address: '',
        },
        checklist: initialChecklist,
        status: 'pending',
        photos: [],
        generalObservations: '',
        technicianSignature: '',
        clientSignature: '',
        categoryObservations: {},
      });
      setCategoryObservations({});
      toast.info('Vistoria cancelada');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    if (!validateRequiredFields()) return;
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold heading-gradient mb-2">
            Formulário de Vistoria Veicular
          </h1>
          <p className="text-gray-500">
            Preencha todos os campos necessários para realizar a vistoria
          </p>
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Por favor, corrija os seguintes campos:</p>
              <ul className="mt-2 text-sm list-disc list-inside">
                {validationErrors.vehicleInfo && (
                  <li>
                    Informações do Veículo: {validationErrors.vehicleInfo.join(', ')}
                  </li>
                )}
                {validationErrors.ownerInfo && (
                  <li>
                    Informações do Proprietário: {validationErrors.ownerInfo.join(', ')}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Grid de Seções */}
        <div className="space-y-8">
          {/* Linha 1: Informações Veículo e Proprietário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações do Veículo */}
            <section className={`card animate-slide-up ${validationErrors.vehicleInfo ? 'ring-2 ring-red-500' : ''}`}>
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Car className="h-6 w-6 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informações do Veículo
                    </h2>
                  </div>
                  {validationErrors.vehicleInfo && (
                    <span className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      Campos obrigatórios
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                <VehicleInfo
                  data={formData.vehicleInfo}
                  onChange={(vehicleInfo) =>
                    setFormData((prev) => ({ ...prev, vehicleInfo }))
                  }
                  errors={validationErrors.vehicleInfo}
                />
              </div>
            </section>

            {/* Informações do Proprietário */}
            <section className={`card animate-slide-up ${validationErrors.ownerInfo ? 'ring-2 ring-red-500' : ''}`}>
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-indigo-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informações do Proprietário
                    </h2>
                  </div>
                  {validationErrors.ownerInfo && (
                    <span className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      Campos obrigatórios
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                <OwnerInfo
                  data={formData.ownerInfo}
                  onChange={(ownerInfo) =>
                    setFormData((prev) => ({ ...prev, ownerInfo }))
                  }
                  errors={validationErrors.ownerInfo}
                />
              </div>
            </section>
          </div>

          {/* Linha 2: Checklist */}
          <section className="card animate-slide-up">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Checklist da Vistoria
                </h2>
              </div>
            </div>
            <div className="card-body">
              <Checklist
                items={formData.checklist}
                onChange={(checklist) =>
                  setFormData((prev) => ({ ...prev, checklist }))
                }
                categoryObservations={categoryObservations}
                onCategoryObservationChange={handleCategoryObservationChange}
              />
            </div>
          </section>

          {/* Linha 3: Fotos e Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload de Fotos */}
            <section className="card animate-slide-up">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Camera className="h-6 w-6 text-indigo-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Fotos do Veículo
                  </h2>
                </div>
              </div>
              <div className="card-body">
                <PhotoUpload
                  photos={formData.photos}
                  onChange={(photos) =>
                    setFormData((prev) => ({ ...prev, photos }))
                  }
                />
              </div>
            </section>

            {/* Status da Vistoria */}
            <section className="card animate-slide-up">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-indigo-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Status da Vistoria
                  </h2>
                </div>
              </div>
              <div className="card-body">
                <InspectionStatus
                  status={formData.status as InspectionStatusType}
                  onChange={(status) =>
                    setFormData((prev) => ({ ...prev, status }))
                  }
                  generalObservations={formData.generalObservations}
                  onGeneralObservationsChange={(observations: string) =>
                    setFormData((prev) => ({ ...prev, generalObservations: observations }))
                  }
                />
              </div>
            </section>
          </div>

          {/* Linha 4: Assinaturas */}
          <section className="card animate-slide-up">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Clipboard className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Assinaturas
                </h2>
              </div>
            </div>
            <div className="card-body">
              <Signatures
                technicianSignature={formData.technicianSignature}
                clientSignature={formData.clientSignature}
                onChange={(technicianSignature, clientSignature) =>
                  setFormData((prev) => ({
                    ...prev,
                    technicianSignature,
                    clientSignature,
                  }))
                }
              />
            </div>
          </section>
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="btn-secondary"
          >
            <Download className="h-5 w-5 mr-2" />
            Visualizar PDF
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
          >
            <Clipboard className="h-5 w-5 mr-2" />
            Finalizar Vistoria
          </button>
        </div>
      </div>

      {/* Modal de Preview */}
      {isPreviewOpen && (
        <PreviewModal
          formData={formData}
          onClose={() => setIsPreviewOpen(false)}
          onGenerate={generatePDF}
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
} 