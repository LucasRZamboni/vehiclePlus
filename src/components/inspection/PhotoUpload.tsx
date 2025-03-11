import React, { useCallback } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange([...photos, ...Array.from(e.target.files)]);
    }
  }, [photos, onChange]);

  const handleRemovePhoto = useCallback((index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  }, [photos, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      onChange([...photos, ...Array.from(e.dataTransfer.files)]);
    }
  }, [photos, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 p-6 transition-all duration-200 hover:bg-indigo-50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-indigo-400" aria-hidden="true" />
          <div className="mt-4">
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
            >
              <Camera className="h-5 w-5" />
              Selecionar Fotos
              <input
                id="photo-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </label>
            <p className="mt-2 text-sm text-gray-500">
              ou arraste e solte suas fotos aqui
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            PNG, JPG ou GIF • Máximo 10MB por arquivo
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-500" />
              Fotos Carregadas ({photos.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all duration-200"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2">
                  Foto {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 