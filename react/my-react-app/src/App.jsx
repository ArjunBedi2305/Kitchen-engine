import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// ── CAST IRON & COBALT CONSTANTS ──────────────────────────────────────────────
const DOMAIN_PALETTE = {
  GRAINS: '#E3B341',   // Warm Gold
  PROTEINS: '#D985B8', // Deep Rose
  SAUCES: '#F07F3C',   // Terracotta
  PRODUCE: '#3DBBA0',  // Teal
  FINISHES: '#A39E93'  // Slate
};

const STORAGE_KEY = 'culinaryEngineState_v18';

const CATEGORIES = [
  { id: 'GRAINS', label: 'Grains, Breads & Starches', color: DOMAIN_PALETTE.GRAINS },
  { id: 'PROTEINS', label: 'Proteins & Hearty Fillings', color: DOMAIN_PALETTE.PROTEINS },
  { id: 'SAUCES', label: 'Sauces, Curries & Liquids', color: DOMAIN_PALETTE.SAUCES },
  { id: 'PRODUCE', label: 'Fresh Produce, Pickles & Accents', color: DOMAIN_PALETTE.PRODUCE },
  { id: 'FINISHES', label: 'Crunch, Toppings & Finishes', color: DOMAIN_PALETTE.FINISHES },
];

const ARCHETYPES = {
  CANVAS: {
    id: 'CANVAS',
    label: 'Open Canvas',
    desc: 'Unrestricted dynamic multi-component assembly buckets.',
    buckets: [
      { id: 'vessel', role: 'Base & Starches', req: true, allowedDomains: ['GRAINS'] },
      { id: 'fillings', role: 'Proteins & Fillings', req: false, allowedDomains: ['PROTEINS'] },
      { id: 'sauces', role: 'Sauces, Curries & Broths', req: false, allowedDomains: ['SAUCES'] },
      { id: 'accents', role: 'Fresh Produce, Pickles & Finishes', req: false, allowedDomains: ['PRODUCE', 'FINISHES'] }
    ]
  },
  HANDHELD: {
    id: 'HANDHELD',
    label: 'Handheld / Wrap',
    desc: 'Requires wrap or flatbread base and at least one filling.',
    buckets: [
      { id: 'vessel', role: 'Wrap / Flatbread Vessel', req: true, allowedDomains: ['GRAINS'] },
      { id: 'fillings', role: 'Proteins & Main Fillings', req: true, allowedDomains: ['PROTEINS'] },
      { id: 'sauces', role: 'Salsas, Crema & Binders', req: false, allowedDomains: ['SAUCES'] },
      { id: 'accents', role: 'Pickles, Greens & Finishes', req: false, allowedDomains: ['PRODUCE', 'FINISHES'] }
    ]
  },
  BOWL: {
    id: 'BOWL',
    label: 'Noodle / Rice Bowl',
    desc: 'Requires starch base and broth or curry body.',
    buckets: [
      { id: 'vessel', role: 'Grain / Noodle Base', req: true, allowedDomains: ['GRAINS'] },
      { id: 'sauces', role: 'Broth, Curry & Sauce Body', req: true, allowedDomains: ['SAUCES'] },
      { id: 'fillings', role: 'Proteins & Hot Toppings', req: false, allowedDomains: ['PROTEINS'] },
      { id: 'accents', role: 'Fresh Herbs, Oil & Furikake', req: false, allowedDomains: ['PRODUCE', 'FINISHES'] }
    ]
  },
  DESSERT: {
    id: 'DESSERT',
    label: 'Plated Dessert',
    desc: 'Requires pastry or custard base.',
    buckets: [
      { id: 'vessel', role: 'Custard, Tart or Cake Base', req: true, allowedDomains: ['GRAINS'] },
      { id: 'sauces', role: 'Coulis, Curds & Ganache', req: false, allowedDomains: ['SAUCES'] },
      { id: 'accents', role: 'Botanicals, Fruit & Praline Finishes', req: false, allowedDomains: ['PRODUCE', 'FINISHES'] }
    ]
  }
};

const ALLERGENS = ['Dairy', 'Gluten', 'Tree Nuts', 'Eggs', 'Sesame', 'Soy', 'Peanuts', 'Shellfish'];
const FLAVOR_TAGS = ['Sweet', 'Sour', 'Bitter', 'Floral', 'Smoky', 'Tangy', 'Earthy', 'Spicy', 'Rich', 'Citric', 'Tropical', 'Nutty'];
const PREDEFINED_TAGS = [...ALLERGENS, ...FLAVOR_TAGS, 'Vegan', 'Vegetarian', 'Gluten-Free', 'Crispy', 'Silky', 'Chilled', 'Hot'];
const ANIMAL_INGREDIENTS = ['steak', 'pork', 'beef', 'chicken', 'bacon', 'pancetta', 'butter', 'milk', 'heavy cream', 'cheese', 'egg', 'pecorino', 'burrata', 'cream cheese'];

