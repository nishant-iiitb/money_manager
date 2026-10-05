import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  Palette,
  Layers,
} from 'lucide-react';
import { CustomCategory } from '../types/finance';
import { CategoryIcon, ICON_MAP } from './CategoryIcon';
import { formatINR } from '../utils/formatters';

interface CustomCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onAddCategory: (cat: Omit<CustomCategory, 'id'>) => void;
  onUpdateCategory: (cat: CustomCategory) => void;
  onDeleteCategory: (id: string) => void;
}

const COLOR_PRESETS = [
  '#38bdf8', // Sky
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#e11d48', // Rose
];

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const CustomCategoriesModal: React.FC<CustomCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ec4899');
  const [iconName, setIconName] = useState('Heart');
  const [monthlyTargetStr, setMonthlyTargetStr] = useState('5000');
  const [isFormVisible, setIsFormVisible] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingCatId(null);
    setName('');
    setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    setIconName('Tag');
    setMonthlyTargetStr('5000');
    setIsFormVisible(true);
  };

  const handleStartEdit = (cat: CustomCategory) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIconName(cat.iconName || 'Tag');
    setMonthlyTargetStr(cat.monthlyTarget?.toString() || '');
    setIsFormVisible(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const monthlyTarget = parseFloat(monthlyTargetStr) || undefined;

    if (editingCatId) {
      const existing = categories.find((c) => c.id === editingCatId);
      if (existing) {
        onUpdateCategory({
          ...existing,
          name: name.trim(),
          color,
          iconName,
          monthlyTarget,
        });
      }
    } else {
      onAddCategory({
        name: name.trim(),
        color,
        iconName,
        isDefault: false,
        monthlyTarget,
      });
    }

    setIsFormVisible(false);
    setEditingCatId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Manage Budget Categories</h3>
              <p className="text-xs text-slate-400">
                Create custom categories with custom icons, colors & targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add Category Trigger */}
          {!isFormVisible && (
            <button
              onClick={handleStartCreate}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/70 hover:bg-emerald-950/20 text-slate-300 hover:text-emerald-400 font-semibold text-xs transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Custom Category</span>
            </button>
          )}

          {/* Form for Add / Edit */}
          {isFormVisible && (
            <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {editingCatId ? 'Edit Category' : 'New Custom Category'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stuti, Gaming, Gym, Pet Care, Workspaces"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 outline-hidden"
                  autoFocus
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Select Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIconName(ic)}
                      className={`p-2 rounded-xl border transition shrink-0 ${
                        iconName === ic
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition shrink-0 relative ${
                        color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Monthly Spending Target */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Monthly Target Budget (Optional INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={monthlyTargetStr}
                  onChange={(e) => setMonthlyTargetStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 outline-hidden font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Categories ({categories.length})
            </span>

            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-900/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{cat.name}</span>
                        {!cat.isDefault && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      {cat.monthlyTarget && (
                        <div className="text-[11px] text-slate-400">
                          Target: {formatINR(cat.monthlyTarget, false)}/mo
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom category "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
