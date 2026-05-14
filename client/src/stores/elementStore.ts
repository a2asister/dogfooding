import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Element, Favorite, Note, KnowledgeCategory } from '@/types/element';
import { elementApi, favoriteApi, noteApi, categoryApi } from '@/api';

export const useElementStore = defineStore('element', () => {
  const elements = ref<Element[]>([]);
  const favorites = ref<Favorite[]>([]);
  const notes = ref<Note[]>([]);
  const categories = ref<KnowledgeCategory[]>([]);
  const selectedElement = ref<Element | null>(null);
  const userId = ref('user_' + Date.now());

  const elementsByCategory = computed(() => {
    const groups: Record<string, Element[]> = {};
    elements.value.forEach(el => {
      const category = el.category || '其他';
      if (!groups[category]) groups[category] = [];
      groups[category].push(el);
    });
    return groups;
  });

  const favoriteElementIds = computed(() => 
    new Set(favorites.value.map(f => f.elementId))
  );

  async function fetchElements() {
    try {
      elements.value = await elementApi.getAll();
      if (elements.value.length === 0) {
        const defaultElements = [
          { atomicNumber: 1, symbol: 'H', name: '氢', atomicMass: 1.008, category: '非金属', group: 1, period: 1, color: '#ffffff' },
          { atomicNumber: 2, symbol: 'He', name: '氦', atomicMass: 4.003, category: '稀有气体', group: 18, period: 1, color: '#d9ffff' },
          { atomicNumber: 3, symbol: 'Li', name: '锂', atomicMass: 6.941, category: '碱金属', group: 1, period: 2, color: '#cc80ff' },
          { atomicNumber: 4, symbol: 'Be', name: '铍', atomicMass: 9.012, category: '碱土金属', group: 2, period: 2, color: '#c2ff00' },
          { atomicNumber: 5, symbol: 'B', name: '硼', atomicMass: 10.811, category: '类金属', group: 13, period: 2, color: '#ffb5b5' },
          { atomicNumber: 6, symbol: 'C', name: '碳', atomicMass: 12.011, category: '非金属', group: 14, period: 2, color: '#909090' },
          { atomicNumber: 7, symbol: 'N', name: '氮', atomicMass: 14.007, category: '非金属', group: 15, period: 2, color: '#3050f8' },
          { atomicNumber: 8, symbol: 'O', name: '氧', atomicMass: 15.999, category: '非金属', group: 16, period: 2, color: '#ff0d0d' },
          { atomicNumber: 9, symbol: 'F', name: '氟', atomicMass: 18.998, category: '卤素', group: 17, period: 2, color: '#90e050' },
          { atomicNumber: 10, symbol: 'Ne', name: '氖', atomicMass: 20.180, category: '稀有气体', group: 18, period: 2, color: '#b3e3f5' },
          { atomicNumber: 11, symbol: 'Na', name: '钠', atomicMass: 22.990, category: '碱金属', group: 1, period: 3, color: '#ab5cf2' },
          { atomicNumber: 12, symbol: 'Mg', name: '镁', atomicMass: 24.305, category: '碱土金属', group: 2, period: 3, color: '#8aff00' },
          { atomicNumber: 13, symbol: 'Al', name: '铝', atomicMass: 26.982, category: '贫金属', group: 13, period: 3, color: '#bfa6a6' },
          { atomicNumber: 14, symbol: 'Si', name: '硅', atomicMass: 28.086, category: '类金属', group: 14, period: 3, color: '#f0c8a0' },
          { atomicNumber: 15, symbol: 'P', name: '磷', atomicMass: 30.974, category: '非金属', group: 15, period: 3, color: '#ff8000' },
          { atomicNumber: 16, symbol: 'S', name: '硫', atomicMass: 32.065, category: '非金属', group: 16, period: 3, color: '#ffff30' },
          { atomicNumber: 17, symbol: 'Cl', name: '氯', atomicMass: 35.453, category: '卤素', group: 17, period: 3, color: '#1ff01f' },
          { atomicNumber: 18, symbol: 'Ar', name: '氩', atomicMass: 39.948, category: '稀有气体', group: 18, period: 3, color: '#80d1e3' },
          { atomicNumber: 19, symbol: 'K', name: '钾', atomicMass: 39.098, category: '碱金属', group: 1, period: 4, color: '#8f40d4' },
          { atomicNumber: 20, symbol: 'Ca', name: '钙', atomicMass: 40.078, category: '碱土金属', group: 2, period: 4, color: '#3dff00' },
        ];
        elements.value = await elementApi.bulkCreate(defaultElements);
      }
    } catch (error) {
      console.error('Failed to fetch elements:', error);
    }
  }

  async function fetchFavorites() {
    try {
      const favs = await favoriteApi.getByUser(userId.value);
      favs.forEach(fav => {
        if (!fav.element) {
          const element = elements.value.find(e => e.id === fav.elementId);
          if (element) {
            fav.element = element;
          }
        }
      });
      favorites.value = favs;
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }

  async function toggleFavorite(elementId: number) {
    try {
      if (favoriteElementIds.value.has(elementId)) {
        await favoriteApi.remove(userId.value, elementId);
        favorites.value = favorites.value.filter(f => f.elementId !== elementId);
      } else {
        const fav = await favoriteApi.add(userId.value, elementId);
        if (!fav.element) {
          const element = elements.value.find(e => e.id === elementId);
          if (element) {
            fav.element = element;
          }
        }
        favorites.value.push(fav);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }

  async function fetchNotes() {
    try {
      const notesData = await noteApi.getByUser(userId.value);
      notesData.forEach(note => {
        if (note.elementId && !note.element) {
          const element = elements.value.find(e => e.id === note.elementId);
          if (element) {
            note.element = element;
          }
        }
      });
      notes.value = notesData;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  }

  async function addNote(content: string, elementId?: number, categoryId?: number) {
    try {
      const note = await noteApi.create({ userId: userId.value, content, elementId, categoryId });
      if (elementId && !note.element) {
        const element = elements.value.find(e => e.id === elementId);
        if (element) {
          note.element = element;
        }
      }
      notes.value.unshift(note);
      return note;
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  }

  async function deleteNote(id: number) {
    try {
      await noteApi.remove(id);
      notes.value = notes.value.filter(n => n.id !== id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  async function fetchCategories() {
    try {
      categories.value = await categoryApi.getAll();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  async function addCategory(name: string, description?: string, color?: string) {
    try {
      const category = await categoryApi.create({ name, description, color });
      categories.value.push(category);
      return category;
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  }

  function selectElement(element: Element | null) {
    selectedElement.value = element;
  }

  return {
    elements,
    favorites,
    notes,
    categories,
    selectedElement,
    userId,
    elementsByCategory,
    favoriteElementIds,
    fetchElements,
    fetchFavorites,
    toggleFavorite,
    fetchNotes,
    addNote,
    deleteNote,
    fetchCategories,
    addCategory,
    selectElement,
  };
});