const SEED_RECIPES = [
  {
    id: 'recipe-hibiscus-cheesecake',
    title: 'Smoked Hibiscus Yuzu Cheesecake Base with Dark Chocolate Ganache',
    tags: ['Dairy', 'Gluten', 'Eggs', 'Floral', 'Smoky', 'Tangy', 'Bitter', 'Sweet'],
    cat: 'DESSERT',
    chefNotes: 'Ensure the Yuzu curd is emulsified before adding to the ganache layer.',
    components: ['cheesecake-base', 'yuzu-curd', 'dark-choco-ganache', 'smoked-hibiscus-syrup']
  },
  {
    id: 'recipe-carnitas-taco',
    title: 'Pico de Gallo Slow-Cooked Carnitas Taco with Pickled Red Onions',
    tags: ['Rich', 'Tangy', 'Sour', 'Spicy', 'Gluten-Free'],
    cat: 'HANDHELD',
    chefNotes: 'Crisp carnitas in skillet prior to assembling soft corn tortilla.',
    components: ['taco-shell', 'carnitas', 'pico-de-gallo', 'pickled-red-onion']
  },
  {
    id: 'recipe-jasmine-mango-tart',
    title: 'Jasmine Mango Pâte Sucrée with Toasted Almond Praline',
    tags: ['Dairy', 'Gluten', 'Tree Nuts', 'Floral', 'Tropical', 'Nutty', 'Sweet'],
    cat: 'DESSERT',
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
            { id: 'taco-shell', name: 'Taco Shell', time: 5, passive: 0, tags: ['Gluten-Free'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '1', unit: 'pc', name: 'Corn Tortilla' }], notes: 'Soft corn or flour tortilla format.' },
            { id: 'burrito-wrap', name: 'Burrito Wrap', time: 5, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '1', unit: 'pc', name: 'Flour Tortilla' }], notes: 'Large flour tortilla or flatbread.' },
            { id: 'sandwich-bun', name: 'Sandwich / Brioche Bun', time: 5, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '1', unit: 'pc', name: 'Brioche Bun' }], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
            { id: 'slider-bun', name: 'Slider Bun', time: 5, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '1', unit: 'pc', name: 'Slider Bun' }], notes: 'Mini brioche or sourdough bun.' },
            { id: 'pita-pocket', name: 'Pita Pocket / Naan', time: 5, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '1', unit: 'pc', name: 'Pita Bread' }], notes: 'Naan, pita, or lavash fold.' },
            { id: 'spring-roll-wrap', name: 'Spring Roll Wrapper', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '2', unit: 'pcs', name: 'Rice Paper' }], notes: 'Rice paper or crisp wrapper.' },
            { id: 'nacho-chip-base', name: 'Nacho Chips Base', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '150', unit: 'g', name: 'Tortilla Chips' }], notes: 'Crisp tortilla chip vessel.' }
          ]
        },
        {
          id: 'f-grains-rice', name: 'Rice & Grains', collapsed: false, comps: [
            {
              id: 'cilantro-lime-rice', name: 'Cilantro-Lime Rice', time: 15, passive: 20, tags: ['Vegan', 'Tangy'], dot: DOMAIN_PALETTE.GRAINS,
              ingredients: [
                { qty: '200', unit: 'g', name: 'Jasmine Rice' },
                { qty: '1', unit: 'bunch', name: 'Fresh Cilantro' },
                { qty: '2', unit: 'tbsp', name: 'Lime Juice' }
              ], notes: 'Fold herbs into cooked rice.'
            },
            { id: 'biryani-rice', name: 'Biryani Spiced Rice', time: 25, passive: 15, tags: ['Gluten-Free', 'Spicy'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Basmati Rice' }, { qty: '1', unit: 'pinch', name: 'Saffron' }], notes: 'Spiced rice base format.' },
            { id: 'risotto-grain-base', name: 'Risotto / Creamy Grain Base', time: 25, passive: 0, tags: ['Gluten-Free', 'Dairy', 'Rich'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '150', unit: 'g', name: 'Arborio Rice' }, { qty: '500', unit: 'ml', name: 'Vegetable Stock' }], notes: 'Arborio, polenta, or grits bowl.' },
            { id: 'donburi-rice-bowl', name: 'Donburi Seasoned Rice', time: 10, passive: 0, tags: ['Gluten-Free'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Sushi Rice' }, { qty: '15', unit: 'ml', name: 'Rice Vinegar' }], notes: 'Sushi rice or jasmine rice format.' }
          ]
        },
        {
          id: 'f-grains-noodles', name: 'Noodles & Pasta', collapsed: false, comps: [
            { id: 'ramen-noodles', name: 'Ramen Noodles', time: 10, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '180', unit: 'g', name: 'Alkaline Ramen Noodles' }], notes: 'Alkaline ramen noodle base.' },
            { id: 'pad-thai-noodles', name: 'Pad Thai Rice Noodles', time: 12, passive: 0, tags: ['Gluten-Free', 'Nutty'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Flat Rice Noodles' }], notes: 'Flat rice noodles.' },
            { id: 'udon-noodles', name: 'Udon Noodles', time: 10, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '200', unit: 'g', name: 'Thick Udon Noodles' }], notes: 'Thick wheat udon noodles.' },
            { id: 'pasta-bowl', name: 'Fresh Pasta Format', time: 15, passive: 0, tags: ['Gluten'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '150', unit: 'g', name: 'Fresh Egg Fettuccine' }], notes: 'Fresh egg pasta, fettuccine, or penne.' }
          ]
        },
        {
          id: 'f-grains-pastry', name: 'Pastry, Custards & Crusts', collapsed: false, comps: [
            {
              id: 'cheesecake-base', name: 'Cheesecake Custard Base', time: 20, passive: 180, tags: ['Dairy', 'Gluten', 'Sweet'], dot: DOMAIN_PALETTE.GRAINS,
              ingredients: [
                { qty: '250', unit: 'g', name: 'Cream Cheese' },
                { qty: '100', unit: 'g', name: 'Sugar' },
                { qty: '2', unit: 'pcs', name: 'Eggs' }
              ], notes: 'Bake in water bath.'
            },
            {
              id: 'vanilla-panna-cotta', name: 'Panna Cotta', time: 10, passive: 240, tags: ['Dairy', 'Sweet'], dot: DOMAIN_PALETTE.GRAINS,
              ingredients: [
                { qty: '300', unit: 'ml', name: 'Heavy Cream' },
                { qty: '1', unit: 'tsp', name: 'Vanilla Bean Paste' }
              ], notes: 'Set with gelatin.'
            },
            {
              id: 'creme-brulee-base', name: 'Crème Brûlée Base', time: 15, passive: 60, tags: ['Dairy', 'Eggs', 'Sweet', 'Rich'], dot: DOMAIN_PALETTE.GRAINS,
              ingredients: [{ qty: '4', unit: 'pcs', name: 'Egg Yolks' }, { qty: '250', unit: 'ml', name: 'Heavy Cream' }], notes: 'Bake slowly in ramekins.'
            },
            { id: 'pate-sucree', name: 'Pâte Sucrée Tart Shell', time: 20, passive: 30, tags: ['Dairy', 'Gluten', 'Sweet'], dot: DOMAIN_PALETTE.GRAINS, ingredients: [{ qty: '150', unit: 'g', name: 'Pastry Flour' }, { qty: '75', unit: 'g', name: 'Unsalted Butter' }], notes: 'Sweet shortcrust dough.' }
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
              id: 'carnitas', name: 'Slow-Cooked Carnitas', time: 20, passive: 180, tags: ['Rich', 'Earthy'], dot: DOMAIN_PALETTE.PROTEINS,
              ingredients: [
                { qty: '500', unit: 'g', name: 'Pork Shoulder' },
                { qty: '2', unit: 'pcs', name: 'Oranges' }
              ], notes: 'Shred and crisp in skillet.'
            },
            {
              id: 'flank-steak', name: 'Seared Flank Steak', time: 15, passive: 0, tags: ['Rich', 'Smoky'], dot: DOMAIN_PALETTE.PROTEINS,
              ingredients: [{ qty: '400', unit: 'g', name: 'Flank Steak' }], notes: 'High heat sear to medium-rare.'
            }
          ]
        },
        {
          id: 'f-proteins-plant', name: 'Plant-Based & Legumes', collapsed: false, comps: [
            { id: 'adobo-tofu', name: 'Adobo Marinated Tofu', time: 15, passive: 30, tags: ['Vegan', 'Spicy'], dot: DOMAIN_PALETTE.PROTEINS, ingredients: [{ qty: '350', unit: 'g', name: 'Extra Firm Tofu' }, { qty: '2', unit: 'tbsp', name: 'Adobo Seasoning' }], notes: 'Press tofu well before searing.' },
            { id: 'charro-beans', name: 'Stewed Charro Beans', time: 15, passive: 45, tags: ['Rich', 'Earthy'], dot: DOMAIN_PALETTE.PROTEINS, ingredients: [{ qty: '250', unit: 'g', name: 'Pinto Beans' }, { qty: '50', unit: 'g', name: 'Bacon' }], notes: 'Simmer with garlic and bacon broth.' },
            { id: 'black-beans', name: 'Stewed Black Beans', time: 10, passive: 30, tags: ['Vegan', 'Earthy'], dot: DOMAIN_PALETTE.PROTEINS, ingredients: [{ qty: '250', unit: 'g', name: 'Black Beans' }], notes: 'Season with cumin and garlic.' }
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
            { id: 'classic-bechamel', name: 'Classic Béchamel / Mornay', time: 15, passive: 0, tags: ['Dairy', 'Gluten', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '500', unit: 'ml', name: 'Whole Milk' }, { qty: '50', unit: 'g', name: 'Butter' }], notes: 'French Mother Sauce.' },
            { id: 'ragu-bolognese', name: 'Slow-Cooked Ragù Bolognese', time: 30, passive: 180, tags: ['Dairy', 'Rich', 'Earthy'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '250', unit: 'g', name: 'Ground Beef' }, { qty: '250', unit: 'g', name: 'Ground Pork' }], notes: 'Slow braised meat ragù.' },
            { id: 'red-curry-base', name: 'Red Curry Base', time: 15, passive: 30, tags: ['Spicy', 'Tropical', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '400', unit: 'ml', name: 'Coconut Milk' }, { qty: '100', unit: 'g', name: 'Red Curry Paste' }], notes: '' },
            { id: 'mole-negro', name: 'Mole Negro', time: 45, passive: 120, tags: ['Smoky', 'Bitter', 'Rich', 'Spicy'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '3', unit: 'type', name: 'Dried Chilies' }], notes: 'Complex Mexican reduced sauce.' },
            { id: 'san-marzano-marinara', name: 'San Marzano Marinara', time: 10, passive: 45, tags: ['Vegan', 'Tangy', 'Sour'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '800', unit: 'g', name: 'San Marzano Tomatoes' }], notes: '' },
            { id: 'carbonara-sauce', name: 'Carbonara Sauce', time: 10, passive: 0, tags: ['Dairy', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '3', unit: 'pcs', name: 'Egg Yolks' }, { qty: '50', unit: 'g', name: 'Pecorino Romano' }], notes: '' },
            { id: 'cacio-e-pepe', name: 'Cacio e Pepe Base', time: 10, passive: 0, tags: ['Dairy', 'Spicy'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '100', unit: 'g', name: 'Pecorino Romano' }, { qty: '2', unit: 'tsp', name: 'Black Pepper' }], notes: '' },
            { id: 'peppercorn-sauce', name: 'Peppercorn Sauce', time: 10, passive: 0, tags: ['Rich', 'Spicy'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '150', unit: 'ml', name: 'Heavy Cream' }, { qty: '1', unit: 'tbsp', name: 'Green Peppercorns' }], notes: '' },
            { id: 'beurre-blanc', name: 'Beurre Blanc', time: 10, passive: 0, tags: ['Dairy', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '150', unit: 'g', name: 'Cold Butter' }, { qty: '50', unit: 'ml', name: 'White Wine' }], notes: '' },
            { id: 'vodka-sauce', name: 'Vodka Sauce', time: 10, passive: 0, tags: ['Dairy', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '100', unit: 'ml', name: 'Heavy Cream' }, { qty: '400', unit: 'g', name: 'Crushed Tomatoes' }], notes: '' },
            { id: 'butter-chicken-sauce', name: 'Butter Chicken Gravy', time: 15, passive: 30, tags: ['Dairy', 'Spicy', 'Rich'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '200', unit: 'ml', name: 'Tomato Puree' }, { qty: '100', unit: 'ml', name: 'Heavy Cream' }], notes: '' }
          ]
        },
        {
          id: 'f-sauces-sweet', name: 'Fruit, Curds & Sweet Sauces', collapsed: false, comps: [
            { id: 'mango-puree', name: 'Mango Purée', time: 10, passive: 0, tags: ['Vegan', 'Tropical', 'Sweet'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '500', unit: 'g', name: 'Fresh Mango' }], notes: '' },
            { id: 'lychee-compote', name: 'Lychee Compote', time: 15, passive: 0, tags: ['Vegan', 'Floral', 'Sweet'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '300', unit: 'g', name: 'Lychees' }], notes: '' },
            {
              id: 'yuzu-curd', name: 'Yuzu Curd', time: 15, passive: 20, tags: ['Eggs', 'Dairy', 'Sour', 'Citric', 'Tangy'], dot: DOMAIN_PALETTE.SAUCES,
              ingredients: [
                { qty: '100', unit: 'ml', name: 'Yuzu Juice' },
                { qty: '3', unit: 'pcs', name: 'Eggs' }
              ], notes: ''
            },
            { id: 'raspberry-coulis', name: 'Raspberry Coulis', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sweet', 'Sour'], dot: DOMAIN_PALETTE.SAUCES, ingredients: [{ qty: '250', unit: 'g', name: 'Raspberries' }], notes: '' },
            {
              id: 'dark-choco-ganache', name: 'Dark Chocolate Ganache', time: 12, passive: 30, tags: ['Dairy', 'Bitter', 'Sweet', 'Rich'], dot: DOMAIN_PALETTE.SAUCES,
              ingredients: [
                { qty: '200', unit: 'g', name: '70% Dark Chocolate' },
                { qty: '200', unit: 'ml', name: 'Heavy Cream' }
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
              id: 'pico-de-gallo', name: 'Pico de Gallo', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sour'], dot: DOMAIN_PALETTE.PRODUCE,
              ingredients: [
                { qty: '2', unit: 'pcs', name: 'Roma Tomatoes' },
                { qty: '0.5', unit: 'pc', name: 'Red Onion' }
              ], notes: ''
            },
            { id: 'pickled-red-onion', name: 'Pickled Red Onions', time: 10, passive: 60, tags: ['Vegan', 'Tangy', 'Sour'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'pc', name: 'Red Onion' }, { qty: '100', unit: 'ml', name: 'Apple Cider Vinegar' }], notes: '' },
            { id: 'burrata-basil-oil', name: 'Burrata & Basil Oil', time: 5, passive: 0, tags: ['Dairy', 'Vegetarian', 'Rich'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'ball', name: 'Burrata Cheese' }, { qty: '30', unit: 'ml', name: 'Basil Oil' }], notes: '' },
            { id: 'butternut-squash-puree', name: 'Roasted Butternut Squash Puree', time: 15, passive: 40, tags: ['Vegan', 'Earthy', 'Sweet'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'pc', name: 'Butternut Squash' }], notes: '' }
          ]
        },
        {
          id: 'f-produce-condiments', name: 'Aromatics, Oils & Condiments', collapsed: false, comps: [
            { id: 'garlic-aioli-toum', name: 'Garlic Aïoli / Toum', time: 10, passive: 0, tags: ['Eggs', 'Tangy', 'Spicy'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '4', unit: 'cloves', name: 'Garlic' }, { qty: '100', unit: 'ml', name: 'Olive Oil' }], notes: '' },
            { id: 'chili-crisp-sesame-oil', name: 'Chili Crisp & Sesame Oil', time: 15, passive: 15, tags: ['Vegan', 'Spicy', 'Smoky', 'Sesame'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '50', unit: 'g', name: 'Chili Flakes' }, { qty: '100', unit: 'ml', name: 'Sesame Oil' }], notes: '' },
            { id: 'chimichurri-salsa', name: 'Chimichurri Salsa', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sour'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '1', unit: 'bunch', name: 'Flat-Leaf Parsley' }, { qty: '30', unit: 'ml', name: 'Red Wine Vinegar' }], notes: '' },
            { id: 'pesto-genovese', name: 'Pesto Genovese', time: 10, passive: 0, tags: ['Dairy', 'Tree Nuts', 'Vegetarian', 'Earthy'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '2', unit: 'cups', name: 'Italian Basil' }, { qty: '50', unit: 'g', name: 'Parmigiano-Reggiano' }], notes: '' },
            { id: 'aged-balsamic-reduction', name: 'Aged Balsamic Reduction', time: 5, passive: 20, tags: ['Vegan', 'Sweet', 'Tangy', 'Sour'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '100', unit: 'ml', name: 'Balsamic Vinegar' }], notes: '' },
            { id: 'jasmine-tea-infusion', name: 'Jasmine Tea Infusion', time: 5, passive: 15, tags: ['Vegan', 'Floral'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '10', unit: 'g', name: 'Jasmine Green Tea Leaves' }], notes: '' },
            { id: 'smoked-hibiscus-syrup', name: 'Smoked Hibiscus Syrup', time: 20, passive: 30, tags: ['Vegan', 'Floral', 'Smoky', 'Tangy'], dot: DOMAIN_PALETTE.PRODUCE, ingredients: [{ qty: '50', unit: 'g', name: 'Dried Hibiscus' }, { qty: '200', unit: 'g', name: 'Sugar' }], notes: '' }
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
            { id: 'almond-praline', name: 'Toasted Almond Praline', time: 20, passive: 10, tags: ['Tree Nuts', 'Nutty', 'Sweet'], dot: DOMAIN_PALETTE.FINISHES, ingredients: [{ qty: '150', unit: 'g', name: 'Almonds' }, { qty: '100', unit: 'g', name: 'Caramelized Sugar' }], notes: '' },
            { id: 'sesame-furikake', name: 'Toasted Sesame Furikake', time: 5, passive: 0, tags: ['Sesame', 'Earthy'], dot: DOMAIN_PALETTE.FINISHES, ingredients: [{ qty: '2', unit: 'tbsp', name: 'Toasted Sesame Seeds' }, { qty: '1', unit: 'sheet', name: 'Nori' }], notes: '' },
            { id: 'pancetta-crumbles', name: 'Crispy Pancetta Crumbles', time: 10, passive: 0, tags: ['Rich'], dot: DOMAIN_PALETTE.FINISHES, ingredients: [{ qty: '100', unit: 'g', name: 'Pancetta' }], notes: '' },
            { id: 'fried-shallot-crisps', name: 'Fried Shallots', time: 8, passive: 0, tags: ['Vegan', 'Earthy'], dot: DOMAIN_PALETTE.FINISHES, ingredients: [{ qty: '2', unit: 'pcs', name: 'Shallots' }], notes: '' },
            { id: 'maldon-sea-salt-microgreens', name: 'Maldon Sea Salt & Microgreens', time: 2, passive: 0, tags: ['Vegan'], dot: DOMAIN_PALETTE.FINISHES, ingredients: [{ qty: '1', unit: 'pinch', name: 'Maldon Sea Salt' }], notes: '' }
          ]
        }
      ]
    }
  },
  archetype: 'HANDHELD',
  bucketAssignments: {
    vessel: ['taco-shell'],
    fillings: ['carnitas'],
    sauces: [],
    accents: ['pico-de-gallo', 'pickled-red-onion']
  },
  customTitle: '',
  savedRecipes: [],
  nextId: 1000
};

