import React, { useState, useEffect } from 'react';
import { Plant } from '../types';

interface PlantFormProps {
  plant?: Plant | null;
  onSubmit: (data: {
    name: string;
    species: string;
    note: string;
    avatarUrl: string;
    wateringDays: number;
    fertilizingDays: number;
    fertilizingEnabled: boolean;
    pruningDays: number;
    pruningEnabled: boolean;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlantForm({ plant, onSubmit, onCancel, isLoading }: PlantFormProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [note, setNote] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [wateringDays, setWateringDays] = useState(3);
  const [fertilizingDays, setFertilizingDays] = useState(14);
  const [fertilizingEnabled, setFertilizingEnabled] = useState(false);
  const [pruningDays, setPruningDays] = useState(30);
  const [pruningEnabled, setPruningEnabled] = useState(false);

  useEffect(() => {
    if (plant) {
      setName(plant.name);
      setSpecies(plant.species || '');
      setNote(plant.note || '');
      setAvatarUrl(plant.avatarUrl || '');
      setWateringDays(plant.careSchedule.watering.days);
      setFertilizingDays(plant.careSchedule.fertilizing.days);
      setFertilizingEnabled(plant.careSchedule.fertilizing.enabled);
      setPruningDays(plant.careSchedule.pruning.days);
      setPruningEnabled(plant.careSchedule.pruning.enabled);
    } else {
      setName('');
      setSpecies('');
      setNote('');
      setAvatarUrl('');
      setWateringDays(3);
      setFertilizingDays(14);
      setFertilizingEnabled(false);
      setPruningDays(30);
      setPruningEnabled(false);
    }
  }, [plant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      species: species.trim(),
      note: note.trim(),
      avatarUrl: avatarUrl.trim(),
      wateringDays,
      fertilizingDays,
      fertilizingEnabled,
      pruningDays,
      pruningEnabled
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
          绿植名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="例如：绿萝、多肉..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
          品种
        </label>
        <input
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="input-field"
          placeholder="例如：心叶蔓绿绒..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
          照片URL（可选）
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="input-field"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-plant-700 dark:text-plant-300 mb-1">
          备注（可选）
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-field resize-none"
          rows={2}
          placeholder="养护小贴士..."
        />
      </div>

      <div className="pt-2 border-t border-plant-100 dark:border-plant-800">
        <h3 className="text-sm font-medium text-plant-700 dark:text-plant-300 mb-3">
          养护周期设置
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span>💧</span>
              <span className="text-sm text-plant-700 dark:text-plant-300">浇水</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={wateringDays}
                onChange={(e) => setWateringDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 input-field text-center py-2"
              />
              <span className="text-sm text-plant-500 dark:text-plant-400">天</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span>🌾</span>
              <span className="text-sm text-plant-700 dark:text-plant-300">施肥</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fertilizingEnabled}
                onChange={(e) => setFertilizingEnabled(e.target.checked)}
                className="w-4 h-4 accent-plant-500"
              />
              {fertilizingEnabled && (
                <>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={fertilizingDays}
                    onChange={(e) => setFertilizingDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 input-field text-center py-2"
                  />
                  <span className="text-sm text-plant-500 dark:text-plant-400">天</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-plant-50 dark:bg-plant-800/30 rounded-xl">
            <div className="flex items-center gap-2">
              <span>✂️</span>
              <span className="text-sm text-plant-700 dark:text-plant-300">修剪</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pruningEnabled}
                onChange={(e) => setPruningEnabled(e.target.checked)}
                className="w-4 h-4 accent-plant-500"
              />
              {pruningEnabled && (
                <>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={pruningDays}
                    onChange={(e) => setPruningDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 input-field text-center py-2"
                  />
                  <span className="text-sm text-plant-500 dark:text-plant-400">天</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="secondary-btn"
          disabled={isLoading}
        >
          取消
        </button>
        <button
          type="submit"
          className="primary-btn"
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? '保存中...' : (plant ? '保存修改' : '添加绿植')}
        </button>
      </div>
    </form>
  );
}