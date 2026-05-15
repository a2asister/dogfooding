import React, { useState } from 'react';
import { CreateSeriesRequest } from '../types';

interface CreateSeriesFormProps {
  onSubmit: (data: CreateSeriesRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateSeriesRequest>;
  isEditing?: boolean;
}

export const CreateSeriesForm: React.FC<CreateSeriesFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateSeriesRequest>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    formula: initialData?.formula || 'sin(x) + 0.5 * cos(2 * x)',
    parameters: initialData?.parameters || {},
    start: initialData?.start ?? -10,
    end: initialData?.end ?? 10,
    step: initialData?.step ?? 0.5,
  });

  const [useManualPoints, setUseManualPoints] = useState(!initialData?.formula);
  const [manualPoints, setManualPoints] = useState(
    initialData?.points?.map((p) => `${p.x},${p.y}`).join('\n') || '0,1\n1,2\n2,1\n3,3\n4,2',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useManualPoints) {
      const points = manualPoints
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => {
          const [x, y] = line.split(',').map(Number);
          return { x, y };
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));
      onSubmit({ ...formData, points });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Series Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg transition-all"
            placeholder="Enter series name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-lg transition-all"
            placeholder="Enter description"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!useManualPoints}
            onChange={() => setUseManualPoints(false)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm text-gray-300">Use Formula</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={useManualPoints}
            onChange={() => setUseManualPoints(true)}
            className="w-4 h-4 accent-indigo-500"
          />
          <span className="text-sm text-gray-300">Manual Points</span>
        </label>
      </div>

      {!useManualPoints ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Formula</label>
            <input
              type="text"
              value={formData.formula || ''}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              className="w-full px-4 py-3 rounded-lg transition-all font-mono"
              placeholder="e.g., sin(x) + cos(2*x), x^2, exp(-x/5)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported: sin, cos, tan, exp, log, sqrt, pow, abs, +, -, *, /, ^, ()
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start X</label>
              <input
                type="number"
                step="any"
                value={formData.start ?? ''}
                onChange={(e) => setFormData({ ...formData, start: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End X</label>
              <input
                type="number"
                step="any"
                value={formData.end ?? ''}
                onChange={(e) => setFormData({ ...formData, end: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Step</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={formData.step ?? ''}
                onChange={(e) => setFormData({ ...formData, step: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data Points (x,y format, one per line)
          </label>
          <textarea
            value={manualPoints}
            onChange={(e) => setManualPoints(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg transition-all font-mono text-sm"
            placeholder="0,1&#10;1,2&#10;2,1&#10;3,3&#10;4,2"
          />
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-lg text-white font-medium btn-primary"
        >
          {isEditing ? 'Update Series' : 'Create Series'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg text-gray-300 font-medium btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
