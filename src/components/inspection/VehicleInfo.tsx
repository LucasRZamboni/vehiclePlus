import React from 'react';
import { Car, Hash, Calendar, Palette, Key, Truck } from 'lucide-react';
import { VehicleInfo as VehicleInfoType } from '../../types';

interface VehicleInfoProps {
  data: VehicleInfoType;
  onChange: (data: VehicleInfoType) => void;
  errors?: string[];
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  className?: string;
  error?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  className?: string;
  error?: boolean;
}

function InputField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  icon,
  className = '',
  error = false
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
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)}
          className={`input pl-12 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function SelectField({ 
  label, 
  value, 
  onChange, 
  options,
  icon,
  className = '',
  error = false
}: SelectFieldProps) {
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
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input pl-12 py-3 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
        >
          <option value="">Selecione o tipo</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function VehicleInfo({ data, onChange, errors = [] }: VehicleInfoProps) {
  const handleChange = (field: keyof VehicleInfoType, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const vehicleTypes = [
    { value: 'carro', label: 'Carro' },
    { value: 'moto', label: 'Moto' },
    { value: 'caminhao', label: 'Caminhão' },
    { value: 'van', label: 'Van' },
    { value: 'onibus', label: 'Ônibus' },
    { value: 'outro', label: 'Outro' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Placa"
          value={data.plate}
          onChange={(value) => handleChange('plate', value)}
          placeholder="ABC-1234"
          icon={<Car className="h-5 w-5" />}
          error={errors.includes('Placa')}
        />
        <InputField
          label="Modelo/Marca"
          value={data.model}
          onChange={(value) => handleChange('model', value)}
          placeholder="Ex: Onix/Chevrolet"
          icon={<Hash className="h-5 w-5" />}
          error={errors.includes('Modelo')}
        />
        <SelectField
          label="Tipo de Veículo"
          value={data.vehicleType}
          onChange={(value) => handleChange('vehicleType', value)}
          options={vehicleTypes}
          icon={<Truck className="h-5 w-5" />}
          error={errors.includes('Tipo de Veículo')}
        />
        <InputField
          label="Ano"
          value={data.year}
          onChange={(value) => handleChange('year', value)}
          placeholder="2024"
          type="number"
          icon={<Calendar className="h-5 w-5" />}
        />
        <InputField
          label="Cor"
          value={data.color}
          onChange={(value) => handleChange('color', value)}
          placeholder="Ex: Prata"
          icon={<Palette className="h-5 w-5" />}
        />
        <InputField
          label="Chassi"
          value={data.chassis}
          onChange={(value) => handleChange('chassis', value)}
          placeholder="Digite o número do chassi"
          icon={<Key className="h-5 w-5" />}
          className="sm:col-span-2"
          error={errors.includes('Chassi')}
        />
      </div>
    </div>
  );
} 