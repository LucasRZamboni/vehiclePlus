import React from 'react';
import { CheckSquare, Check, AlertCircle } from 'lucide-react';
import { ChecklistItem } from '../../types';

interface ChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  categoryObservations: Record<string, string>;
  onCategoryObservationChange: (category: string, observation: string) => void;
}

export function Checklist({ 
  items, 
  onChange, 
  categoryObservations,
  onCategoryObservationChange 
}: ChecklistProps) {
  const handleChange = (index: number, checked: boolean) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      checked,
    };
    onChange(newItems);
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Calculate progress for each category
  const categoryProgress = Object.entries(groupedItems).reduce((acc, [category, items]) => {
    const total = items.length;
    const checked = items.filter(item => item.checked).length;
    acc[category] = {
      percentage: (checked / total) * 100,
      checked,
      total
    };
    return acc;
  }, {} as Record<string, { percentage: number; checked: number; total: number }>);

  // Organize categories in the desired order
  const categoryOrder = [
    ["Informações Gerais do Veículo", "Condições Externas"],
    ["Condições Internas", "Parte Mecânica e Funcionamento"],
    ["Documentação e Procedência"]
  ];

  return (
    <div className="space-y-8">
      {categoryOrder.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {row.map((category) => (
            category && groupedItems[category] ? (
              <div key={category} className={`card animate-fade-in ${row.length === 1 ? 'lg:col-span-2' : ''}`}>
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {categoryProgress[category].checked}/{categoryProgress[category].total}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${categoryProgress[category].percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 gap-4">
                    {groupedItems[category].map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                          item.checked 
                            ? 'border-indigo-200 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                            item.checked 
                              ? 'bg-indigo-500 text-white' 
                              : 'border-2 border-gray-300 hover:border-indigo-400'
                          }`}
                          onClick={() => handleChange(items.indexOf(item), !item.checked)}
                        >
                          {item.checked && <Check className="h-3 w-3" />}
                        </div>
                        <label className="flex-1 text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleChange(items.indexOf(item), !item.checked)}>
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <AlertCircle className="h-4 w-4 text-indigo-500" />
                      Observações da Categoria
                    </label>
                    <textarea
                      value={categoryObservations[category] || ''}
                      onChange={(e) => onCategoryObservationChange(category, e.target.value)}
                      className="input resize-none"
                      rows={3}
                      placeholder={`Digite observações para ${category.toLowerCase()}...`}
                    />
                  </div>
                </div>
              </div>
            ) : null
          ))}
        </div>
      ))}
    </div>
  );
} 