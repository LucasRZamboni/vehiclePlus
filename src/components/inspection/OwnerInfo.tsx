import React, { useState } from 'react';
import { User, Phone, MapPin, Building2, UserSquare2, Search, Loader2 } from 'lucide-react';
import { OwnerInfo as OwnerInfoType } from '../../types';
import InputMask from 'react-input-mask';
import { toast } from 'react-hot-toast';

interface OwnerInfoProps {
  data: OwnerInfoType;
  onChange: (data: OwnerInfoType) => void;
  errors?: string[];
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  mask?: string;
  className?: string;
  error?: boolean;
  rightElement?: React.ReactNode;
}

interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
  erro?: boolean;
}

function InputField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon,
  mask,
  className = '',
  error = false,
  rightElement
}: InputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <div className={`${error ? 'text-red-400' : 'text-gray-600'}`}>
            {icon}
          </div>
        </div>
        {mask ? (
          <InputMask
            mask={mask}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input pl-12 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} ${rightElement ? 'pr-12' : ''}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input pl-12 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''} ${rightElement ? 'pr-12' : ''}`}
            placeholder={placeholder}
          />
        )}
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

export function OwnerInfo({ data, onChange, errors = [] }: OwnerInfoProps) {
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cep, setCep] = useState('');

  const handleChange = (field: keyof OwnerInfoType, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const getDocumentMask = () => {
    return documentType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99';
  };

  const getDocumentPlaceholder = () => {
    return documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';
  };

  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('CEP inválido');
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: AddressData = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      handleChange('address', formattedAddress);
      toast.success('Endereço encontrado!');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Nome Completo"
          value={data.fullName}
          onChange={(value) => handleChange('fullName', value)}
          placeholder="Digite o nome completo"
          icon={<User className="h-5 w-5" />}
          className="sm:col-span-2"
          error={errors.includes('Nome Completo')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {documentType === 'cpf' ? 'CPF' : 'CNPJ'}
          </label>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  checked={documentType === 'cpf'}
                  onChange={() => setDocumentType('cpf')}
                />
                <span className="ml-2 text-sm text-gray-700">CPF</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  checked={documentType === 'cnpj'}
                  onChange={() => setDocumentType('cnpj')}
                />
                <span className="ml-2 text-sm text-gray-700">CNPJ</span>
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className={`${errors.includes('Documento (CPF/CNPJ)') ? 'text-red-400' : 'text-gray-600'}`}>
                  {documentType === 'cpf' ? (
                    <UserSquare2 className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
              </div>
              <InputMask
                mask={getDocumentMask()}
                value={data.document}
                onChange={(e) => handleChange('document', e.target.value)}
                className={`input pl-12 ${errors.includes('Documento (CPF/CNPJ)') ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder={getDocumentPlaceholder()}
              />
            </div>
          </div>
        </div>

        <InputField
          label="Telefone"
          value={data.phone}
          onChange={(value) => handleChange('phone', value)}
          placeholder="(00) 00000-0000"
          icon={<Phone className="h-5 w-5" />}
          mask="(99) 99999-9999"
          error={errors.includes('Telefone')}
        />

        <div className="sm:col-span-2 space-y-4">
          <InputField
            label="CEP"
            value={cep}
            onChange={setCep}
            placeholder="00000-000"
            icon={<MapPin className="h-5 w-5" />}
            mask="99999-999"
            rightElement={
              <button
                type="button"
                onClick={searchCep}
                disabled={isLoadingCep}
                className="p-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 transition-colors"
              >
                {isLoadingCep ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            }
          />

          <InputField
            label="Endereço"
            value={data.address}
            onChange={(value) => handleChange('address', value)}
            placeholder="Digite o endereço completo"
            icon={<MapPin className="h-5 w-5" />}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
} 