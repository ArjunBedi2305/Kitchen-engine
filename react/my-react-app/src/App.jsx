import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// ── PALETTE DEFINITIONS & CONSTANTS ──────────────────────────────────────────
const PALETTE = {
  BASE: '#C4736A',      // Terracotta
  ENHANCER: '#E8A020',  // Warm Amber
  AROMATIC: '#6B8F71',  // Sage Green
  TEXTURE: '#888780',   // Slate Gray
  MUTED: '#9C9A96',     // Muted Gray
  DARK: '#2C2C2A',      // Charcoal
  ACCENT: '#D4537E',    // Crimson
  HIGHLIGHT: '#FAC775'  // Cream
};

const STORAGE_KEY = 'culinaryEngineState_v9';

const ROLES = [
  { id: 'BASE', label: 'Base vehicles', color: PALETTE.BASE },
  { id: 'ENHANCER', label: 'Flavor enhancers & sauces', color: PALETTE.ENHANCER },
  { id: 'AROMATIC', label: 'Aromatics & accents', color: PALETTE.AROMATIC },
  { id: 'TEXTURE', label: 'Textures & finishes', color: PALETTE.TEXTURE },
];

const ROLE_DOTS = {
  BASE: PALETTE.BASE,
  ENHANCER: PALETTE.ENHANCER,
  AROMATIC: PALETTE.AROMATIC,
  TEXTURE: PALETTE.TEXTURE,
};

const SLOT_MAXES = { BASE: 1, ENHANCER: 3, AROMATIC: 3, TEXTURE: 3 };

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
    components: [
      { id: 'cheesecake-base', role: 'BASE' },
      { id: 'yuzu-curd', role: 'ENHANCER' },
      { id: 'dark-choco-ganache', role: 'ENHANCER' },
      { id: 'smoked-hibiscus-syrup', role: 'AROMATIC' }
    ]
  },
  {
    id: 'recipe-jasmine-mango-tart',
    title: 'Jasmine Mango Pâte Sucrée with Toasted Almond Praline',
    tags: ['Dairy', 'Gluten', 'Tree Nuts', 'Floral', 'Tropical', 'Nutty', 'Sweet'],
    cat: 'DESSERT',
    bcg: 'PLOWHORSE',
    chefNotes: 'Bake crust until lightly golden brown. Dust with almond powder while hot.',
    components: [
      { id: 'pate-sucree', role: 'BASE' },
      { id: 'mango-puree', role: 'ENHANCER' },
      { id: 'jasmine-tea-infusion', role: 'AROMATIC' },
      { id: 'almond-praline', role: 'TEXTURE' }
    ]
  },
];

