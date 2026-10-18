import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// ── PALETTE DEFINITIONS & CONSTANTS ──────────────────────────────────────────
const PALETTE = {
  GRAINS: '#C4736A',     // Terracotta / Warm Starch
  PROTEINS: '#D4537E',   // Crimson / Meat
  SAUCES: '#E8A020',     // Warm Amber / Sauce
  PRODUCE: '#6B8F71',    // Sage Green / Fresh
  FINISHES: '#888780',   // Slate Gray / Texture
  MUTED: '#9C9A96',      // Muted Gray
  DARK: '#2C2C2A',       // Charcoal
  HIGHLIGHT: '#FAC775'   // Cream
};

const STORAGE_KEY = 'culinaryEngineState_v12';

// DOMAIN CATEGORIES
const CATEGORIES = [
  { id: 'GRAINS', label: 'Grains, Breads & Starches', color: PALETTE.GRAINS },
  { id: 'PROTEINS', label: 'Proteins & Hearty Fillings', color: PALETTE.PROTEINS },
  { id: 'SAUCES', label: 'Sauces, Curries & Liquids', color: PALETTE.SAUCES },
  { id: 'PRODUCE', label: 'Fresh Produce, Pickles & Accents', color: PALETTE.PRODUCE },
  { id: 'FINISHES', label: 'Crunch, Toppings & Finishes', color: PALETTE.FINISHES },
];

const ARCHETYPES = {
  CANVAS: { id: 'CANVAS', label: 'Open Canvas (6 Slots)', maxSlots: 6 },
  HANDHELD: { id: 'HANDHELD', label: 'Handheld / Wrap (Vessel + Fillings + Accents)', maxSlots: 6 },
  BOWL: { id: 'BOWL', label: 'Noodle / Rice Bowl (Base + Sauce/Broth + Fillings)', maxSlots: 7 },
  DESSERT: { id: 'DESSERT', label: 'Plated Dessert (Base + Sauce/Gel + Finish)', maxSlots: 5 }
};

const ALLERGENS = ['Dairy', 'Gluten', 'Tree Nuts', 'Eggs', 'Sesame', 'Soy', 'Peanuts', 'Shellfish'];
const FLAVOR_TAGS = ['Sweet', 'Sour', 'Bitter', 'Floral', 'Smoky', 'Tangy', 'Earthy', 'Spicy', 'Rich', 'Citric', 'Tropical', 'Nutty'];
const PREDEFINED_TAGS = [...ALLERGENS, ...FLAVOR_TAGS, 'Vegan', 'Vegetarian', 'Gluten-Free', 'Crispy', 'Silky', 'Chilled', 'Hot'];

const PREDEFINED_INGREDIENT_TAGS = ['Fat', 'Acid', 'Sweetener', 'Protein', 'Allium', 'Aromatic', 'Herb', 'Spice', 'Dairy', 'Emulsifier', 'Binder', 'Raw', 'Cooked'];

const SEED_RECIPES = [
  {
    id: 'recipe-hibiscus-cheesecake',
    title: 'Smoked Hibiscus Yuzu Cheesecake Base with Dark Chocolate Ganache',
    tags: ['Dairy', 'Gluten', 'Eggs', 'Floral', 'Smoky', 'Tangy', 'Bitter', 'Sweet'],
    cat: 'DESSERT',
    bcg: 'STAR',
    chefNotes: 'Ensure the Yuzu curd is emulsified before adding to the ganache layer.',
    components: ['cheesecake-base', 'yuzu-curd', 'dark-choco-ganache', 'smoked-hibiscus-syrup']
  },
  {
    id: 'recipe-carnitas-taco',
    title: 'Pico de Gallo Slow-Cooked Carnitas Taco with Pickled Red Onions',
    tags: ['Rich', 'Tangy', 'Sour', 'Spicy', 'Gluten-Free'],
    cat: 'HANDHELD',
    bcg: 'STAR',
    chefNotes: 'Crisp carnitas in skillet prior to assembling soft corn tortilla.',
    components: ['taco-shell', 'carnitas', 'pico-de-gallo', 'pickled-red-onion']
  },
  {
    id: 'recipe-jasmine-mango-tart',
    title: 'Jasmine Mango Pâte Sucrée with Toasted Almond Praline',
    tags: ['Dairy', 'Gluten', 'Tree Nuts', 'Floral', 'Tropical', 'Nutty', 'Sweet'],
    cat: 'DESSERT',
    bcg: 'PLOWHORSE',
    chefNotes: 'Bake crust until lightly golden brown. Dust with almond powder while hot.',
    components: ['pate-sucree', 'mango-puree', 'jasmine-tea-infusion', 'almond-praline']
  }
];

