import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Pencil } from 'lucide-react';

interface SignaturesProps {
  technicianSignature: string;
  clientSignature: string;
  onChange: (technicianSignature: string, clientSignature: string) => void;
  isPDF?: boolean;
  pdfStyles?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    signatureBorderColor?: string;
  };
}

interface SignaturePadProps {
  label: string;
  value: string;
  onChange: (signature: string) => void;
  isPDF?: boolean;
  pdfStyles?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    signatureBorderColor?: string;
  };
}

const defaultPDFStyles = {
  backgroundColor: '#f8fafc',
  borderColor: '#e2e8f0',
  textColor: '#1e293b',
  signatureBorderColor: '#94a3b8'
};

function SignaturePad({ 
  label, 
  value, 
  onChange, 
  isPDF = false,
  pdfStyles = defaultPDFStyles 
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      onChange('');
    }
  };

  const handleEnd = () => {
    if (signatureRef.current) {
      const isCanvasEmpty = signatureRef.current.isEmpty();
      setIsEmpty(isCanvasEmpty);
      if (!isCanvasEmpty) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = signatureRef.current.toDataURL();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          canvas.width = 300;
          canvas.height = 300 / aspectRatio;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            onChange(canvas.toDataURL('image/png', 0));
          }
        };
      }
    }
  };

  if (isPDF && value) {
    const styles = { ...defaultPDFStyles, ...pdfStyles };
    return (
      <div 
        className="flex flex-col items-center rounded-xl overflow-hidden shadow-lg"
        style={{ backgroundColor: styles.backgroundColor }}
      >
        <div 
          className="w-full p-6"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <img 
            src={value} 
            alt={label}
            className="w-[250px] h-auto object-contain mx-auto" 
          />
        </div>
        <div 
          className="w-full p-4"
          style={{ 
            borderTop: `2px solid ${styles.signatureBorderColor}`,
            backgroundColor: styles.backgroundColor 
          }}
        >
          <p 
            className="text-center text-sm font-semibold"
            style={{ color: styles.textColor }}
          >
            {label}
          </p>
          <p 
            className="text-center text-xs mt-1 font-medium"
            style={{ color: styles.textColor }}
          >
            Assinado Digitalmente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-indigo-600" />
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        
      </div>
      <div className="border-2 border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        {value ? (
          <>
            <div className="relative flex justify-center items-center p-6 bg-gradient-to-b from-white to-indigo-50/30">
              <img 
                src={value} 
                alt={label} 
                className="w-[400px] h-auto object-contain shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg cursor-pointer"
                onClick={() => onChange('')}
              />
            </div>
            <div className="text-xs text-gray-600 p-4 bg-gradient-to-b from-indigo-50/30 to-indigo-50/50 border-t border-indigo-100 space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Clique e arraste para assinar
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Clique na imagem da assinatura para refazê-la
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center p-6 bg-gradient-to-b from-white to-indigo-50/30">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-[300px] h-[150px] bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
                  style: { 
                    width: '90%', 
                    height: '200px',
                    backgroundColor: '#fff'
                  }
                }}
                onEnd={handleEnd}
              />
            </div>
            <div className="text-xs text-gray-600 p-4 bg-gradient-to-b from-indigo-50/30 to-indigo-50/50 border-t border-indigo-100 space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Clique e arraste para assinar
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Clique na imagem da assinatura para refazê-la
              </p>
            </div>
          </>
        )}
      </div>
      {isEmpty && !value && (
        <p className="text-sm text-indigo-600 text-center bg-indigo-50 py-2 px-4 rounded-full inline-block mx-auto">
          Clique e arraste para assinar
        </p>
      )}
    </div>
  );
}

export function Signatures({ 
  technicianSignature, 
  clientSignature, 
  onChange, 
  isPDF = false,
  pdfStyles = defaultPDFStyles 
}: SignaturesProps) {
  return (
    <section 
      className={`${
        isPDF 
          ? 'rounded-xl overflow-hidden' 
          : 'bg-white shadow-lg rounded-xl p-8 border border-indigo-100'
      }`}
      style={isPDF ? { backgroundColor: pdfStyles.backgroundColor } : {}}
    >
      {!isPDF && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Assinaturas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Capture as assinaturas digitais necessárias
          </p>
        </div>
      )}
      <div 
        className={`${
          isPDF 
            ? 'grid grid-cols-2 gap-8 p-6 rounded-xl' 
            : 'grid grid-cols-1 gap-8 sm:grid-cols-2'
        }`}
        style={isPDF ? { 
          backgroundColor: '#FFFFFF',
          border: `1px solid ${pdfStyles.borderColor}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        } : {}}
      >
        <SignaturePad
          label="Assinatura do Técnico"
          value={technicianSignature}
          onChange={(newSignature) => onChange(newSignature, clientSignature)}
          isPDF={isPDF}
          pdfStyles={pdfStyles}
        />
        <SignaturePad
          label="Assinatura do Cliente"
          value={clientSignature}
          onChange={(newSignature) => onChange(technicianSignature, newSignature)}
          isPDF={isPDF}
          pdfStyles={pdfStyles}
        />
      </div>
    </section>
  );
} 