const SEED_STATE = {
  roles: {
    BASE: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-base-custards', name: 'Custards', collapsed: false, comps: [
            {
              id: 'cheesecake-base', name: 'Cheesecake', time: 20, passive: 180, tags: ['Dairy', 'Gluten', 'Sweet', 'Chilled'], dot: PALETTE.BASE,
              ingredients: [
                { qty: '250', unit: 'g', name: 'Cream Cheese', tags: ['Dairy', 'Fat', 'Emulsifier'] },
                { qty: '100', unit: 'g', name: 'Sugar', tags: ['Sweetener'] },
                { qty: '2', unit: 'pcs', name: 'Eggs', tags: ['Dairy', 'Protein', 'Binder'] }
              ],
              notes: 'Bake in water bath.'
            },
            {
              id: 'vanilla-panna-cotta', name: 'Panna Cotta', time: 10, passive: 240, tags: ['Dairy', 'Sweet', 'Silky'], dot: PALETTE.HIGHLIGHT,
              ingredients: [
                { qty: '300', unit: 'ml', name: 'Heavy Cream', tags: ['Dairy', 'Fat'] },
                { qty: '1', unit: 'tsp', name: 'Vanilla Bean Paste', tags: ['Aromatic', 'Sweetener'] }
              ],
              notes: 'Set with gelatin.'
            },
            {
              id: 'creme-brulee-base', name: 'Crème Brûlée', time: 15, passive: 60, tags: ['Dairy', 'Eggs', 'Sweet', 'Rich'], dot: PALETTE.ENHANCER,
              ingredients: [
                { qty: '4', unit: 'yolks', name: 'Egg Yolks', tags: ['Dairy', 'Protein', 'Fat', 'Emulsifier'] }
              ],
              notes: ''
            }
          ]
        },
        {
          id: 'f-base-handhelds', name: 'Handhelds', collapsed: false, comps: [
            { id: 'taco-shell', name: 'Taco', time: 5, passive: 0, tags: ['Gluten-Free'], dot: PALETTE.BASE, ingredients: [], notes: 'Soft corn or flour tortilla format.' },
            { id: 'burrito-wrap', name: 'Burrito', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.BASE, ingredients: [], notes: 'Large flour tortilla or flatbread.' },
            { id: 'sandwich-bun', name: 'Sandwich', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.BASE, ingredients: [], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
            { id: 'slider-bun', name: 'Slider', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.BASE, ingredients: [], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
            { id: 'pita-pocket', name: 'Pita Pocket', time: 5, passive: 0, tags: ['Gluten'], dot: PALETTE.BASE, ingredients: [], notes: 'Naan, pita, or lavash fold.' },
            { id: 'spring-roll-wrap', name: 'Spring Roll', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: PALETTE.BASE, ingredients: [], notes: 'Rice paper or crisp wrapper.' },
            { id: 'nacho-chip-base', name: 'Nachos', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: PALETTE.BASE, ingredients: [], notes: 'Rice paper or crisp wrapper.' }
          ]
        },
        {
          id: 'f-base-noodles', name: 'Noodles & Pasta', collapsed: false, comps: [
            { id: 'pad-thai-noodles', name: 'Pad Thai', time: 15, passive: 0, tags: ['Gluten-Free', 'Nutty'], dot: PALETTE.BASE, ingredients: [{ qty: '200', unit: 'g', name: 'Flat Rice Noodles', tags: ['Cooked'] }], notes: 'Stir-fried rice noodle base format.' },
            { id: 'udon-noodles', name: 'Udon', time: 12, passive: 0, tags: ['Gluten', 'Silky'], dot: PALETTE.BASE, ingredients: [{ qty: '200', unit: 'g', name: 'Udon Noodles', tags: ['Cooked'] }], notes: 'Thick wheat noodle vessel.' },
            { id: 'ramen-bowl', name: 'Ramen / Noodle Soup Bowl', time: 20, passive: 0, tags: ['Hot', 'Rich', 'Gluten'], dot: PALETTE.BASE, ingredients: [{ qty: '180', unit: 'g', name: 'Ramen Noodles', tags: ['Cooked'] }], notes: 'Broth and alkaline noodle vehicle.' },
            { id: 'pasta-bowl', name: 'Plated Pasta Format', time: 15, passive: 0, tags: ['Gluten'], dot: PALETTE.BASE, ingredients: [], notes: 'Fresh egg pasta, fettuccine, or penne base.' }
          ]
        },
        {
          id: 'f-base-rice-grains', name: 'Rice & Grain Dishes', collapsed: false, comps: [
            { id: 'biryani-rice-bowl', name: 'Biryani / Layered Rice Bowl', time: 25, passive: 15, tags: ['Gluten-Free', 'Spicy'], dot: PALETTE.BASE, ingredients: [], notes: 'Spiced rice base format.' },
            { id: 'risotto-grain-base', name: 'Risotto / Creamy Grain Base', time: 25, passive: 0, tags: ['Gluten-Free', 'Dairy', 'Rich'], dot: PALETTE.BASE, ingredients: [], notes: 'Arborio, polenta, or grits bowl.' },
            { id: 'donburi-rice-bowl', name: 'Donburi / Seasoned Rice Bowl', time: 10, passive: 0, tags: ['Gluten-Free'], dot: PALETTE.BASE, ingredients: [], notes: 'Sushi rice or jasmine rice format.' }
          ]
        },
        {
          id: 'f-base-soups-stews', name: 'Soups, Broths & Braises', collapsed: false, comps: [
            { id: 'stew-curry-vessel', name: 'Stew / Curry Vessel', time: 20, passive: 0, tags: ['Hot', 'Spicy'], dot: PALETTE.BASE, ingredients: [], notes: 'Deep plate or bowl format.' },
            { id: 'chowder-bisque-vessel', name: 'Chowder / Bisque Vessel', time: 15, passive: 0, tags: ['Dairy', 'Hot', 'Rich'], dot: PALETTE.BASE, ingredients: [], notes: 'Rich soup vessel format.' }
          ]
        },
        { id: 'f-base-misc', name: 'Miscellaneous Bases', collapsed: false, comps: [] }
      ]
    },
    ENHANCER: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-enhancer-fruit', name: 'Fruit & Curds', collapsed: false, comps: [
            { id: 'mango-puree', name: 'Mango Purée', time: 10, passive: 0, tags: ['Vegan', 'Tropical', 'Sweet'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '500', unit: 'g', name: 'Fresh Mango', tags: ['Sweetener', 'Raw', 'Acid'] }], notes: '' },
            { id: 'lychee-compote', name: 'Lychee Compote', time: 15, passive: 0, tags: ['Vegan', 'Floral', 'Sweet'], dot: PALETTE.BASE, ingredients: [], notes: '' },
            {
              id: 'yuzu-curd', name: 'Yuzu Curd', time: 15, passive: 20, tags: ['Eggs', 'Dairy', 'Sour', 'Citric', 'Tangy'], dot: PALETTE.ENHANCER,
              ingredients: [
                { qty: '100', unit: 'ml', name: 'Yuzu Juice', tags: ['Acid', 'Aromatic', 'Raw'] },
                { qty: '3', unit: 'pcs', name: 'Eggs', tags: ['Protein', 'Fat', 'Emulsifier'] }
              ],
              notes: 'Cook over double boiler until thick.'
            },
            { id: 'raspberry-coulis', name: 'Raspberry Coulis', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sweet', 'Sour'], dot: PALETTE.ACCENT, ingredients: [], notes: '' }
          ]
        },
        {
          id: 'f-enhancer-sauces', name: 'Sauces, Curries & Braises', collapsed: false, comps: [
            {
              id: 'dark-choco-ganache', name: 'Dark Chocolate Ganache', time: 12, passive: 30, tags: ['Dairy', 'Bitter', 'Sweet', 'Rich', 'Silky'], dot: PALETTE.DARK,
              ingredients: [
                { qty: '200', unit: 'g', name: '70% Dark Chocolate', tags: ['Fat', 'Sweetener'] },
                { qty: '200', unit: 'ml', name: 'Cream', tags: ['Dairy', 'Fat', 'Emulsifier'] }
              ],
              notes: 'Emulsify gently.'
            },
            { id: 'classic-bechamel', name: 'Classic Béchamel / Mornay', time: 15, passive: 0, tags: ['Dairy', 'Gluten', 'Rich'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '500', unit: 'ml', name: 'Whole milk', tags: ['Dairy', 'Fat'] }, { qty: '50', unit: 'g', name: 'Butter', tags: ['Dairy', 'Fat', 'Emulsifier'] }], notes: 'French Mother Sauce.' },
            { id: 'ragu-bolognese', name: 'Slow-Cooked Ragù Bolognese', time: 30, passive: 180, tags: ['Dairy', 'Rich', 'Earthy'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '250', unit: 'g', name: 'Ground beef', tags: ['Protein', 'Fat'] }, { qty: '250', unit: 'g', name: 'Ground pork', tags: ['Protein', 'Fat'] }], notes: '' },
            { id: 'red-curry-base', name: 'Red Curry Base', time: 15, passive: 30, tags: ['Spicy', 'Tropical', 'Rich'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '100', unit: 'g', name: 'Red curry paste', tags: ['Spice', 'Aromatic', 'Allium'] }, { qty: '400', unit: 'ml', name: 'Coconut milk', tags: ['Fat', 'Emulsifier'] }], notes: '' },
            { id: 'mole-negro', name: 'Mole Negro', time: 45, passive: 120, tags: ['Smoky', 'Bitter', 'Rich', 'Spicy'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '3', unit: 'type', name: 'Chipotle/Ancho/Guajillo', tags: ['Spice', 'Aromatic'] }], notes: 'Complex Mexican reduced sauce.' },
            { id: 'san-marzano-marinara', name: 'San Marzano Marinara', time: 10, passive: 45, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '800', unit: 'g', name: 'San Marzano tomato', tags: ['Acid', 'Aromatic'] }], notes: '' }
          ]
        },
        {
          id: 'f-enhancer-cheeses', name: 'Cheeses & Purees', collapsed: false, comps: [
            { id: 'burrata-basil-oil', name: 'Burrata & Basil Oil', time: 5, passive: 0, tags: ['Dairy', 'Vegetarian', 'Silky', 'Rich'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '1', unit: 'ball', name: 'Mozzarella di bufala / Burrata', tags: ['Dairy', 'Fat', 'Protein'] }], notes: '' },
            { id: 'butternut-squash-puree', name: 'Roasted Butternut Squash Puree', time: 15, passive: 40, tags: ['Vegan', 'Earthy', 'Sweet'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '1', unit: 'pc', name: 'Butternut squash', tags: ['Sweetener', 'Aromatic'] }], notes: '' }
          ]
        },
        { id: 'f-enhancer-misc', name: 'Miscellaneous Enhancers', collapsed: false, comps: [] }
      ]
    },
    AROMATIC: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-aromatic-floral', name: 'Infusions & Syrups', collapsed: false, comps: [
            { id: 'jasmine-tea-infusion', name: 'Jasmine Tea Infusion', time: 5, passive: 15, tags: ['Vegan', 'Floral', 'Hot'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '10', unit: 'g', name: 'Jasmine Green Tea', tags: ['Aromatic', 'Herb'] }], notes: '' },
            { id: 'smoked-hibiscus-syrup', name: 'Smoked Hibiscus Syrup', time: 20, passive: 30, tags: ['Vegan', 'Floral', 'Smoky', 'Tangy', 'Sour'], dot: PALETTE.BASE, ingredients: [{ qty: '50', unit: 'g', name: 'Dried Hibiscus', tags: ['Acid', 'Aromatic'] }, { qty: '200', unit: 'g', name: 'Sugar', tags: ['Sweetener'] }], notes: 'Infuse wood smoke prior to strain.' }
          ]
        },
        {
          id: 'f-aromatic-condiments', name: 'Oils, Emulsions & Condiments', collapsed: false, comps: [
            { id: 'garlic-aioli-toum', name: 'Garlic Aïoli / Toum', time: 10, passive: 0, tags: ['Eggs', 'Tangy', 'Spicy'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '4', unit: 'cloves', name: 'Garlic', tags: ['Allium', 'Aromatic'] }, { qty: '1', unit: 'pc', name: 'Egg yolk', tags: ['Fat', 'Emulsifier'] }], notes: '' },
            { id: 'chili-crisp-sesame-oil', name: 'Chili Crisp & Sesame Oil', time: 15, passive: 15, tags: ['Vegan', 'Spicy', 'Smoky', 'Sesame'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '50', unit: 'g', name: 'Gochugaru', tags: ['Spice', 'Aromatic'] }, { qty: '100', unit: 'ml', name: 'Neutral oil', tags: ['Fat'] }], notes: '' },
            { id: 'chimichurri-salsa', name: 'Chimichurri Salsa', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sour'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '1', unit: 'bunch', name: 'Flat-leaf parsley', tags: ['Herb', 'Aromatic'] }, { qty: '30', unit: 'ml', name: 'Red wine vinegar', tags: ['Acid'] }], notes: '' },
            { id: 'pesto-genovese', name: 'Pesto Genovese', time: 10, passive: 0, tags: ['Dairy', 'Tree Nuts', 'Vegetarian', 'Earthy'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '2', unit: 'cups', name: 'Italian basil', tags: ['Herb', 'Aromatic'] }, { qty: '50', unit: 'g', name: 'Parmigiano-Reggiano', tags: ['Dairy', 'Fat', 'Protein'] }], notes: '' },
            { id: 'aged-balsamic-reduction', name: 'Aged Balsamic Reduction', time: 5, passive: 20, tags: ['Vegan', 'Sweet', 'Tangy', 'Sour'], dot: PALETTE.AROMATIC, ingredients: [{ qty: '100', unit: 'ml', name: 'Balsamic vinegar', tags: ['Acid', 'Sweetener'] }], notes: '' }
          ]
        },
        { id: 'f-aromatic-misc', name: 'Miscellaneous Aromatics', collapsed: false, comps: [] }
      ]
    },
    TEXTURE: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-texture-crunch', name: 'Crunch & Nuts', collapsed: false, comps: [
            { id: 'almond-praline', name: 'Toasted Almond Praline', time: 20, passive: 10, tags: ['Tree Nuts', 'Nutty', 'Sweet', 'Crispy'], dot: PALETTE.ENHANCER, ingredients: [{ qty: '150', unit: 'g', name: 'Almonds', tags: ['Protein', 'Fat'] }, { qty: '100', unit: 'g', name: 'Caramelized Sugar', tags: ['Sweetener'] }], notes: 'Crush finely in food processor.' },
            { id: 'sesame-furikake', name: 'Toasted Sesame Furikake', time: 5, passive: 0, tags: ['Sesame', 'Crispy', 'Earthy'], dot: PALETTE.TEXTURE, ingredients: [{ qty: '2', unit: 'tbsp', name: 'Toasted sesame seeds', tags: ['Fat', 'Aromatic'] }, { qty: '1', unit: 'sheet', name: 'Nori', tags: ['Aromatic'] }], notes: '' },
            { id: 'pancetta-crumbles', name: 'Crispy Pancetta Crumbles', time: 10, passive: 0, tags: ['Crispy', 'Rich'], dot: PALETTE.TEXTURE, ingredients: [{ qty: '100', unit: 'g', name: 'Pancetta', tags: ['Protein', 'Fat'] }], notes: 'Render in skillet.' },
            { id: 'fried-shallot-crisps', name: 'Fried Shallots', time: 8, passive: 0, tags: ['Vegan', 'Crispy', 'Earthy'], dot: PALETTE.TEXTURE, ingredients: [{ qty: '2', unit: 'pcs', name: 'Shallot', tags: ['Allium', 'Aromatic'] }], notes: 'Flash fry in neutral oil.' },
            { id: 'maldon-sea-salt-microgreens', name: 'Maldon Sea Salt & Microgreens', time: 2, passive: 0, tags: ['Vegan', 'Crispy'], dot: PALETTE.TEXTURE, ingredients: [{ qty: '1', unit: 'pinch', name: 'Maldon sea salt', tags: ['Spice'] }], notes: '' }
          ]
        },
        { id: 'f-texture-misc', name: 'Miscellaneous Textures', collapsed: false, comps: [] }
      ]
    }
  },
  assembly: { BASE: [], ENHANCER: [], AROMATIC: [], TEXTURE: [] },
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
  const [dragOverSlot, setDragOverSlot] = useState(null);

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
    for (const rId of Object.keys(appState.roles)) {
      const roleObj = appState.roles[rId];
      if (roleObj.unfiled) {
        for (const c of roleObj.unfiled) list.push({ ...c, role: rId, folderId: null });
      }
      for (const f of roleObj.folders) {
        for (const c of f.comps) list.push({ ...c, role: rId, folderId: f.id });
      }
    }
    return list;
  }, [appState.roles]);

  const findComp = (id) => allComponents.find(c => c.id === id) || null;

  // Assembly calculations
  const assemblyComps = useMemo(() => {
    return ['BASE', 'ENHANCER', 'AROMATIC', 'TEXTURE']
      .flatMap(r => (appState.assembly[r] || []).map(findComp))
      .filter(Boolean);
  }, [appState.assembly, allComponents]);

  const autoTitle = useMemo(() => {
    const get = r => (appState.assembly[r] || []).map(findComp).filter(Boolean);
    const b = get('BASE'), e = get('ENHANCER'), a = get('AROMATIC'), t = get('TEXTURE');
    const parts = [];
    if (a.length) parts.push(a.map(c => c.name.split(' ')[0]).join('-'));
    if (e.length) parts.push(e.map(c => c.name).join(' & '));
    if (b.length) parts.push(b[0].name);
    if (t.length) parts.push('with ' + t.map(c => c.name).join(' and '));
    return parts.join(' ');
  }, [appState.assembly, allComponents]);

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

  const toggleRole = (roleId) => {
    setAppState(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleId]: { ...prev.roles[roleId], collapsed: !prev.roles[roleId].collapsed }
      }
    }));
  };

  const toggleFolder = (folderId) => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };

      for (const rId in nextRoles) {
        const role = nextRoles[rId];
        const folderIndex = role.folders.findIndex(f => f.id === folderId);

        if (folderIndex !== -1) {
          const updatedFolders = [...role.folders];
          updatedFolders[folderIndex] = {
            ...updatedFolders[folderIndex],
            collapsed: !updatedFolders[folderIndex].collapsed
          };

          return {
            ...prev,
            roles: {
              ...nextRoles,
              [rId]: {
                ...role,
                folders: updatedFolders
              }
            }
          };
        }
      }
      return prev;
    });
  };

  const collapseAllRoles = () => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };
      for (const rId in nextRoles) {
        nextRoles[rId] = {
          ...nextRoles[rId],
          collapsed: true,
          folders: nextRoles[rId].folders.map(f => ({ ...f, collapsed: true }))
        };
      }
      return { ...prev, roles: nextRoles };
    });
  };

  const expandAllRoles = () => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };
      for (const rId in nextRoles) {
        nextRoles[rId] = {
          ...nextRoles[rId],
          collapsed: false,
          folders: nextRoles[rId].folders.map(f => ({ ...f, collapsed: false }))
        };
      }
      return { ...prev, roles: nextRoles };
    });
  };

  const addFolder = (roleId) => {
    const nextId = 'f-' + roleId.toLowerCase() + '-' + (appState.nextId + 1);
    const n = appState.roles[roleId].folders.length + 1;
    setAppState(prev => ({
      ...prev,
      nextId: prev.nextId + 1,
      roles: {
        ...prev.roles,
        [roleId]: {
          ...prev.roles[roleId],
          folders: [...prev.roles[roleId].folders, { id: nextId, name: 'New folder ' + n, collapsed: false, comps: [] }]
        }
      }
    }));
    setEditingFolderId(nextId);
  };

  const renameFolder = (folderId, name) => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };
      for (const rId in nextRoles) {
        const folder = nextRoles[rId].folders.find(f => f.id === folderId);
        if (folder) {
          folder.name = name || folder.name;
          break;
        }
      }
      return { ...prev, roles: nextRoles };
    });
  };

  const deleteFolder = (folderId) => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };
      let compIdsToRemove = [];
      for (const rId in nextRoles) {
        const folder = nextRoles[rId].folders.find(f => f.id === folderId);
        if (folder) {
          compIdsToRemove = folder.comps.map(c => c.id);
          nextRoles[rId].folders = nextRoles[rId].folders.filter(f => f.id !== folderId);
          break;
        }
      }
      const nextAssembly = { ...prev.assembly };
      for (const r in nextAssembly) {
        nextAssembly[r] = nextAssembly[r].filter(id => !compIdsToRemove.includes(id));
      }
      return { ...prev, roles: nextRoles, assembly: nextAssembly };
    });
  };

  const removeComp = (cid) => {
    setAppState(prev => {
      const nextRoles = { ...prev.roles };
      for (const rId in nextRoles) {
        nextRoles[rId].unfiled = (nextRoles[rId].unfiled || []).filter(c => c.id !== cid);
        nextRoles[rId].folders.forEach(f => {
          f.comps = f.comps.filter(c => c.id !== cid);
        });
      }
      const nextAssembly = { ...prev.assembly };
      for (const r in nextAssembly) {
        nextAssembly[r] = nextAssembly[r].filter(id => id !== cid);
      }
      return { ...prev, roles: nextRoles, assembly: nextAssembly };
    });
  };

  const addToSlot = (cid, role) => {
    setAppState(prev => {
      const currentList = prev.assembly[role] || [];
      if (currentList.includes(cid)) return prev;
      const updated = [...currentList];
      if (updated.length >= SLOT_MAXES[role]) updated.shift();
      updated.push(cid);
      return { ...prev, assembly: { ...prev.assembly, [role]: updated } };
    });
  };

  const removeFromSlot = (role, cid) => {
    setAppState(prev => ({
      ...prev,
      assembly: { ...prev.assembly, [role]: (prev.assembly[role] || []).filter(id => id !== cid) }
    }));
  };

  const onSaveRecipe = () => {
    const compRefs = assemblyComps.map(c => ({ id: c.id, role: c.role }));
    const newRecipe = {
      id: 'recipe-' + autoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: autoTitle,
      tags: [...new Set(assemblyComps.flatMap(c => c.tags || []))],
      cat: 'DESSERT',
      bcg: 'STAR',
      chefNotes: 'Created via Dish Builder.',
      components: compRefs
    };

    setAppState(prev => ({
      ...prev,
      nextId: prev.nextId + 1,
      assembly: { BASE: [], ENHANCER: [], AROMATIC: [], TEXTURE: [] },
      savedRecipes: [...prev.savedRecipes, newRecipe]
    }));
    setCurrentTab('recipes');
  };

  const openComponentModal = (compId = null, defaultRole = 'BASE', defaultFolderId = null) => {
    const comp = compId ? findComp(compId) : {
      id: '', name: '', time: 0, passive: 0, tags: [], ingredients: [{ qty: '', unit: '', name: '', tags: [] }], notes: '', role: defaultRole, folderId: defaultFolderId
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

      const nextRoles = { ...prev.roles };
      for (const rId in nextRoles) {
        nextRoles[rId].unfiled = (nextRoles[rId].unfiled || []).filter(c => c.id !== newId);
        nextRoles[rId].folders.forEach(f => {
          f.comps = f.comps.filter(c => c.id !== newId);
        });
      }

      const compData = {
        id: newId,
        name: compFormData.name.trim(),
        time: parseInt(compFormData.time, 10) || 0,
        passive: parseInt(compFormData.passive, 10) || 0,
        tags: compFormData.tags,
        dot: ROLE_DOTS[compFormData.role] || PALETTE.MUTED,
        ingredients: compFormData.ingredients.filter(i => i.name.trim()),
        notes: compFormData.notes.trim()
      };

      if (compFormData.folderId) {
        for (const rId in nextRoles) {
          const folder = nextRoles[rId].folders.find(f => f.id === compFormData.folderId);
          if (folder) {
            folder.comps.push(compData);
            break;
          }
        }
      } else {
        if (!nextRoles[compFormData.role].unfiled) nextRoles[compFormData.role].unfiled = [];
        nextRoles[compFormData.role].unfiled.push(compData);
      }

      return { ...prev, nextId, roles: nextRoles };
    });

    setCompModalOpen(false);
  };

  const openDishModal = (recipe) => {
    setSelectedRecipe(recipe);
    setDishModalOpen(true);
  };

  const filteredRegistryComps = useMemo(() => {
    let comps = registryFilter ? allComponents.filter(c => c.role === registryFilter) : allComponents;
    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase().trim();
      comps = comps.filter(c => c.name.toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q)));
    }
    return comps;
  }, [allComponents, registryFilter, registrySearch]);

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
                  <span className="sb-title">Components</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      className="fa-btn"
                      title="Collapse All"
                      onClick={collapseAllRoles}
                      style={{ padding: '4px 6px', fontSize: '12px' }}
                    >
                      <i className="ti ti-fold-up"></i>
                    </button>
                    <button
                      className="fa-btn"
                      title="Expand All"
                      onClick={expandAllRoles}
                      style={{ padding: '4px 6px', fontSize: '12px' }}
                    >
                      <i className="ti ti-fold-down"></i>
                    </button>
                    <button className="sb-create-btn" onClick={() => openComponentModal()}>
                      <i className="ti ti-plus"></i> New
                    </button>
                  </div>
                </div>
                <div>
                  {ROLES.map(role => {
                    const rs = appState.roles[role.id] || { collapsed: false, unfiled: [], folders: [] };
                    const unfiledCount = (rs.unfiled || []).length;
                    const total = rs.folders.reduce((s, f) => s + f.comps.length, 0) + unfiledCount;
                    return (
                      <div key={role.id} className="role-section">
                        <div className="role-header" onClick={(e) => { if (!e.target.closest('.role-add')) toggleRole(role.id); }}>
                          <i className={`ti ti-chevron-right role-chevron ${rs.collapsed ? '' : 'open'}`}></i>
                          <div className="role-dot" style={{ background: role.color }}></div>
                          <span className="role-name">{role.label}</span>
                          <span className="role-count">{total}</span>
                          <button className="role-add" title="Add folder" onClick={(e) => { e.stopPropagation(); addFolder(role.id); }}>
                            <i className="ti ti-folder-plus"></i>
                          </button>
                        </div>
                        {!rs.collapsed && (
                          <div className="role-body">
                            {rs.folders.map(f => (
                              <FolderItem
                                key={f.id}
                                folder={f}
                                roleId={role.id}
                                editingFolderId={editingFolderId}
                                setEditingFolderId={setEditingFolderId}
                                toggleFolder={toggleFolder}
                                renameFolder={renameFolder}
                                deleteFolder={deleteFolder}
                                openComponentModal={openComponentModal}
                                removeComp={removeComp}
                                addToSlot={addToSlot}
                                setDragItem={setDragItem}
                              />
                            ))}
                            {unfiledCount > 0 && (
                              <FolderItem
                                isUnfiled
                                folder={{ id: null, name: 'Unfiled', collapsed: false, comps: rs.unfiled }}
                                roleId={role.id}
                                openComponentModal={openComponentModal}
                                removeComp={removeComp}
                                addToSlot={addToSlot}
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
                <div className="title-preview">
                  <div className="title-eyebrow">Auto-generated title</div>
                  <div className={`title-text ${assemblyComps.length === 0 ? 'empty' : ''}`}>
                    {assemblyComps.length > 0 ? autoTitle : 'Start adding components below'}
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

                {/* Slots Grid */}
                <div className="slot-row grid-4-col">
                  <div>
                    <div className="slot-label">Base vehicle <span className="slot-hint">(1 max)</span></div>
                    <SlotBox
                      role="BASE"
                      assemblyIds={appState.assembly.BASE || []}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop base component"
                    />
                  </div>
                  <div>
                    <div className="slot-label">Flavor enhancers & sauces <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="ENHANCER"
                      assemblyIds={appState.assembly.ENHANCER || []}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop enhancers or sauces"
                    />
                  </div>
                  <div>
                    <div className="slot-label">Aromatics & accents <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="AROMATIC"
                      assemblyIds={appState.assembly.AROMATIC || []}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop aromatics or accents"
                    />
                  </div>
                  <div>
                    <div className="slot-label">Textures & finishes <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="TEXTURE"
                      assemblyIds={appState.assembly.TEXTURE || []}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop texture elements"
                    />
                  </div>
                </div>

                <div>
                  <div className="slot-label">Inherited Component Tags</div>
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
                <span className="filter-label">Role:</span>
                <button className={`filter-pill ${registryFilter === null ? 'on' : ''}`} onClick={() => setRegistryFilter(null)}>All</button>
                {ROLES.map(r => (
                  <button key={r.id} className={`filter-pill ${registryFilter === r.id ? 'on' : ''}`} onClick={() => setRegistryFilter(r.id)}>
                    {r.label}
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
                    <div className="rc-cat">{c.role} <span style={{ fontSize: '9px', opacity: 0.6 }}>({c.id})</span></div>
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
              <div className="reg-add-card" onClick={() => openComponentModal(null, registryFilter || 'BASE')}>
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
          roles={appState.roles}
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
  roleId,
  isUnfiled = false,
  editingFolderId,
  setEditingFolderId,
  toggleFolder,
  renameFolder,
  deleteFolder,
  openComponentModal,
  removeComp,
  addToSlot,
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
            onClick={(e) => { e.stopPropagation(); openComponentModal(null, roleId, folder.id); }}
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
              onDragStart={() => setDragItem({ id: comp.id, role: roleId })}
              onClick={(e) => {
                if (e.target.closest('.comp-actions')) return;
                addToSlot(comp.id, roleId);
              }}
            >
              <div className="comp-dot" style={{ background: comp.dot || ROLE_DOTS[roleId] }}></div>
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

function SlotBox({ role, assemblyIds, findComp, removeFromSlot, addToSlot, dragItem, dragOverSlot, setDragOverSlot, placeholder }) {
  const isOver = dragOverSlot === role;

  return (
    <div
      className={`slot ${isOver ? 'dragover' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOverSlot(role); }}
      onDragLeave={() => setDragOverSlot(null)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverSlot(null);
        if (dragItem) {
          addToSlot(dragItem.id, dragItem.role || role);
        }
      }}
    >
      {assemblyIds.map(cid => {
        const c = findComp(cid);
        if (!c) return null;
        return (
          <div key={cid} className="slot-tag">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot || ROLE_DOTS[role], flexShrink: 0 }}></div>
            <span>{c.name}</span>
            <button className="rm" title="Remove" onClick={() => removeFromSlot(role, cid)}>×</button>
          </div>
        );
      })}
      {assemblyIds.length === 0 && (
        <div className="slot-empty">
          <i className="ti ti-drag-drop" aria-hidden="true"></i> {placeholder}
        </div>
      )}
    </div>
  );
}

function ComponentEditorModal({ data, roles, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: data?.id || '',
    name: data?.name || '',
    role: data?.role || 'BASE',
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
    return roles[formData.role]?.folders || [];
  }, [roles, formData.role]);

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
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value, folderId: '' })}
              >
                <option value="BASE">Base vehicles</option>
                <option value="ENHANCER">Flavor enhancers & sauces</option>
                <option value="AROMATIC">Aromatics & accents</option>
                <option value="TEXTURE">Textures & finishes</option>
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
            <label className="form-label">Ingredients & Functional Ingredient Tags</label>
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
    return (recipe.components || []).map(rc => findComp(rc.id)).filter(Boolean);
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
            <div className="dish-sec-title">Component Breakdown</div>
            {ROLES.map(r => {
              const roleComps = resolvedComps.filter(c => c.role === r.id);
              if (!roleComps.length) return null;
              return (
                <div key={r.id} className="dish-sec">
                  <div className="dish-sec-title">{r.label}</div>
                  {roleComps.map(c => (
                    <div key={c.id} className="dish-comp-card">
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
              );
            })}
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