const SEED_STATE = {
  categories: {
    GRAINS: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-grains-flatbreads', name: 'Flatbreads & Handheld Wraps', collapsed: false, comps: [
            { id: 'taco-shell', name: 'Taco Shell', time: 5, passive: 0, tags: ['Gluten-Free'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Soft corn or flour tortilla format.' },
            { id: 'burrito-wrap', name: 'Burrito Wrap', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Large flour tortilla or flatbread.' },
            { id: 'sandwich-bun', name: 'Sandwich / Brioche Bun', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
            { id: 'slider-bun', name: 'Slider Bun', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
            { id: 'pita-pocket', name: 'Pita Pocket / Naan', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Naan, pita, or lavash fold.' },
            { id: 'spring-roll-wrap', name: 'Spring Roll Wrapper', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Rice paper or crisp wrapper.' },
            { id: 'nacho-chip-base', name: 'Nacho Chips Base', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Crisp tortilla chip vessel.' }
          ]
        },
        {
          id: 'f-grains-rice', name: 'Rice & Grains', collapsed: false, comps: [
            {
              id: 'cilantro-lime-rice', name: 'Cilantro-Lime Rice', time: 15, passive: 20, tags: ['Vegan', 'Tangy'], dot: PALETTE.GRAINS,
              ingredients: [
                { qty: '200', unit: 'g', name: 'Jasmine Rice', tags: ['Cooked'] },
                { qty: '1', unit: 'bunch', name: 'Fresh Cilantro', tags: ['Herb', 'Aromatic'] },
                { qty: '2', unit: 'tbsp', name: 'Lime Juice', tags: ['Acid'] }
              ], notes: 'Fold herbs into cooked rice.'
            },
            { id: 'biryani-rice', name: 'Biryani Spiced Rice', time: 25, passive: 15, tags: ['Gluten-Free', 'Spicy'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Spiced rice base format.' },
            { id: 'risotto-grain-base', name: 'Risotto / Creamy Grain Base', time: 25, passive: 0, tags: ['Gluten-Free', 'Dairy', 'Rich'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Arborio, polenta, or grits bowl.' },
            { id: 'donburi-rice-bowl', name: 'Donburi Seasoned Rice', time: 10, passive: 0, tags: ['Gluten-Free'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Sushi rice or jasmine rice format.' }
          ]
        },
        {
          id: 'f-grains-noodles', name: 'Noodles & Pasta', collapsed: false, comps: [
            { id: 'ramen-noodles', name: 'Ramen Noodles', time: 10, passive: 0, tags: ['Gluten', 'Hot'], dot: PALETTE.GRAINS, ingredients: [{ qty: '180', unit: 'g', name: 'Alkaline Noodles', tags: ['Cooked'] }], notes: '' },
            { id: 'pad-thai-noodles', name: 'Pad Thai Rice Noodles', time: 12, passive: 0, tags: ['Gluten-Free', 'Nutty'], dot: PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Flat Rice Noodles', tags: ['Cooked'] }], notes: '' },
            { id: 'udon-noodles', name: 'Udon Noodles', time: 10, passive: 0, tags: ['Gluten', 'Silky'], dot: PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Udon Noodles', tags: ['Cooked'] }], notes: '' },
            { id: 'pasta-bowl', name: 'Fresh Pasta Format', time: 15, passive: 0, tags: ['Gluten'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Fresh egg pasta, fettuccine, or penne.' }
          ]
        },
        {
          id: 'f-grains-pastry', name: 'Pastry, Custards & Crusts', collapsed: false, comps: [
            {
              id: 'cheesecake-base', name: 'Cheesecake Custard Base', time: 20, passive: 180, tags: ['Dairy', 'Gluten', 'Sweet', 'Chilled'], dot: PALETTE.GRAINS,
              ingredients: [
                { qty: '250', unit: 'g', name: 'Cream Cheese', tags: ['Dairy', 'Fat', 'Emulsifier'] },
                { qty: '100', unit: 'g', name: 'Sugar', tags: ['Sweetener'] },
                { qty: '2', unit: 'pcs', name: 'Eggs', tags: ['Dairy', 'Protein', 'Binder'] }
              ], notes: 'Bake in water bath.'
            },
            {
              id: 'vanilla-panna-cotta', name: 'Panna Cotta', time: 10, passive: 240, tags: ['Dairy', 'Sweet', 'Silky'], dot: PALETTE.HIGHLIGHT,
              ingredients: [
                { qty: '300', unit: 'ml', name: 'Heavy Cream', tags: ['Dairy', 'Fat'] },
                { qty: '1', unit: 'tsp', name: 'Vanilla Bean Paste', tags: ['Aromatic', 'Sweetener'] }
              ], notes: 'Set with gelatin.'
            },
            {
              id: 'creme-brulee-base', name: 'Crème Brûlée', time: 15, passive: 60, tags: ['Dairy', 'Eggs', 'Sweet', 'Rich'], dot: PALETTE.GRAINS,
              ingredients: [{ qty: '4', unit: 'yolks', name: 'Egg Yolks', tags: ['Dairy', 'Protein', 'Fat', 'Emulsifier'] }], notes: ''
            },
            { id: 'pate-sucree', name: 'Pâte Sucrée Tart Shell', time: 20, passive: 30, tags: ['Dairy', 'Gluten', 'Sweet'], dot: PALETTE.GRAINS, ingredients: [], notes: 'Sweet shortcrust dough.' }
          ]
        }
      ]
    },
    PROTEINS: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-proteins-meats', name: 'Meats & Poultry', collapsed: false, comps: [
            {
              id: 'carnitas', name: 'Slow-Cooked Carnitas', time: 20, passive: 180, tags: ['Rich', 'Earthy'], dot: PALETTE.PROTEINS,
              ingredients: [
                { qty: '500', unit: 'g', name: 'Pork Shoulder', tags: ['Protein', 'Fat'] },
                { qty: '2', unit: 'pcs', name: 'Oranges', tags: ['Acid'] }
              ], notes: 'Shred and crisp in skillet.'
            },
            {
              id: 'carne-asada', name: 'Grilled Carne Asada', time: 15, passive: 60, tags: ['Smoky', 'Spicy'], dot: PALETTE.PROTEINS,
              ingredients: [{ qty: '400', unit: 'g', name: 'Flank Steak', tags: ['Protein'] }], notes: 'High heat sear to medium-rare.'
            }
          ]
        },
        {
          id: 'f-proteins-plant', name: 'Plant-Based & Legumes', collapsed: false, comps: [
            { id: 'adobo-tofu', name: 'Adobo Marinated Tofu', time: 15, passive: 30, tags: ['Vegan', 'Spicy'], dot: PALETTE.PROTEINS, ingredients: [{ qty: '350', unit: 'g', name: 'Extra Firm Tofu', tags: ['Protein', 'Raw'] }], notes: '' },
            { id: 'charro-beans', name: 'Stewed Charro Beans', time: 15, passive: 45, tags: ['Rich', 'Earthy'], dot: PALETTE.PROTEINS, ingredients: [{ qty: '250', unit: 'g', name: 'Pinto Beans', tags: ['Protein', 'Cooked'] }], notes: '' },
            { id: 'black-beans', name: 'Stewed Black Beans', time: 10, passive: 30, tags: ['Vegan', 'Earthy'], dot: PALETTE.PROTEINS, ingredients: [], notes: '' }
          ]
        }
      ]
    },
    SAUCES: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-sauces-savory', name: 'Savory Sauces, Curries & Broths', collapsed: false, comps: [
            { id: 'classic-bechamel', name: 'Classic Béchamel / Mornay', time: 15, passive: 0, tags: ['Dairy', 'Gluten', 'Rich'], dot: PALETTE.SAUCES, ingredients: [{ qty: '500', unit: 'ml', name: 'Whole milk', tags: ['Dairy', 'Fat'] }], notes: 'French Mother Sauce.' },
            { id: 'ragu-bolognese', name: 'Slow-Cooked Ragù Bolognese', time: 30, passive: 180, tags: ['Dairy', 'Rich', 'Earthy'], dot: PALETTE.SAUCES, ingredients: [{ qty: '250', unit: 'g', name: 'Ground beef', tags: ['Protein', 'Fat'] }], notes: '' },
            { id: 'red-curry-base', name: 'Red Curry Base', time: 15, passive: 30, tags: ['Spicy', 'Tropical', 'Rich'], dot: PALETTE.SAUCES, ingredients: [{ qty: '400', unit: 'ml', name: 'Coconut milk', tags: ['Fat', 'Emulsifier'] }], notes: '' },
            { id: 'mole-negro', name: 'Mole Negro', time: 45, passive: 120, tags: ['Smoky', 'Bitter', 'Rich', 'Spicy'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'san-marzano-marinara', name: 'San Marzano Marinara', time: 10, passive: 45, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.SAUCES, ingredients: [{ qty: '800', unit: 'g', name: 'San Marzano tomato', tags: ['Acid'] }], notes: '' },
            { id: 'carbonara-sauce', name: 'Carbonara Sauce', time: 10, passive: 0, tags: ['Dairy', 'Rich'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'cacio-e-pepe', name: 'Cacio e Pepe Base', time: 10, passive: 0, tags: ['Dairy', 'Spicy'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'peppercorn-sauce', name: 'Peppercorn Sauce', time: 10, passive: 0, tags: ['Rich', 'Spicy'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'beurre-blanc', name: 'Beurre Blanc', time: 10, passive: 0, tags: ['Dairy', 'Acid', 'Rich'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'vodka-sauce', name: 'Vodka Sauce', time: 10, passive: 0, tags: ['Dairy', 'Rich'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'butter-chicken-sauce', name: 'Butter Chicken Gravy', time: 15, passive: 30, tags: ['Dairy', 'Spicy', 'Rich'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'stew-curry-vessel', name: 'Stew / Curry Gravy Vessel', time: 20, passive: 0, tags: ['Hot', 'Spicy'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            { id: 'chowder-bisque-vessel', name: 'Chowder / Bisque Base', time: 15, passive: 0, tags: ['Dairy', 'Hot', 'Rich'], dot: PALETTE.SAUCES, ingredients: [], notes: '' }
          ]
        },
        {
          id: 'f-sauces-fruit-sweet', name: 'Fruit, Curds & Sweet Sauces', collapsed: false, comps: [
            { id: 'mango-puree', name: 'Mango Purée', time: 10, passive: 0, tags: ['Vegan', 'Tropical', 'Sweet'], dot: PALETTE.SAUCES, ingredients: [{ qty: '500', unit: 'g', name: 'Fresh Mango', tags: ['Sweetener', 'Raw'] }], notes: '' },
            { id: 'lychee-compote', name: 'Lychee Compote', time: 15, passive: 0, tags: ['Vegan', 'Floral', 'Sweet'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            {
              id: 'yuzu-curd', name: 'Yuzu Curd', time: 15, passive: 20, tags: ['Eggs', 'Dairy', 'Sour', 'Citric', 'Tangy'], dot: PALETTE.SAUCES,
              ingredients: [
                { qty: '100', unit: 'ml', name: 'Yuzu Juice', tags: ['Acid', 'Aromatic'] },
                { qty: '3', unit: 'pcs', name: 'Eggs', tags: ['Protein', 'Fat', 'Emulsifier'] }
              ], notes: ''
            },
            { id: 'raspberry-coulis', name: 'Raspberry Coulis', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sweet', 'Sour'], dot: PALETTE.SAUCES, ingredients: [], notes: '' },
            {
              id: 'dark-choco-ganache', name: 'Dark Chocolate Ganache', time: 12, passive: 30, tags: ['Dairy', 'Bitter', 'Sweet', 'Rich', 'Silky'], dot: PALETTE.SAUCES,
              ingredients: [
                { qty: '200', unit: 'g', name: '70% Dark Chocolate', tags: ['Fat', 'Sweetener'] },
                { qty: '200', unit: 'ml', name: 'Cream', tags: ['Dairy', 'Fat'] }
              ], notes: ''
            }
          ]
        }
      ]
    },
    PRODUCE: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-produce-fresh', name: 'Fresh Toppings & Pickles', collapsed: false, comps: [
            {
              id: 'pico-de-gallo', name: 'Pico de Gallo', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.PRODUCE,
              ingredients: [
                { qty: '2', unit: 'pcs', name: 'Roma Tomatoes', tags: ['Acid', 'Raw'] },
                { qty: '1/2', unit: 'pc', name: 'Red Onion', tags: ['Allium', 'Raw'] }
              ], notes: ''
            },
            { id: 'pickled-red-onion', name: 'Pickled Red Onions', time: 10, passive: 60, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'pc', name: 'Red Onion', tags: ['Allium', 'Acid'] }], notes: '' },
            { id: 'burrata-basil-oil', name: 'Burrata & Basil Oil', time: 5, passive: 0, tags: ['Dairy', 'Vegetarian', 'Silky', 'Rich'], dot: PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'ball', name: 'Burrata', tags: ['Dairy', 'Fat'] }], notes: '' },
            { id: 'butternut-squash-puree', name: 'Roasted Butternut Squash Puree', time: 15, passive: 40, tags: ['Vegan', 'Earthy', 'Sweet'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' }
          ]
        },
        {
          id: 'f-produce-condiments', name: 'Aromatics, Oils & Condiments', collapsed: false, comps: [
            { id: 'garlic-aioli-toum', name: 'Garlic Aïoli / Toum', time: 10, passive: 0, tags: ['Eggs', 'Tangy', 'Spicy'], dot: PALETTE.PRODUCE, ingredients: [{ qty: '4', unit: 'cloves', name: 'Garlic', tags: ['Allium', 'Aromatic'] }], notes: '' },
            { id: 'chili-crisp-sesame-oil', name: 'Chili Crisp & Sesame Oil', time: 15, passive: 15, tags: ['Vegan', 'Spicy', 'Smoky', 'Sesame'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' },
            { id: 'chimichurri-salsa', name: 'Chimichurri Salsa', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' },
            { id: 'pesto-genovese', name: 'Pesto Genovese', time: 10, passive: 0, tags: ['Dairy', 'Tree Nuts', 'Vegetarian', 'Earthy'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' },
            { id: 'aged-balsamic-reduction', name: 'Aged Balsamic Reduction', time: 5, passive: 20, tags: ['Vegan', 'Sweet', 'Tangy', 'Sour'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' },
            { id: 'jasmine-tea-infusion', name: 'Jasmine Tea Infusion', time: 5, passive: 15, tags: ['Vegan', 'Floral', 'Hot'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' },
            { id: 'smoked-hibiscus-syrup', name: 'Smoked Hibiscus Syrup', time: 20, passive: 30, tags: ['Vegan', 'Floral', 'Smoky', 'Tangy'], dot: PALETTE.PRODUCE, ingredients: [], notes: '' }
          ]
        }
      ]
    },
    FINISHES: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-finishes-crunch', name: 'Crunch & Finishing Elements', collapsed: false, comps: [
            { id: 'almond-praline', name: 'Toasted Almond Praline', time: 20, passive: 10, tags: ['Tree Nuts', 'Nutty', 'Sweet', 'Crispy'], dot: PALETTE.FINISHES, ingredients: [], notes: '' },
            { id: 'sesame-furikake', name: 'Toasted Sesame Furikake', time: 5, passive: 0, tags: ['Sesame', 'Crispy', 'Earthy'], dot: PALETTE.FINISHES, ingredients: [], notes: '' },
            { id: 'pancetta-crumbles', name: 'Crispy Pancetta Crumbles', time: 10, passive: 0, tags: ['Crispy', 'Rich'], dot: PALETTE.FINISHES, ingredients: [], notes: '' },
            { id: 'fried-shallot-crisps', name: 'Fried Shallots', time: 8, passive: 0, tags: ['Vegan', 'Crispy', 'Earthy'], dot: PALETTE.FINISHES, ingredients: [], notes: '' },
            { id: 'maldon-sea-salt-microgreens', name: 'Maldon Sea Salt & Microgreens', time: 2, passive: 0, tags: ['Vegan', 'Crispy'], dot: PALETTE.FINISHES, ingredients: [], notes: '' }
          ]
        }
      ]
    }
  },
  archetype: 'CANVAS',
  assembledComps: [],
  savedRecipes: [],
  nextId: 1000
};

export default function App() {
  const [appState, setAppState] = useState(() => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    return SEED_STATE;
  });

  const [currentTab, setCurrentTab] = useState('builder');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [dragItem, setDragItem] = useState(null);

  // Modals state
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [modalCompData, setModalCompData] = useState(null);
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Registry filter & search
  const [registryFilter, setRegistryFilter] = useState(null);
  const [registrySearch, setRegistrySearch] = useState('');

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }, [appState]);

  // Fast component lookup array
  const allComponents = useMemo(() => {
    const list = [];
    for (const catId of Object.keys(appState.categories)) {
      const catObj = appState.categories[catId];
      if (catObj.unfiled) {
        for (const c of catObj.unfiled) list.push({ ...c, category: catId, folderId: null });
      }
      for (const f of catObj.folders) {
        for (const c of f.comps) list.push({ ...c, category: catId, folderId: f.id });
      }
    }
    return list;
  }, [appState.categories]);

  const findComp = (id) => allComponents.find(c => c.id === id) || null;

  // Assembly calculations
  const assemblyComps = useMemo(() => {
    return (appState.assembledComps || []).map(findComp).filter(Boolean);
  }, [appState.assembledComps, allComponents]);

  const autoTitle = useMemo(() => {
    if (!assemblyComps.length) return '';
    return assemblyComps.map(c => c.name).join(' with ');
  }, [assemblyComps]);

  const inheritedMeta = useMemo(() => {
    const tags = [...new Set(assemblyComps.flatMap(c => c.tags || []))];
    const ingredientTags = [...new Set(assemblyComps.flatMap(c => (c.ingredients || []).flatMap(i => i.tags || [])))];
    return {
      tags,
      ingredientTags,
      allergens: tags.filter(t => ALLERGENS.includes(t)),
      flavors: tags.filter(t => FLAVOR_TAGS.includes(t)),
      dietTags: tags.filter(t => ['Vegan', 'Vegetarian', 'Gluten-Free'].includes(t)),
      totalTime: assemblyComps.reduce((s, c) => s + (c.time || 0) + (c.passive || 0), 0)
    };
  }, [assemblyComps]);

  // Actions
  const resetToDefaults = () => {
    if (window.confirm("Reset all custom components and recipes back to initial defaults?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAppState(SEED_STATE);
    }
  };

  const toggleCategory = (catId) => {
    setAppState(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catId]: { ...prev.categories[catId], collapsed: !prev.categories[catId].collapsed }
      }
    }));
  };

  const toggleFolder = (folderId) => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        const category = nextCategories[catId];
        const folderIndex = category.folders.findIndex(f => f.id === folderId);
        if (folderIndex !== -1) {
          const updatedFolders = [...category.folders];
          updatedFolders[folderIndex] = {
            ...updatedFolders[folderIndex],
            collapsed: !updatedFolders[folderIndex].collapsed
          };
          return { ...prev, categories: { ...nextCategories, [catId]: { ...category, folders: updatedFolders } } };
        }
      }
      return prev;
    });
  };

  const collapseAllCategories = () => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        nextCategories[catId] = {
          ...nextCategories[catId],
          collapsed: true,
          folders: nextCategories[catId].folders.map(f => ({ ...f, collapsed: true }))
        };
      }
      return { ...prev, categories: nextCategories };
    });
  };

  const expandAllCategories = () => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        nextCategories[catId] = {
          ...nextCategories[catId],
          collapsed: false,
          folders: nextCategories[catId].folders.map(f => ({ ...f, collapsed: false }))
        };
      }
      return { ...prev, categories: nextCategories };
    });
  };

  const addFolder = (catId) => {
    const nextId = 'f-' + catId.toLowerCase() + '-' + (appState.nextId + 1);
    const n = appState.categories[catId].folders.length + 1;
    setAppState(prev => ({
      ...prev,
      nextId: prev.nextId + 1,
      categories: {
        ...prev.categories,
        [catId]: {
          ...prev.categories[catId],
          folders: [...prev.categories[catId].folders, { id: nextId, name: 'New folder ' + n, collapsed: false, comps: [] }]
        }
      }
    }));
    setEditingFolderId(nextId);
  };

  const renameFolder = (folderId, name) => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        const folder = nextCategories[catId].folders.find(f => f.id === folderId);
        if (folder) {
          folder.name = name || folder.name;
          break;
        }
      }
      return { ...prev, categories: nextCategories };
    });
  };

  const deleteFolder = (folderId) => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      let compIdsToRemove = [];
      for (const catId in nextCategories) {
        const folder = nextCategories[catId].folders.find(f => f.id === folderId);
        if (folder) {
          compIdsToRemove = folder.comps.map(c => c.id);
          nextCategories[catId].folders = nextCategories[catId].folders.filter(f => f.id !== folderId);
          break;
        }
      }
      return {
        ...prev,
        categories: nextCategories,
        assembledComps: (prev.assembledComps || []).filter(id => !compIdsToRemove.includes(id))
      };
    });
  };

  const removeComp = (cid) => {
    setAppState(prev => {
      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        nextCategories[catId].unfiled = (nextCategories[catId].unfiled || []).filter(c => c.id !== cid);
        nextCategories[catId].folders.forEach(f => {
          f.comps = f.comps.filter(c => c.id !== cid);
        });
      }
      return {
        ...prev,
        categories: nextCategories,
        assembledComps: (prev.assembledComps || []).filter(id => id !== cid)
      };
    });
  };

  const addToAssembly = (cid) => {
    setAppState(prev => {
      const current = prev.assembledComps || [];
      if (current.includes(cid)) return prev;
      const maxSlots = ARCHETYPES[prev.archetype]?.maxSlots || 6;
      const updated = [...current];
      if (updated.length >= maxSlots) updated.shift();
      updated.push(cid);
      return { ...prev, assembledComps: updated };
    });
  };

  const removeFromAssembly = (cid) => {
    setAppState(prev => ({
      ...prev,
      assembledComps: (prev.assembledComps || []).filter(id => id !== cid)
    }));
  };

  const changeArchetype = (archKey) => {
    setAppState(prev => ({ ...prev, archetype: archKey }));
  };

  const onSaveRecipe = () => {
    const newRecipe = {
      id: 'recipe-' + autoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: autoTitle,
      tags: [...new Set(assemblyComps.flatMap(c => c.tags || []))],
      cat: appState.archetype,
      bcg: 'STAR',
      chefNotes: 'Created via Archetype Canvas Builder.',
      components: appState.assembledComps
    };

    setAppState(prev => ({
      ...prev,
      nextId: prev.nextId + 1,
      assembledComps: [],
      savedRecipes: [...prev.savedRecipes, newRecipe]
    }));
    setCurrentTab('recipes');
  };

  const openComponentModal = (compId = null, defaultCategory = 'GRAINS', defaultFolderId = null) => {
    const comp = compId ? findComp(compId) : {
      id: '', name: '', time: 0, passive: 0, tags: [], ingredients: [{ qty: '', unit: '', name: '', tags: [] }], notes: '', category: defaultCategory, folderId: defaultFolderId
    };
    setModalCompData({ ...comp, isEdit: !!compId });
    setCompModalOpen(true);
  };

  const saveComponentModal = (compFormData) => {
    if (!compFormData.name.trim()) {
      alert('Please provide a component name.');
      return;
    }

    setAppState(prev => {
      let nextId = prev.nextId;
      const generateShorthandId = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newId = compFormData.id.trim()
        ? generateShorthandId(compFormData.id)
        : (generateShorthandId(compFormData.name) || ('comp-' + (++nextId)));

      const nextCategories = { ...prev.categories };
      for (const catId in nextCategories) {
        nextCategories[catId].unfiled = (nextCategories[catId].unfiled || []).filter(c => c.id !== newId);
        nextCategories[catId].folders.forEach(f => {
          f.comps = f.comps.filter(c => c.id !== newId);
        });
      }

      const compData = {
        id: newId,
        name: compFormData.name.trim(),
        time: parseInt(compFormData.time, 10) || 0,
        passive: parseInt(compFormData.passive, 10) || 0,
        tags: compFormData.tags,
        dot: CATEGORIES.find(c => c.id === compFormData.category)?.color || PALETTE.MUTED,
        ingredients: compFormData.ingredients.filter(i => i.name.trim()),
        notes: compFormData.notes.trim()
      };

      if (compFormData.folderId) {
        for (const catId in nextCategories) {
          const folder = nextCategories[catId].folders.find(f => f.id === compFormData.folderId);
          if (folder) {
            folder.comps.push(compData);
            break;
          }
        }
      } else {
        if (!nextCategories[compFormData.category].unfiled) nextCategories[compFormData.category].unfiled = [];
        nextCategories[compFormData.category].unfiled.push(compData);
      }

      return { ...prev, nextId, categories: nextCategories };
    });

    setCompModalOpen(false);
  };

  const openDishModal = (recipe) => {
    setSelectedRecipe(recipe);
    setDishModalOpen(true);
  };

  const filteredRegistryComps = useMemo(() => {
    let comps = registryFilter ? allComponents.filter(c => c.category === registryFilter) : allComponents;
    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase().trim();
      comps = comps.filter(c => c.name.toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q)));
    }
    return comps;
  }, [allComponents, registryFilter, registrySearch]);

  const activeMaxSlots = ARCHETYPES[appState.archetype]?.maxSlots || 6;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <i className="ti ti-chef-hat" aria-hidden="true"></i>
            Culinary Engine
          </div>
          <nav className="nav">
            <button className={`ntab ${currentTab === 'builder' ? 'active' : ''}`} onClick={() => setCurrentTab('builder')}>
              <i className="ti ti-adjustments-horizontal" aria-hidden="true"></i> Dish builder
            </button>
            <button className={`ntab ${currentTab === 'registry' ? 'active' : ''}`} onClick={() => setCurrentTab('registry')}>
              <i className="ti ti-database" aria-hidden="true"></i> Component registry
            </button>
            <button className={`ntab ${currentTab === 'recipes' ? 'active' : ''}`} onClick={() => setCurrentTab('recipes')}>
              <i className="ti ti-book" aria-hidden="true"></i> Recipe library
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {/* BUILDER TAB */}
        {currentTab === 'builder' && (
          <div className="tab-content">
            <div className="cols">
              <aside className="sidebar">
                <div className="sb-header">
                  <span className="sb-title">Domain Library</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button className="fa-btn" title="Collapse All" onClick={collapseAllCategories} style={{ padding: '4px 6px', fontSize: '12px' }}>
                      <i className="ti ti-fold-up"></i>
                    </button>
                    <button className="fa-btn" title="Expand All" onClick={expandAllCategories} style={{ padding: '4px 6px', fontSize: '12px' }}>
                      <i className="ti ti-fold-down"></i>
                    </button>
                    <button className="sb-create-btn" onClick={() => openComponentModal()}>
                      <i className="ti ti-plus"></i> New
                    </button>
                  </div>
                </div>
                <div>
                  {CATEGORIES.map(cat => {
                    const cs = appState.categories[cat.id] || { collapsed: false, unfiled: [], folders: [] };
                    const unfiledCount = (cs.unfiled || []).length;
                    const total = cs.folders.reduce((s, f) => s + f.comps.length, 0) + unfiledCount;
                    return (
                      <div key={cat.id} className="role-section">
                        <div className="role-header" onClick={(e) => { if (!e.target.closest('.role-add')) toggleCategory(cat.id); }}>
                          <i className={`ti ti-chevron-right role-chevron ${cs.collapsed ? '' : 'open'}`}></i>
                          <div className="role-dot" style={{ background: cat.color }}></div>
                          <span className="role-name">{cat.label}</span>
                          <span className="role-count">{total}</span>
                          <button className="role-add" title="Add folder" onClick={(e) => { e.stopPropagation(); addFolder(cat.id); }}>
                            <i className="ti ti-folder-plus"></i>
                          </button>
                        </div>
                        {!cs.collapsed && (
                          <div className="role-body">
                            {cs.folders.map(f => (
                              <FolderItem
                                key={f.id}
                                folder={f}
                                categoryId={cat.id}
                                editingFolderId={editingFolderId}
                                setEditingFolderId={setEditingFolderId}
                                toggleFolder={toggleFolder}
                                renameFolder={renameFolder}
                                deleteFolder={deleteFolder}
                                openComponentModal={openComponentModal}
                                removeComp={removeComp}
                                addToAssembly={addToAssembly}
                                setDragItem={setDragItem}
                              />
                            ))}
                            {unfiledCount > 0 && (
                              <FolderItem
                                isUnfiled
                                folder={{ id: null, name: 'Unfiled', collapsed: false, comps: cs.unfiled }}
                                categoryId={cat.id}
                                openComponentModal={openComponentModal}
                                removeComp={removeComp}
                                addToAssembly={addToAssembly}
                                setDragItem={setDragItem}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <section className="builder">
                {/* Archetype Selector Banner */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--s0)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ti ti-layout-grid" style={{ color: PALETTE.SAUCES }}></i>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: PALETTE.DARK }}>Assembly Archetype:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {Object.keys(ARCHETYPES).map(key => (
                      <button
                        key={key}
                        className={`filter-pill ${appState.archetype === key ? 'on' : ''}`}
                        onClick={() => changeArchetype(key)}
                      >
                        {ARCHETYPES[key].label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="title-preview">
                  <div className="title-eyebrow">Auto-generated dish assembly</div>
                  <div className={`title-text ${assemblyComps.length === 0 ? 'empty' : ''}`}>
                    {assemblyComps.length > 0 ? autoTitle : 'Drag or click components to build dish'}
                  </div>
                  <div className="meta-row">
                    {inheritedMeta.totalTime > 0 && (
                      <span className="meta-chip time"><i className="ti ti-clock"></i> {inheritedMeta.totalTime} min total</span>
                    )}
                    {inheritedMeta.flavors.map(f => (
                      <span key={f} className="meta-chip flavor"><i className="ti ti-flame"></i> {f}</span>
                    ))}
                    {inheritedMeta.allergens.map(a => (
                      <span key={a} className="meta-chip allergen"><i className="ti ti-alert-triangle"></i> {a}</span>
                    ))}
                    {inheritedMeta.dietTags.map(d => (
                      <span key={d} className="meta-chip diet">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Open Canvas Dynamic Slots */}
                <div>
                  <div className="slot-label">
                    Assembled Components <span className="slot-hint">({assemblyComps.length} / {activeMaxSlots} max slots)</span>
                  </div>
                  <div
                    className="slot"
                    style={{ minHeight: '120px', display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', alignItems: 'flex-start' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragItem) addToAssembly(dragItem.id);
                    }}
                  >
                    {assemblyComps.map(c => (
                      <div key={c.id} className="slot-tag" style={{ padding: '6px 10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot || PALETTE.MUTED, flexShrink: 0 }}></div>
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>{c.name}</span>
                        <button className="rm" title="Remove" onClick={() => removeFromAssembly(c.id)}>×</button>
                      </div>
                    ))}
                    {assemblyComps.length === 0 && (
                      <div className="slot-empty" style={{ width: '100%', textAlign: 'center', padding: '24px 0' }}>
                        <i className="ti ti-drag-drop" aria-hidden="true"></i> Drag components or click from library to add to dish
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="slot-label">Inherited Dish Tags</div>
                  <div className="tag-grid">
                    {inheritedMeta.tags.length > 0 ? (
                      inheritedMeta.tags.map(t => (
                        <span key={t} className={`tag-pill ${ALLERGENS.includes(t) ? 'allergen' : ''} ${FLAVOR_TAGS.includes(t) ? 'flavor' : ''}`}>{t}</span>
                      ))
                    ) : (
                      <span className="tags-placeholder">Rolls up automatically from components</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="slot-label">Functional Ingredient Profile</div>
                  <div className="tag-grid">
                    {inheritedMeta.ingredientTags.length > 0 ? (
                      inheritedMeta.ingredientTags.map(t => (
                        <span key={t} className="ing-tag-pill">#{t}</span>
                      ))
                    ) : (
                      <span className="tags-placeholder">Ingredient tags roll up automatically</span>
                    )}
                  </div>
                </div>

                <div className="save-row">
                  <button className="save-btn" disabled={assemblyComps.length === 0} onClick={onSaveRecipe}>
                    Save to library →
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* REGISTRY TAB */}
        {currentTab === 'registry' && (
          <div className="tab-content">
            <div className="tab-header">
              <h1 className="tab-title">Component registry</h1>
              <button className="btn-small" onClick={resetToDefaults}><i className="ti ti-refresh"></i> Reset Data</button>
            </div>

            <div className="filter-container">
              <div className="filter-bar">
                <span className="filter-label">Domain:</span>
                <button className={`filter-pill ${registryFilter === null ? 'on' : ''}`} onClick={() => setRegistryFilter(null)}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`filter-pill ${registryFilter === c.id ? 'on' : ''}`} onClick={() => setRegistryFilter(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="search-box">
                <i className="ti ti-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search components or tags..."
                  value={registrySearch}
                  onChange={e => setRegistrySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="reg-grid">
              {filteredRegistryComps.map(c => (
                <div key={c.id} className="recipe-card" onClick={() => openComponentModal(c.id)}>
                  <div>
                    <div className="rc-cat">{c.category} <span style={{ fontSize: '9px', opacity: 0.6 }}>({c.id})</span></div>
                    <div className="rc-title">{c.name}</div>
                    <div style={{ fontSize: '11px', color: PALETTE.MUTED, margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-clock"></i>{c.time}m active{c.passive ? ` + ${c.passive}m passive` : ''}
                    </div>
                  </div>
                  <div className="rc-tags">
                    {(c.tags || []).map(t => (
                      <span key={t} className={`rc-tag ${ALLERGENS.includes(t) ? 'allergen' : ''} ${FLAVOR_TAGS.includes(t) ? 'flavor' : ''}`}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="reg-add-card" onClick={() => openComponentModal(null, registryFilter || 'GRAINS')}>
                <div className="reg-add-btn"><i className="ti ti-plus"></i></div>
                <div className="reg-add-text">Add Component</div>
              </div>
            </div>
          </div>
        )}

        {/* RECIPES TAB */}
        {currentTab === 'recipes' && (
          <div className="tab-content">
            <div className="tab-header"><h1 className="tab-title">Recipe library</h1></div>
            {appState.savedRecipes.length + SEED_RECIPES.length === 0 ? (
              <div className="empty-state">
                <i className="ti ti-book-off" aria-hidden="true"></i>
                <p>Build a dish in the builder and save it here.</p>
              </div>
            ) : (
              <div className="recipe-grid">
                {[...SEED_RECIPES, ...appState.savedRecipes].map(r => (
                  <div key={r.id} className="recipe-card" onClick={() => openDishModal(r)}>
                    <div className="rc-cat">
                      <span>{r.cat}</span>
                      <span className={`bcg-badge bcg-${r.bcg}`}>{r.bcg}</span>
                    </div>
                    <div className="rc-title">{r.title}</div>
                    <div className="rc-tags">
                      {(r.tags || []).map(t => (
                        <span key={t} className={`rc-tag ${ALLERGENS.includes(t) ? 'allergen' : ''} ${FLAVOR_TAGS.includes(t) ? 'flavor' : ''}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* COMPONENT MODAL */}
      {compModalOpen && (
        <ComponentEditorModal
          data={modalCompData}
          categories={appState.categories}
          onClose={() => setCompModalOpen(false)}
          onSave={saveComponentModal}
        />
      )}

      {/* DISH DETAIL MODAL */}
      {dishModalOpen && selectedRecipe && (
        <DishDetailModal
          recipe={selectedRecipe}
          findComp={findComp}
          onClose={() => setDishModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function FolderItem({
  folder,
  categoryId,
  isUnfiled = false,
  editingFolderId,
  setEditingFolderId,
  toggleFolder,
  renameFolder,
  deleteFolder,
  openComponentModal,
  removeComp,
  addToAssembly,
  setDragItem
}) {
  const [folderNameVal, setFolderNameVal] = useState(folder.name);
  const isOpen = !folder.collapsed;

  const handleBlurOrEnter = () => {
    renameFolder(folder.id, folderNameVal.trim());
    setEditingFolderId(null);
  };

  return (
    <div className="folder">
      <div
        className="folder-header"
        onClick={(e) => {
          if (e.target.closest('.folder-actions, .folder-name-input')) return;
          if (!isUnfiled) toggleFolder(folder.id);
        }}
      >
        <i className={`ti ti-chevron-right folder-chevron ${isOpen ? 'open' : ''}`}></i>
        <i className={`ti ${isOpen ? 'ti-folder-open' : 'ti-folder'} folder-icon ${isOpen ? 'open' : ''}`}></i>

        {editingFolderId === folder.id && !isUnfiled ? (
          <input
            type="text"
            className="folder-name-input"
            value={folderNameVal}
            onChange={e => setFolderNameVal(e.target.value)}
            onBlur={handleBlurOrEnter}
            onKeyDown={e => {
              if (e.key === 'Enter') handleBlurOrEnter();
              if (e.key === 'Escape') setEditingFolderId(null);
            }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="folder-name">{folder.name}</span>
        )}

        <div className="folder-actions">
          <button
            className="fa-btn add"
            title="Add component"
            onClick={(e) => { e.stopPropagation(); openComponentModal(null, categoryId, folder.id); }}
          >
            <i className="ti ti-plus"></i>
          </button>
          {!isUnfiled && (
            <>
              <button
                className="fa-btn rename"
                title="Rename folder"
                onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); }}
              >
                <i className="ti ti-pencil"></i>
              </button>
              <button
                className="fa-btn"
                title="Delete folder"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete folder "${folder.name}"?`)) deleteFolder(folder.id);
                }}
              >
                <i className="ti ti-trash"></i>
              </button>
            </>
          )}
        </div>
      </div>

      {!folder.collapsed && (
        <div className="folder-body">
          {folder.comps.map(comp => (
            <div
              key={comp.id}
              className="comp-item"
              draggable
              onDragStart={() => setDragItem({ id: comp.id, category: categoryId })}
              onClick={(e) => {
                if (e.target.closest('.comp-actions')) return;
                addToAssembly(comp.id);
              }}
            >
              <div className="comp-dot" style={{ background: comp.dot || CATEGORIES.find(c => c.id === categoryId)?.color }}></div>
              <span className="comp-name" title={comp.name}>{comp.name}</span>
              <div className="comp-actions">
                <button className="comp-btn" title="Edit Component" onClick={(e) => { e.stopPropagation(); openComponentModal(comp.id); }}>
                  <i className="ti ti-pencil"></i>
                </button>
                <button className="comp-btn del" title="Remove Component" onClick={(e) => { e.stopPropagation(); removeComp(comp.id); }}>
                  <i className="ti ti-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentEditorModal({ data, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: data?.id || '',
    name: data?.name || '',
    category: data?.category || 'GRAINS',
    folderId: data?.folderId || '',
    time: data?.time || 0,
    passive: data?.passive || 0,
    tags: data?.tags || [],
    ingredients: data?.ingredients?.length ? data.ingredients.map(i => ({ ...i, tags: i.tags || [] })) : [{ qty: '', unit: '', name: '', tags: [] }],
    notes: data?.notes || ''
  });

  const [tagInput, setTagInput] = useState('');
  const [ingTagInputIndex, setIngTagInputIndex] = useState(null);
  const [ingTagVal, setIngTagVal] = useState('');

  const availableFolders = useMemo(() => {
    return categories[formData.category]?.folders || [];
  }, [categories, formData.category]);

  const handleIngChange = (index, field, val) => {
    const updated = [...formData.ingredients];
    updated[index][field] = val;
    setFormData({ ...formData, ingredients: updated });
  };

  const addIngTag = (index, tag) => {
    const updated = [...formData.ingredients];
    const currentTags = updated[index].tags || [];
    if (!currentTags.includes(tag)) {
      updated[index].tags = [...currentTags, tag];
      setFormData({ ...formData, ingredients: updated });
    }
  };

  const removeIngTag = (index, tag) => {
    const updated = [...formData.ingredients];
    updated[index].tags = (updated[index].tags || []).filter(t => t !== tag);
    setFormData({ ...formData, ingredients: updated });
  };

  const addIngRow = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { qty: '', unit: '', name: '', tags: [] }] });
  };

  const removeIngRow = (index) => {
    setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !formData.tags.includes(val)) {
        setFormData({ ...formData, tags: [...formData.tags, val] });
      }
      setTagInput('');
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">{data?.isEdit ? 'Edit Component' : 'Create Component'}</div>
          <button className="modal-close" onClick={onClose}><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Component Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Yuzu Curd"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Shorthand ID (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. yuzu-curd"
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Domain Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value, folderId: '' })}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Folder</label>
              <select
                className="form-select"
                value={formData.folderId}
                onChange={e => setFormData({ ...formData, folderId: e.target.value })}
              >
                <option value="">-- Unfiled / No Folder --</option>
                {availableFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Active Time (mins)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passive Time (mins)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.passive}
                onChange={e => setFormData({ ...formData, passive: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ingredients & Functional Tags</label>
            <table className="ing-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Qty</th>
                  <th style={{ width: '15%' }}>Unit</th>
                  <th style={{ width: '30%' }}>Ingredient</th>
                  <th style={{ width: '35%' }}>Functional Tags</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.ingredients.map((ing, i) => (
                  <tr key={i}>
                    <td><input type="text" value={ing.qty} placeholder="100" onChange={e => handleIngChange(i, 'qty', e.target.value)} /></td>
                    <td><input type="text" value={ing.unit} placeholder="g" onChange={e => handleIngChange(i, 'unit', e.target.value)} /></td>
                    <td><input type="text" value={ing.name} placeholder="Sugar" onChange={e => handleIngChange(i, 'name', e.target.value)} /></td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', alignItems: 'center' }}>
                        {(ing.tags || []).map(t => (
                          <span key={t} className="ing-tag-pill" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            #{t} <span style={{ cursor: 'pointer', marginLeft: '2px' }} onClick={() => removeIngTag(i, t)}>×</span>
                          </span>
                        ))}
                        {ingTagInputIndex === i ? (
                          <input
                            type="text"
                            style={{ width: '65px', fontSize: '10px', padding: '1px 3px' }}
                            placeholder="+Tag..."
                            value={ingTagVal}
                            onChange={e => setIngTagVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (ingTagVal.trim()) addIngTag(i, ingTagVal.trim());
                                setIngTagVal('');
                                setIngTagInputIndex(null);
                              }
                            }}
                            onBlur={() => {
                              if (ingTagVal.trim()) addIngTag(i, ingTagVal.trim());
                              setIngTagVal('');
                              setIngTagInputIndex(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className="btn-small"
                            style={{ padding: '1px 4px', fontSize: '9px', marginTop: 0 }}
                            onClick={() => setIngTagInputIndex(i)}
                          >
                            + Tag
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button type="button" className="comp-btn del" onClick={() => removeIngRow(i)}><i className="ti ti-x"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn-small" onClick={addIngRow}><i className="ti ti-plus"></i> Add row</button>
            <div style={{ fontSize: '10px', color: PALETTE.MUTED, marginTop: '4px' }}>Preset functional tags:</div>
            <div className="tag-suggestions">
              {PREDEFINED_INGREDIENT_TAGS.map(t => (
                <span key={t} className="tag-sug-pill" onClick={() => {
                  if (formData.ingredients.length > 0) {
                    addIngTag(formData.ingredients.length - 1, t);
                  }
                }}>
                  + #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Component Modifier Tags</label>
            <div className="tag-editor-box">
              {formData.tags.map(t => (
                <span key={t} className="tag-editor-chip">
                  {t} <i className="ti ti-x remove" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) })}></i>
                </span>
              ))}
              <input
                type="text"
                className="tag-input-inline"
                placeholder="Add tag + Enter..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            <div style={{ fontSize: '10px', color: PALETTE.MUTED, marginTop: '2px' }}>Suggested component tags:</div>
            <div className="tag-suggestions">
              {PREDEFINED_TAGS.map(t => (
                <span key={t} className="tag-sug-pill" onClick={() => {
                  if (!formData.tags.includes(t)) setFormData({ ...formData, tags: [...formData.tags, t] });
                }}>
                  + {t}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Prep Details</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Specify texture target, equipment required..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="filter-pill" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={() => onSave(formData)}>Save Component</button>
        </div>
      </div>
    </div>
  );
}

function DishDetailModal({ recipe, findComp, onClose }) {
  const resolvedComps = useMemo(() => {
    const compList = typeof recipe.components[0] === 'string'
      ? recipe.components.map(id => findComp(id))
      : recipe.components.map(rc => findComp(rc.id));
    return compList.filter(Boolean);
  }, [recipe, findComp]);

  const totalActive = resolvedComps.reduce((s, c) => s + (c.time || 0), 0);
  const totalPassive = resolvedComps.reduce((s, c) => s + (c.passive || 0), 0);

  const allIngredientTags = useMemo(() => {
    return [...new Set(resolvedComps.flatMap(c => (c.ingredients || []).flatMap(i => i.tags || [])))];
  }, [resolvedComps]);

  return (
    <div className="modal-overlay open">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">{recipe.title}</div>
          <button className="modal-close" onClick={onClose}><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <span className={`bcg-badge bcg-${recipe.bcg}`}>{recipe.bcg} Matrix</span>
            <span className="meta-chip time"><i className="ti ti-clock"></i> {totalActive}m active / {totalPassive}m passive</span>
          </div>

          <div className="dish-sec">
            <div className="dish-sec-title">Component Breakdown ({resolvedComps.length} Elements)</div>
            {resolvedComps.map(c => (
              <div key={c.id} className="dish-comp-card" style={{ marginBottom: '8px' }}>
                <div className="dish-comp-head">
                  <span>{c.name} <span style={{ fontSize: '10px', color: PALETTE.MUTED }}>({c.id})</span></span>
                  <span style={{ color: PALETTE.MUTED, fontSize: '11px' }}>{c.time}m active</span>
                </div>
                {c.ingredients?.length > 0 && (
                  <ul className="dish-comp-ings">
                    {c.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.qty} {ing.unit} {ing.name}
                        {ing.tags?.length > 0 && (
                          <span style={{ marginLeft: '6px' }}>
                            {ing.tags.map(t => (
                              <span key={t} className="ing-tag-pill" style={{ fontSize: '8px', padding: '1px 3px', marginRight: '2px' }}>#{t}</span>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {c.notes && (
                  <div style={{ fontSize: '11px', color: PALETTE.MUTED, marginTop: '4px', fontStyle: 'italic' }}>
                    Note: {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="dish-sec">
            <div className="dish-sec-title">Dish Modifier & Allergen Tags</div>
            <div className="tag-grid">
              {(recipe.tags || []).map(t => (
                <span key={t} className={`tag-pill ${ALLERGENS.includes(t) ? 'allergen' : ''} ${FLAVOR_TAGS.includes(t) ? 'flavor' : ''}`}>{t}</span>
              ))}
            </div>
          </div>

          {allIngredientTags.length > 0 && (
            <div className="dish-sec">
              <div className="dish-sec-title">Functional Ingredient Profile</div>
              <div className="tag-grid">
                {allIngredientTags.map(t => (
                  <span key={t} className="ing-tag-pill">#{t}</span>
                ))}
              </div>
            </div>
          )}

          {recipe.chefNotes && (
            <div className="dish-sec">
              <div className="dish-sec-title">Chef Notes</div>
              <p style={{ fontSize: '12px', color: PALETTE.DARK, lineHeight: '1.4' }}>{recipe.chefNotes}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="save-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}