export default function App() {
  const [appState, setAppState] = useState(() => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch (e) {
      console.error(e);
    }
    return SEED_STATE;
  });

  const [currentTab, setCurrentTab] = useState('builder');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState(null);
  const [activeBucketTarget, setActiveBucketTarget] = useState('vessel');
  const [expandedProvKey, setExpandedProvKey] = useState(null);
  const [draggedCompId, setDraggedCompId] = useState(null);
  const [dragOverBucket, setDragOverBucket] = useState(null);
  const [editingFolderId, setEditingFolderId] = useState(null);

  // Registry filter & search
  const [registryFilter, setRegistryFilter] = useState(null);
  const [registrySearch, setRegistrySearch] = useState('');

  // Modals state
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [modalCompData, setModalCompData] = useState(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error(e);
    }
  }, [appState]);

  const resetToDefaults = () => {
    if (window.confirm("Reset state back to initial default library?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAppState(SEED_STATE);
    }
  };

  // Flattened component registry lookup
  const allComponents = useMemo(() => {
    const list = [];
    for (const catId of Object.keys(appState.categories)) {
      const catObj = appState.categories[catId];
      (catObj.unfiled || []).forEach(c => list.push({ ...c, category: catId, folderId: null }));
      (catObj.folders || []).forEach(f => {
        (f.comps || []).forEach(c => list.push({ ...c, category: catId, folderId: f.id }));
      });
    }
    return list;
  }, [appState.categories]);

  const findComp = (id) => allComponents.find(c => c.id === id) || null;

  const currentArchetype = ARCHETYPES[appState.archetype] || ARCHETYPES.CANVAS;

  // Resolved component buckets
  const resolvedBuckets = useMemo(() => {
    const map = {};
    for (const b of currentArchetype.buckets) {
      const ids = appState.bucketAssignments?.[b.id] || [];
      map[b.id] = ids.map(findComp).filter(Boolean);
    }
    return map;
  }, [appState.bucketAssignments, currentArchetype, allComponents]);

  const assembledList = useMemo(() => {
    return Object.values(resolvedBuckets).flat();
  }, [resolvedBuckets]);

  // Dynamic Title Computation
  const autoGeneratedTitle = useMemo(() => {
    if (!assembledList.length) return '';
    return assembledList.map(c => c.name).join(' with ');
  }, [assembledList]);

  const displayTitle = appState.customTitle || autoGeneratedTitle;

  // Time calculations
  const totalActiveTime = useMemo(() => assembledList.reduce((sum, c) => sum + (c.time || 0), 0), [assembledList]);
  const totalPassiveTime = useMemo(() => assembledList.reduce((sum, c) => sum + (c.passive || 0), 0), [assembledList]);

  // Attribute Inheritance & Dietary Intersection Check
  const inheritedMeta = useMemo(() => {
    const rawTags = [...new Set(assembledList.flatMap(c => c.tags || []))];
    const allergens = rawTags.filter(t => ALLERGENS.includes(t));
    const flavors = rawTags.filter(t => FLAVOR_TAGS.includes(t));

    // Ingredient-level dietary verification
    let isVegan = true;
    let isVegetarian = true;

    assembledList.forEach(comp => {
      (comp.ingredients || []).forEach(ing => {
        const nameLower = (ing.name || '').toLowerCase();
        if (ANIMAL_INGREDIENTS.some(animal => nameLower.includes(animal))) {
          isVegan = false;
          if (!nameLower.includes('milk') && !nameLower.includes('cheese') && !nameLower.includes('butter') && !nameLower.includes('egg')) {
            isVegetarian = false;
          }
        }
      });
    });

    const dietFlags = [];
    if (isVegan && assembledList.length > 0) dietFlags.push('Vegan');
    if (isVegetarian && assembledList.length > 0) dietFlags.push('Vegetarian');
    if (rawTags.includes('Gluten-Free')) dietFlags.push('Gluten-Free');

    return { allergens, flavors, dietFlags };
  }, [assembledList]);

  // Grouped Ingredient Inventory with Provenance
  const groupedInventory = useMemo(() => {
    const groups = {
      'Proteins & Meats': [],
      'Fresh Produce': [],
      'Dairy & Eggs': [],
      'Pantry & Liquids': []
    };

    assembledList.forEach(comp => {
      (comp.ingredients || []).forEach(ing => {
        if (!ing.name.trim()) return;
        const nameLower = ing.name.toLowerCase();
        let targetGroup = 'Pantry & Liquids';

        if (ANIMAL_INGREDIENTS.some(a => nameLower.includes(a))) targetGroup = 'Proteins & Meats';
        else if (['tomato', 'onion', 'cilantro', 'lime', 'garlic', 'pepper'].some(p => nameLower.includes(p))) targetGroup = 'Fresh Produce';
        else if (['milk', 'cheese', 'cream', 'butter', 'egg'].some(d => nameLower.includes(d))) targetGroup = 'Dairy & Eggs';

        groups[targetGroup].push({ ...ing, sourceComp: comp.name });
      });
    });

    return groups;
  }, [assembledList]);

  // Save Validation Check
  const saveValidation = useMemo(() => {
    const unfulfilledRequired = currentArchetype.buckets.filter(b => b.req && (!resolvedBuckets[b.id] || resolvedBuckets[b.id].length === 0));
    if (unfulfilledRequired.length > 0) {
      return { canSave: false, reason: `Missing required bucket: ${unfulfilledRequired[0].role}` };
    }
    if (assembledList.length === 0) {
      return { canSave: false, reason: 'Add at least 1 component to save dish' };
    }
    return { canSave: true, reason: '' };
  }, [currentArchetype, resolvedBuckets, assembledList]);

  // Handlers
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
      
      const updatedBuckets = { ...prev.bucketAssignments };
      for (const bKey in updatedBuckets) {
        updatedBuckets[bKey] = updatedBuckets[bKey].filter(id => !compIdsToRemove.includes(id));
      }

      return { ...prev, categories: nextCategories, bucketAssignments: updatedBuckets };
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

      const updatedBuckets = { ...prev.bucketAssignments };
      for (const bKey in updatedBuckets) {
        updatedBuckets[bKey] = updatedBuckets[bKey].filter(id => id !== cid);
      }

      return { ...prev, categories: nextCategories, bucketAssignments: updatedBuckets };
    });
  };

  const openComponentModal = (compId = null, defaultCategory = 'GRAINS', defaultFolderId = null) => {
    const comp = compId ? findComp(compId) : {
      id: '', name: '', time: 0, passive: 0, tags: [], ingredients: [{ qty: '', unit: '', name: '' }], notes: '', category: defaultCategory, folderId: defaultFolderId
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
        dot: CATEGORIES.find(c => c.id === compFormData.category)?.color || DOMAIN_PALETTE.GRAINS,
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

  const addCompToBucket = (compId, targetBucketId) => {
    setAppState(prev => {
      const bucketList = prev.bucketAssignments?.[targetBucketId] || [];
      if (bucketList.includes(compId)) return prev;
      return {
        ...prev,
        bucketAssignments: {
          ...prev.bucketAssignments,
          [targetBucketId]: [...bucketList, compId]
        }
      };
    });
  };

  const handleComponentClick = (comp) => {
    const matchingBucket = currentArchetype.buckets.find(b => b.allowedDomains.includes(comp.category));
    const targetId = matchingBucket ? matchingBucket.id : (activeBucketTarget || currentArchetype.buckets[0].id);
    addCompToBucket(comp.id, targetId);
  };

  const removeCompFromBucket = (compId, bucketId) => {
    setAppState(prev => {
      const bucketList = prev.bucketAssignments?.[bucketId] || [];
      return {
        ...prev,
        bucketAssignments: {
          ...prev.bucketAssignments,
          [bucketId]: bucketList.filter(id => id !== compId)
        }
      };
    });
  };

  const handleCopyShoppingList = () => {
    const lines = [];
    Object.entries(groupedInventory).forEach(([grp, items]) => {
      if (items.length) {
        lines.push(`--- ${grp} ---`);
        items.forEach(i => lines.push(`${i.qty} ${i.unit} ${i.name}`));
      }
    });
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Shopping list copied to clipboard!');
  };

  const filteredRegistryComps = useMemo(() => {
    let comps = registryFilter ? allComponents.filter(c => c.category === registryFilter) : allComponents;
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
            <i className="ti ti-chef-hat"></i> Culinary Engine
          </div>
          <nav className="nav">
            <button className={`ntab ${currentTab === 'builder' ? 'active' : ''}`} onClick={() => setCurrentTab('builder')}>Dish Builder</button>
            <button className={`ntab ${currentTab === 'registry' ? 'active' : ''}`} onClick={() => setCurrentTab('registry')}>Registry</button>
            <button className={`ntab ${currentTab === 'recipes' ? 'active' : ''}`} onClick={() => setCurrentTab('recipes')}>Recipe Library</button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentTab === 'builder' && (
          <div className="cols">
            {/* Sidebar Component Library */}
            <aside className="sidebar">
              <div className="sb-header">
                <span className="sb-title">Domain Library</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button className="reset-title-btn" title="Collapse All" onClick={collapseAllCategories} style={{ padding: '3px 6px' }}>
                    <i className="ti ti-fold-up"></i>
                  </button>
                  <button className="reset-title-btn" title="Expand All" onClick={expandAllCategories} style={{ padding: '3px 6px' }}>
                    <i className="ti ti-fold-down"></i>
                  </button>
                  <button className="save-btn" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => openComponentModal()}>
                    + New
                  </button>
                </div>
              </div>

              <div className="sb-search">
                <i className="ti ti-search"></i>
                <input type="text" placeholder="Search library..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} />
              </div>

              <div className="sb-legend">
                {CATEGORIES.map(cat => (
                  <span
                    key={cat.id}
                    className={`legend-chip ${domainFilter === cat.id ? 'active' : ''}`}
                    onClick={() => setDomainFilter(domainFilter === cat.id ? null : cat.id)}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }}></span>
                    {cat.id.slice(0, 4)}
                  </span>
                ))}
              </div>

              <div className="sb-scroll">
                {CATEGORIES.filter(c => !domainFilter || c.id === domainFilter).map(cat => {
                  const catObj = appState.categories[cat.id] || { collapsed: false, folders: [], unfiled: [] };
                  const searchQ = sidebarSearch.toLowerCase().trim();

                  const filteredFolders = catObj.folders.map(f => ({
                    ...f,
                    comps: f.comps.filter(c => !searchQ || c.name.toLowerCase().includes(searchQ) || (c.tags || []).some(t => t.toLowerCase().includes(searchQ)))
                  })).filter(f => f.comps.length > 0 || !searchQ);

                  const filteredUnfiled = (catObj.unfiled || []).filter(c => !searchQ || c.name.toLowerCase().includes(searchQ) || (c.tags || []).some(t => t.toLowerCase().includes(searchQ)));
                  const totalCatCount = catObj.folders.reduce((s, f) => s + f.comps.length, 0) + filteredUnfiled.length;

                  return (
                    <div key={cat.id} className="domain-group">
                      <div className="domain-bar" style={{ borderLeftColor: cat.color }} onClick={() => toggleCategory(cat.id)}>
                        <i className={`ti ti-chevron-right ${catObj.collapsed ? '' : 'open'}`} style={{ fontSize: '10px', transition: 'transform 0.15s', transform: catObj.collapsed ? 'none' : 'rotate(90deg)' }}></i>
                        <span className="domain-name">{cat.label}</span>
                        <span className="domain-count">{totalCatCount}</span>
                        <button className="reset-title-btn" title="Add folder" style={{ padding: '1px 4px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); addFolder(cat.id); }}>
                          + Folder
                        </button>
                      </div>

                      {!catObj.collapsed && (
                        <div className="folder-tree">
                          {filteredFolders.map(f => (
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
                              handleComponentClick={handleComponentClick}
                              setDraggedCompId={setDraggedCompId}
                            />
                          ))}
                          {filteredUnfiled.length > 0 && (
                            <FolderItem
                              isUnfiled
                              folder={{ id: null, name: 'Unfiled', collapsed: false, comps: filteredUnfiled }}
                              categoryId={cat.id}
                              openComponentModal={openComponentModal}
                              removeComp={removeComp}
                              handleComponentClick={handleComponentClick}
                              setDraggedCompId={setDraggedCompId}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Fluid Builder Canvas */}
            <section className="builder">
              {/* Archetype Selector Bar */}
              <div className="archetype-bar">
                <div className="arch-info">
                  <span className="arch-title">Assembly Archetype</span>
                  <span className="arch-desc">{currentArchetype.desc}</span>
                </div>
                <div className="arch-pills">
                  {Object.keys(ARCHETYPES).map(key => (
                    <button
                      key={key}
                      className={`arch-pill ${appState.archetype === key ? 'active' : ''}`}
                      onClick={() => setAppState(prev => ({ ...prev, archetype: key }))}
                    >
                      {ARCHETYPES[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Dish Title Card */}
              <div className="title-card">
                <div className="title-header">
                  <span className="title-badge">{appState.customTitle ? 'Custom Title' : 'Auto-Generated Title'}</span>
                  {appState.customTitle && (
                    <button className="reset-title-btn" onClick={() => setAppState(prev => ({ ...prev, customTitle: '' }))}>
                      Reset to Auto
                    </button>
                  )}
                </div>
                <div className="title-input-wrapper">
                  <input
                    type="text"
                    className="title-input"
                    value={displayTitle}
                    placeholder="Drag or click components to generate dish title..."
                    onChange={e => setAppState(prev => ({ ...prev, customTitle: e.target.value }))}
                  />
                </div>
                <div className="meta-row">
                  {(totalActiveTime > 0 || totalPassiveTime > 0) && (
                    <span className="chip"><i className="ti ti-clock"></i> {totalActiveTime}m active {totalPassiveTime > 0 ? `+ ${totalPassiveTime}m passive` : ''}</span>
                  )}
                  {inheritedMeta.allergens.map(a => (
                    <span key={a} className="chip allergen">⚠ {a}</span>
                  ))}
                  {inheritedMeta.dietFlags.map(d => (
                    <span key={d} className="chip diet">✓ {d}</span>
                  ))}
                  {inheritedMeta.flavors.map(f => (
                    <span key={f} className="chip">{f}</span>
                  ))}
                </div>
              </div>

              {/* Fluid Assembly Buckets */}
              <div className="buckets-container">
                {currentArchetype.buckets.map(b => {
                  const compList = resolvedBuckets[b.id] || [];
                  const isTarget = activeBucketTarget === b.id;
                  const isDragOver = dragOverBucket === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`bucket-card ${isTarget ? 'target-active' : ''}`}
                      onClick={() => setActiveBucketTarget(b.id)}
                    >
                      <div className="bucket-header">
                        <div className="bucket-role-group">
                          <span className="bucket-role">{b.role}</span>
                          <span className={`bucket-req-badge ${b.req ? 'req' : 'opt'}`}>{b.req ? 'REQUIRED' : 'OPTIONAL'}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{compList.length} component{compList.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div
                        className={`bucket-drop-zone ${isDragOver ? 'dragover' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOverBucket(b.id); }}
                        onDragLeave={() => setDragOverBucket(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverBucket(null);
                          if (draggedCompId) addCompToBucket(draggedCompId, b.id);
                        }}
                      >
                        {compList.length > 0 ? (
                          compList.map(comp => (
                            <div key={comp.id} className="bucket-comp-pill" style={{ borderLeftColor: comp.dot }}>
                              <span>{comp.name}</span>
                              <span className="time-tag">({comp.time}m)</span>
                              <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeCompFromBucket(comp.id, b.id); }}>×</button>
                            </div>
                          ))
                        ) : (
                          <div className="bucket-empty-text">
                            + Drag or click component from library to add to {b.role.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grouped Ingredient Inventory */}
              <div className="inventory-card">
                <div className="inv-header">
                  <span className="inv-title">Aggregated Ingredient Inventory</span>
                  <button className="inv-copy-btn" onClick={handleCopyShoppingList}>Copy Shopping List</button>
                </div>
                <div className="inv-grid">
                  {Object.entries(groupedInventory).filter(([_, items]) => items.length > 0).map(([groupName, items]) => (
                    <div key={groupName} className="inv-group">
                      <div className="inv-group-title">{groupName} ({items.length})</div>
                      {items.map((ing, idx) => {
                        const key = `${groupName}-${idx}`;
                        const isExpanded = expandedProvKey === key;
                        return (
                          <div key={key} className="inv-item" onClick={() => setExpandedProvKey(isExpanded ? null : key)}>
                            <span>• {ing.qty} {ing.unit} {ing.name}</span>
                            {isExpanded && <span className="inv-item-provenance">Source: {ing.sourceComp}</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Assembly Action */}
              <div className="save-row">
                {!saveValidation.canSave && <span className="save-hint">{saveValidation.reason}</span>}
                <button className="save-btn" disabled={!saveValidation.canSave}>Save to Recipe Library →</button>
              </div>
            </section>
          </div>
        )}

        {/* REGISTRY TAB */}
        {currentTab === 'registry' && (
          <div>
            <div className="inv-header" style={{ marginBottom: '16px' }}>
              <span className="inv-title">Component Registry ({filteredRegistryComps.length} items)</span>
              <button className="reset-title-btn" onClick={resetToDefaults}>Reset Seed Data</button>
            </div>

            {/* Filter & Search Bar */}
            <div className="sb-legend" style={{ marginBottom: '16px', gap: '8px' }}>
              <button className={`arch-pill ${registryFilter === null ? 'active' : ''}`} onClick={() => setRegistryFilter(null)}>All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} className={`arch-pill ${registryFilter === c.id ? 'active' : ''}`} onClick={() => setRegistryFilter(c.id)}>
                  {c.label}
                </button>
              ))}
              <div className="sb-search" style={{ width: '220px', marginLeft: 'auto' }}>
                <i className="ti ti-search"></i>
                <input
                  type="text"
                  placeholder="Search registry..."
                  value={registrySearch}
                  onChange={e => setRegistrySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="reg-grid">
              {filteredRegistryComps.map(c => (
                <div key={c.id} className="recipe-card" style={{ borderLeftColor: c.dot }} onClick={() => openComponentModal(c.id)}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>{c.category}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--faint)' }}>{c.time}m active {c.passive ? `+ ${c.passive}m passive` : ''}</div>
                </div>
              ))}
              <div className="recipe-card" style={{ borderStyle: 'dashed', borderLeftStyle: 'dashed', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }} onClick={() => openComponentModal(null, registryFilter || 'GRAINS')}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>+ Add Component</span>
              </div>
            </div>
          </div>
        )}

        {/* RECIPES TAB */}
        {currentTab === 'recipes' && (
          <div>
            <div className="inv-header" style={{ marginBottom: '16px' }}>
              <span className="inv-title">Recipe Library</span>
            </div>
            <div className="recipe-grid">
              {[...SEED_RECIPES, ...appState.savedRecipes].map(r => (
                <div key={r.id} className="recipe-card">
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>{r.cat}</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>{r.title}</div>
                  <div className="meta-row">
                    {(r.tags || []).map(t => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
  handleComponentClick,
  setDraggedCompId
}) {
  const [folderNameVal, setFolderNameVal] = useState(folder.name);
  const isOpen = !folder.collapsed;

  const handleBlurOrEnter = () => {
    renameFolder(folder.id, folderNameVal.trim());
    setEditingFolderId(null);
  };

  return (
    <div style={{ marginBottom: '2px' }}>
      <div
        className="folder-row"
        onClick={(e) => {
          if (e.target.closest('.folder-actions, .folder-name-input')) return;
          if (!isUnfiled) toggleFolder(folder.id);
        }}
      >
        <i className={`ti ti-chevron-right ${isOpen ? 'open' : ''}`} style={{ fontSize: '10px', transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'none' }}></i>
        <i className={`ti ${isOpen ? 'ti-folder-open' : 'ti-folder'}`}></i>

        {editingFolderId === folder.id && !isUnfiled ? (
          <input
            type="text"
            className="title-input"
            style={{ fontSize: '12px', padding: '0 4px', width: '120px' }}
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
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</span>
        )}

        <div className="folder-actions" style={{ display: 'flex', gap: '2px' }}>
          <button
            className="reset-title-btn"
            style={{ padding: '1px 4px', fontSize: '10px' }}
            title="Add component"
            onClick={(e) => { e.stopPropagation(); openComponentModal(null, categoryId, folder.id); }}
          >
            +
          </button>
          {!isUnfiled && (
            <>
              <button
                className="reset-title-btn"
                style={{ padding: '1px 4px', fontSize: '10px' }}
                title="Rename folder"
                onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); }}
              >
                ✎
              </button>
              <button
                className="reset-title-btn"
                style={{ padding: '1px 4px', fontSize: '10px' }}
                title="Delete folder"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete folder "${folder.name}"?`)) deleteFolder(folder.id);
                }}
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="folder-comps">
          {folder.comps.map(comp => (
            <div
              key={comp.id}
              className="comp-tree-item"
              draggable
              onDragStart={() => setDraggedCompId(comp.id)}
              onClick={(e) => {
                if (e.target.closest('.comp-actions')) return;
                handleComponentClick(comp);
              }}
            >
              <span title={comp.name}>{comp.name}</span>
              <div className="comp-actions" style={{ display: 'flex', gap: '4px' }}>
                <button className="reset-title-btn" style={{ padding: '0 4px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); openComponentModal(comp.id); }}>✎</button>
                <button className="reset-title-btn" style={{ padding: '0 4px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); removeComp(comp.id); }}>×</button>
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
    ingredients: data?.ingredients?.length ? data.ingredients.map(i => ({ qty: i.qty || '', unit: i.unit || '', name: i.name || '' })) : [{ qty: '', unit: '', name: '' }],
    notes: data?.notes || ''
  });

  const [tagInput, setTagInput] = useState('');

  const availableFolders = useMemo(() => {
    return categories[formData.category]?.folders || [];
  }, [categories, formData.category]);

  const handleIngChange = (index, field, val) => {
    const updated = [...formData.ingredients];
    updated[index][field] = val;
    setFormData({ ...formData, ingredients: updated });
  };

  const addIngRow = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { qty: '', unit: '', name: '' }] });
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">{data?.isEdit ? 'Edit Component' : 'Create Component'}</div>
          <button className="reset-title-btn" onClick={onClose}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Component Name</label>
              <input
                type="text"
                className="title-input"
                style={{ fontSize: '14px' }}
                placeholder="e.g. Yuzu Curd"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Shorthand ID</label>
              <input
                type="text"
                className="title-input"
                style={{ fontSize: '14px' }}
                placeholder="e.g. yuzu-curd"
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Domain Category</label>
              <select
                className="arch-pill"
                style={{ width: '100%', marginTop: '4px' }}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value, folderId: '' })}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Folder Target</label>
              <select
                className="arch-pill"
                style={{ width: '100%', marginTop: '4px' }}
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Active Prep Time (mins)</label>
              <input
                type="number"
                className="title-input"
                style={{ fontSize: '14px' }}
                min="0"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Passive Time (mins)</label>
              <input
                type="number"
                className="title-input"
                style={{ fontSize: '14px' }}
                min="0"
                value={formData.passive}
                onChange={e => setFormData({ ...formData, passive: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Ingredients List</label>
            <table style={{ width: '100%', marginTop: '6px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '10px', color: 'var(--faint)', textTransform: 'uppercase', textAlign: 'left' }}>
                  <th style={{ width: '20%' }}>Qty</th>
                  <th style={{ width: '20%' }}>Unit</th>
                  <th style={{ width: '55%' }}>Ingredient Tag Name</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.ingredients.map((ing, i) => (
                  <tr key={i}>
                    <td><input type="text" className="title-input" style={{ fontSize: '12px' }} value={ing.qty} placeholder="400" onChange={e => handleIngChange(i, 'qty', e.target.value)} /></td>
                    <td><input type="text" className="title-input" style={{ fontSize: '12px' }} value={ing.unit} placeholder="g" onChange={e => handleIngChange(i, 'unit', e.target.value)} /></td>
                    <td><input type="text" className="title-input" style={{ fontSize: '12px' }} value={ing.name} placeholder="e.g. Flank Steak" onChange={e => handleIngChange(i, 'name', e.target.value)} /></td>
                    <td><button type="button" className="reset-title-btn" onClick={() => removeIngRow(i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="reset-title-btn" style={{ marginTop: '6px' }} onClick={addIngRow}>+ Add Ingredient</button>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--muted)' }}>Component Modifier Tags</label>
            <div className="sb-search" style={{ margin: '6px 0', flexWrap: 'wrap', gap: '4px' }}>
              {formData.tags.map(t => (
                <span key={t} className="chip">
                  {t} <span style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) })}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag + Enter..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            <div className="meta-row">
              {PREDEFINED_TAGS.map(t => (
                <span key={t} className="chip" style={{ cursor: 'pointer', fontSize: '10px' }} onClick={() => {
                  if (!formData.tags.includes(t)) setFormData({ ...formData, tags: [...formData.tags, t] });
                }}>
                  + {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button className="reset-title-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={() => onSave(formData)}>Save Component</button>
        </div>
      </div>
    </div>
  );
}