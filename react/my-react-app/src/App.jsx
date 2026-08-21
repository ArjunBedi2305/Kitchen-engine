import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// ── CONSTANTS & SEED DATA ─────────────────────────────────────────────────────
const STORAGE_KEY = 'culinaryEngineState';
const ROLES = [
  { id: 'BASE', label: 'Base vehicles', color: '#C4736A' },
  { id: 'PRIMARY', label: 'Primary flavors', color: '#E8A020' },
  { id: 'SECONDARY', label: 'Secondary / aromatic', color: '#6B8F71' },
  { id: 'TEXTURE', label: 'Textures', color: '#888780' },
];
const ROLE_DOTS = { BASE: '#C4736A', PRIMARY: '#E8A020', SECONDARY: '#6B8F71', TEXTURE: '#888780' };
const SLOT_MAXES = { BASE: 1, PRIMARY: 3, SECONDARY: 3, TEXTURE: 3 };
const ALLERGENS = ['Dairy', 'Gluten', 'Tree Nuts', 'Eggs', 'Sesame', 'Soy', 'Peanuts', 'Shellfish'];
const PREDEFINED_TAGS = ['Dairy', 'Gluten', 'Tree Nuts', 'Eggs', 'Sesame', 'Soy', 'Vegan', 'Vegetarian', 'Sweet', 'Sour', 'Bitter', 'Floral', 'Smoky', 'Tangy', 'Crispy', 'Silky', 'Chilled', 'Hot', 'Earthy'];

const SEED_RECIPES = [
  {
    id: 'seed-1',
    title: 'Smoked Hibiscus Yuzu Cheesecake Base with Dark Chocolate Ganache',
    tags: ['Dairy', 'Gluten', 'Eggs', 'Floral', 'Smoky', 'Tangy', 'Bitter'],
    cat: 'DESSERT',
    bcg: 'STAR',
    chefNotes: 'Ensure the Yuzu curd is emulsified before adding to the ganache layer.',
    components: [
      { id: 'c1', role: 'BASE' },
      { id: 'c9', role: 'PRIMARY' },
      { id: 'c13', role: 'PRIMARY' },
      { id: 'c16', role: 'SECONDARY' }
    ]
  },
  {
    id: 'seed-2',
    title: 'Jasmine Mango Pâte Sucrée with Toasted Almond Praline',
    tags: ['Dairy', 'Gluten', 'Tree Nuts', 'Floral', 'Tropical', 'Nutty', 'Sweet'],
    cat: 'DESSERT',
    bcg: 'PLOWHORSE',
    chefNotes: 'Bake crust until lightly golden brown. Dust with almond powder while hot.',
    components: [
      { id: 'c4', role: 'BASE' },
      { id: 'c7', role: 'PRIMARY' },
      { id: 'c15', role: 'SECONDARY' },
      { id: 'c20', role: 'TEXTURE' }
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
            { id: 'c1', name: 'Cheesecake Base', time: 20, passive: 180, tags: ['Dairy', 'Gluten', 'Sweet', 'Chilled'], dot: '#C4736A', ingredients: [{ qty: '250', unit: 'g', name: 'Cream Cheese' }, { qty: '100', unit: 'g', name: 'Sugar' }, { qty: '2', unit: 'pcs', name: 'Eggs' }], notes: 'Bake in water bath.' },
            { id: 'c2', name: 'Vanilla Panna Cotta', time: 10, passive: 240, tags: ['Dairy', 'Sweet', 'Silky'], dot: '#FAC775', ingredients: [{ qty: '300', unit: 'ml', name: 'Heavy Cream' }, { qty: '1', unit: 'tsp', name: 'Vanilla Bean Paste' }], notes: 'Set with gelatin.' },
            { id: 'c3', name: 'Crème Brûlée Base', time: 15, passive: 60, tags: ['Dairy', 'Eggs', 'Sweet', 'Rich'], dot: '#E8A020', ingredients: [{ qty: '4', unit: 'yolks', name: 'Egg Yolks' }], notes: '' }
          ]
        },
        {
          id: 'f-base-handhelds',
      name: 'Wraps & Handhelds',
      collapsed: false,
      comps: [
        { id: 'c-v-1', name: 'Taco Shell / Tortilla', time: 5, passive: 0, tags: ['Gluten-Free'], dot: '#C4736A', ingredients: [], notes: 'Soft corn or flour tortilla format.' },
        { id: 'c-v-2', name: 'Burrito / Stuffed Wrap', time: 5, passive: 0, tags: ['Gluten'], dot: '#C4736A', ingredients: [], notes: 'Large flour tortilla or flatbread.' },
        { id: 'c-v-3', name: 'Sandwich / Bun / Roll', time: 5, passive: 0, tags: ['Gluten'], dot: '#C4736A', ingredients: [], notes: 'Brioche, sourdough baguette, or ciabatta base.' },
        { id: 'c-v-4', name: 'Pita Pocket / Flatbread', time: 5, passive: 0, tags: ['Gluten'], dot: '#C4736A', ingredients: [], notes: 'Naan, pita, or lavash fold.' },
        { id: 'c-v-5', name: 'Spring Roll / Summer Roll Wrap', time: 10, passive: 0, tags: ['Vegan', 'Gluten-Free'], dot: '#C4736A', ingredients: [], notes: 'Rice paper or crisp wrapper.' }
      ]
        },{
      id: 'f-base-bowls-plates',
      name: 'Rice, Grain & Noodle Dishes',
      collapsed: false,
      comps: [
        { id: 'c-v-6', name: 'Plated Pasta Format', time: 15, passive: 0, tags: ['Gluten'], dot: '#C4736A', ingredients: [], notes: 'Fresh egg pasta, ramen, or udon base.' },
        { id: 'c-v-7', name: 'Biryani / Layered Rice Bowl', time: 25, passive: 15, tags: ['Gluten-Free'], dot: '#C4736A', ingredients: [], notes: 'Spiced rice base format.' },
        { id: 'c-v-8', name: 'Risotto / Creamy Grain Base', time: 25, passive: 0, tags: ['Gluten-Free', 'Dairy'], dot: '#C4736A', ingredients: [], notes: 'Arborio, polenta, or grits bowl.' },
        { id: 'c-v-9', name: 'Donburi / Seasoned Rice Bowl', time: 10, passive: 0, tags: ['Gluten-Free'], dot: '#C4736A', ingredients: [], notes: 'Sushi rice or jasmine rice format.' }
      ]
    },
    {
      id: 'f-base-soups-stews',
      name: 'Soups, Broths & Braises',
      collapsed: false,
      comps: [
        { id: 'c-v-10', name: 'Ramen / Noodle Soup Bowl', time: 20, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [], notes: 'Broth and noodle vehicle.' },
        { id: 'c-v-11', name: 'Stew / Curry Vessel', time: 20, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [], notes: 'Deep plate or bowl format.' },
        { id: 'c-v-12', name: 'Chowder / Bisque Vessel', time: 15, passive: 0, tags: ['Dairy', 'Hot'], dot: '#C4736A', ingredients: [], notes: 'Rich soup vessel format.' }
      ]
    },
        
        {
          id: 'f-base-proteins', name: 'Proteins & Main Seared Cuts', collapsed: false, comps: [
            { id: 'c508', name: 'Seared Ribeye Steak', time: 15, passive: 10, tags: ['Rich', 'Hot'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'cut', name: 'Ribeye' }], notes: 'Cast iron sear finish.' },
            { id: 'c509', name: 'Crispy Skin Salmon Fillet', time: 10, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Salmon fillet' }], notes: '' },
            { id: 'c510', name: 'Sous Vide Duck Breast', time: 15, passive: 90, tags: ['Rich'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'pc', name: 'Duck breast' }], notes: 'Score skin prior to pan roast.' },
            { id: 'c511', name: 'Seared Pan-Tofu', time: 12, passive: 0, tags: ['Vegan'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Firm tofu' }], notes: '' }
          ]
        },
        {
  id: 'f-base-proteins-expanded',
  name: 'Proteins (Common & Specialty)',
  collapsed: false,
  comps: [
    // ── 20 COMMON PROTEINS ───────────────────────────────────────────
    { id: 'c-prot-1', name: 'Chicken Breast', time: 15, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Chicken breast' }], notes: 'Pan sear or grill.' },
    { id: 'c-prot-2', name: 'Chicken Thigh (Boneless)', time: 20, passive: 0, tags: ['Hot', 'Rich'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Chicken thigh' }], notes: 'High moisture retention.' },
    { id: 'c-prot-3', name: 'Ground Beef (80/20)', time: 12, passive: 0, tags: ['Hot', 'Rich'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Ground beef' }], notes: 'Ideal for smash patties or ragù.' },
    { id: 'c-prot-4', name: 'Beef Chuck Roast', time: 25, passive: 180, tags: ['Hot', 'Rich'], dot: '#C4736A', ingredients: [{ qty: '500', unit: 'g', name: 'Chuck roast' }], notes: 'Braised low and slow.' },
    { id: 'c-prot-5', name: 'Ribeye Steak', time: 15, passive: 10, tags: ['Hot', 'Rich'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'cut', name: 'Ribeye' }], notes: 'Cast iron finish.' },
    { id: 'c-prot-6', name: 'Pork Chops', time: 15, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'cut', name: 'Pork chop' }], notes: 'Brine prior to searing.' },
    { id: 'c-prot-7', name: 'Pork Shoulder / Butt', time: 30, passive: 360, tags: ['Hot', 'Rich', 'Smoky'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'kg', name: 'Pork shoulder' }], notes: 'Slow roast or smoke for pulled pork.' },
    { id: 'c-prot-8', name: 'Pork Belly', time: 30, passive: 120, tags: ['Hot', 'Rich', 'Crispy'], dot: '#C4736A', ingredients: [{ qty: '400', unit: 'g', name: 'Pork belly' }], notes: 'Score skin for crackling.' },
    { id: 'c-prot-9', name: 'Bacon / Strip Bacon', time: 8, passive: 0, tags: ['Crispy', 'Smoky', 'Rich'], dot: '#C4736A', ingredients: [{ qty: '4', unit: 'slices', name: 'Bacon' }], notes: 'Render fat slowly.' },
    { id: 'c-prot-10', name: 'Salmon Fillet', time: 12, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Salmon fillet' }], notes: 'Sear skin-side down first.' },
    { id: 'c-prot-11', name: 'Jumbo Shrimp / Prawns', time: 6, passive: 0, tags: ['Shellfish', 'Hot'], dot: '#C4736A', ingredients: [{ qty: '150', unit: 'g', name: 'Shrimp' }], notes: 'Quick flash sear or poach.' },
    { id: 'c-prot-12', name: 'Canned / Fresh Tuna Loin', time: 8, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '150', unit: 'g', name: 'Tuna loin' }], notes: 'High heat sear exterior only.' },
    { id: 'c-prot-13', name: 'Cod Fillet', time: 10, passive: 0, tags: ['Hot', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '180', unit: 'g', name: 'Cod fillet' }], notes: 'Gentle pan roast or butter poach.' },
    { id: 'c-prot-14', name: 'Lamb Chop / Cutlet', time: 12, passive: 5, tags: ['Hot', 'Earthy'], dot: '#C4736A', ingredients: [{ qty: '2', unit: 'pcs', name: 'Lamb chop' }], notes: 'Pair with garlic and rosemary.' },
    { id: 'c-prot-15', name: 'Turkey Breast', time: 20, passive: 0, tags: ['Hot'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Turkey breast' }], notes: 'Sous-vide or roast.' },
    { id: 'c-prot-16', name: 'Firm Tofu', time: 12, passive: 15, tags: ['Vegan'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Firm tofu' }], notes: 'Press excess water before frying.' },
    { id: 'c-prot-17', name: 'Soft-Boiled Hen Egg', time: 7, passive: 0, tags: ['Eggs', 'Vegetarian', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'pc', name: 'Hen egg' }], notes: '7-minute jammy yolk boil.' },
    { id: 'c-prot-18', name: 'Red / Brown Lentils', time: 25, passive: 0, tags: ['Vegan', 'Earthy'], dot: '#C4736A', ingredients: [{ qty: '150', unit: 'g', name: 'Lentils' }], notes: 'Simmer until tender.' },
    { id: 'c-prot-19', name: 'Chickpeas (Garbanzo)', time: 15, passive: 0, tags: ['Vegan', 'Nutty'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Chickpeas' }], notes: 'Roast for crunch or simmer.' },
    { id: 'c-prot-20', name: 'Black Beans', time: 20, passive: 0, tags: ['Vegan', 'Earthy'], dot: '#C4736A', ingredients: [{ qty: '200', unit: 'g', name: 'Black beans' }], notes: 'Season with cumin and garlic.' },

    // ── 10 CURATED SPECIALTY PROTEINS ────────────────────────────────
    { id: 'c-spec-1', name: 'A5 Wagyu Beef Striploin', time: 6, passive: 5, tags: ['Hot', 'Rich', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '120', unit: 'g', name: 'A5 Wagyu' }], notes: 'High intramuscular fat; light sear only.' },
    { id: 'c-spec-2', name: 'Duck Leg Confit', time: 15, passive: 240, tags: ['Hot', 'Rich', 'Crispy'], dot: '#C4736A', ingredients: [{ qty: '1', unit: 'leg', name: 'Duck leg' }, { qty: '200', unit: 'g', name: 'Duck fat' }], notes: 'Slow poach in fat, crisp skin in oven.' },
    { id: 'c-spec-3', name: 'Seared Foie Gras', time: 4, passive: 0, tags: ['Hot', 'Rich', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '60', unit: 'g', name: 'Foie gras slice' }], notes: 'Scored surface, screaming hot dry pan.' },
    { id: 'c-spec-4', name: 'Spanish Jamón Ibérico', time: 0, passive: 0, tags: ['Nutty', 'Rich', 'Chilled'], dot: '#C4736A', ingredients: [{ qty: '30', unit: 'g', name: 'Jamón Ibérico' }], notes: 'Serve razor-thin at room temperature.' },
    { id: 'c-spec-5', name: 'Guanciale (Cured Pork Cheek)', time: 10, passive: 0, tags: ['Crispy', 'Rich', 'Hot'], dot: '#C4736A', ingredients: [{ qty: '80', unit: 'g', name: 'Guanciale' }], notes: 'Essential fat base for Carbonara & Amatriciana.' },
    { id: 'c-spec-6', name: 'Hokkaido Sea Scallops', time: 4, passive: 0, tags: ['Hot', 'Sweet', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '3', unit: 'pcs', name: 'Sea scallops' }], notes: 'Hard sear on 1 side, baste with brown butter.' },
    { id: 'c-spec-7', name: 'Uni (Fresh Sea Urchin)', time: 0, passive: 0, tags: ['Chilled', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '30', unit: 'g', name: 'Uni' }], notes: 'Briny, sweet ocean flavor; delicate texture.' },
    { id: 'c-spec-8', name: 'Charred Spanish Octopus', time: 15, passive: 90, tags: ['Hot', 'Smoky', 'Crispy'], dot: '#C4736A', ingredients: [{ qty: '150', unit: 'g', name: 'Octopus tentacle' }], notes: 'Tenderize by braising before high-heat grilling.' },
    { id: 'c-spec-9', name: 'Sablefish (Black Cod)', time: 12, passive: 720, tags: ['Hot', 'Rich', 'Silky'], dot: '#C4736A', ingredients: [{ qty: '180', unit: 'g', name: 'Black cod' }], notes: 'High oil content; pairs exceptionally with sweet miso marination.' },
    { id: 'c-spec-10', name: 'Tempeh', time: 10, passive: 0, tags: ['Vegan', 'Nutty', 'Earthy'], dot: '#C4736A', ingredients: [{ qty: '150', unit: 'g', name: 'Tempeh' }], notes: 'Fermented whole soybean block; shallow fry for crispness.' }
  ]
}
        
      ]
    },
    PRIMARY: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-primary-fruit', name: 'Fruit & Curds', collapsed: false, comps: [
            { id: 'c7', name: 'Mango Purée', time: 10, passive: 0, tags: ['Vegan', 'Tropical', 'Sweet'], dot: '#E8A020', ingredients: [{ qty: '500', unit: 'g', name: 'Fresh Mango' }], notes: '' },
            { id: 'c8', name: 'Lychee Compote', time: 15, passive: 0, tags: ['Vegan', 'Floral', 'Sweet'], dot: '#C4736A', ingredients: [], notes: '' },
            { id: 'c9', name: 'Yuzu Curd', time: 15, passive: 20, tags: ['Eggs', 'Dairy', 'Sour', 'Citric'], dot: '#EF9F27', ingredients: [{ qty: '100', unit: 'ml', name: 'Yuzu Juice' }, { qty: '3', unit: 'pcs', name: 'Eggs' }], notes: 'Cook over double boiler until thick.' },
            { id: 'c10', name: 'Raspberry Coulis', time: 10, passive: 0, tags: ['Vegan', 'Tangy', 'Sweet'], dot: '#D4537E', ingredients: [], notes: '' }
          ]
        },
        {
          id: 'f-primary-sauces', name: 'Sauces, Curries & Braises', collapsed: false, comps: [
            { id: 'c13', name: 'Dark Chocolate Ganache', time: 12, passive: 30, tags: ['Dairy', 'Bitter', 'Rich', 'Silky'], dot: '#2C2C2A', ingredients: [{ qty: '200', unit: 'g', name: '70% Dark Chocolate' }, { qty: '200', unit: 'ml', name: 'Cream' }], notes: 'Emulsify gently.' },
            { id: 'c520', name: 'Classic Béchamel / Mornay', time: 15, passive: 0, tags: ['Dairy', 'Gluten'], dot: '#E8A020', ingredients: [{ qty: '500', unit: 'ml', name: 'Whole milk' }, { qty: '50', unit: 'g', name: 'Butter' }], notes: 'French Mother Sauce.' },
            { id: 'c521', name: 'Slow-Cooked Ragù Bolognese', time: 30, passive: 180, tags: ['Dairy', 'Rich'], dot: '#E8A020', ingredients: [{ qty: '250', unit: 'g', name: 'Ground beef' }, { qty: '250', unit: 'g', name: 'Ground pork' }], notes: '' },
            { id: 'c522', name: 'Red Curry Base', time: 15, passive: 30, tags: ['Spicy', 'Tropical'], dot: '#E8A020', ingredients: [{ qty: '100', unit: 'g', name: 'Red curry paste' }, { qty: '400', unit: 'ml', name: 'Coconut milk' }], notes: '' },
            { id: 'c523', name: 'Mole Negro', time: 45, passive: 120, tags: ['Smoky', 'Bitter', 'Rich'], dot: '#E8A020', ingredients: [{ qty: '3', unit: 'type', name: 'Chipotle/Ancho/Guajillo' }], notes: 'Complex Mexican reduced sauce.' },
            { id: 'c524', name: 'San Marzano Marinara', time: 10, passive: 45, tags: ['Vegan'], dot: '#E8A020', ingredients: [{ qty: '800', unit: 'g', name: 'San Marzano tomato' }], notes: '' }
          ]
        },
        {
          id: 'f-primary-cheeses', name: 'Cheeses & Purees', collapsed: false, comps: [
            { id: 'c525', name: 'Burrata & Basil Oil', time: 5, passive: 0, tags: ['Dairy', 'Vegetarian', 'Silky'], dot: '#E8A020', ingredients: [{ qty: '1', unit: 'ball', name: 'Mozzarella di bufala / Burrata' }], notes: '' },
            { id: 'c526', name: 'Roasted Butternut Squash Puree', time: 15, passive: 40, tags: ['Vegan', 'Earthy'], dot: '#E8A020', ingredients: [{ qty: '1', unit: 'pc', name: 'Butternut squash' }], notes: '' }
          ]
        }
      ]
    },
    SECONDARY: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-secondary-floral', name: 'Infusions & Syrups', collapsed: false, comps: [
            { id: 'c15', name: 'Jasmine Tea Infusion', time: 5, passive: 15, tags: ['Vegan', 'Floral', 'Hot'], dot: '#6B8F71', ingredients: [{ qty: '10', unit: 'g', name: 'Jasmine Green Tea' }], notes: '' },
            { id: 'c16', name: 'Smoked Hibiscus Syrup', time: 20, passive: 30, tags: ['Vegan', 'Floral', 'Smoky', 'Tangy'], dot: '#C4736A', ingredients: [{ qty: '50', unit: 'g', name: 'Dried Hibiscus' }, { qty: '200', unit: 'g', name: 'Sugar' }], notes: 'Infuse wood smoke prior to strain.' }
          ]
        },
        {
          id: 'f-secondary-condiments', name: 'Oils, Emulsions & Condiments', collapsed: false, comps: [
            { id: 'c530', name: 'Garlic Aïoli / Toum', time: 10, passive: 0, tags: ['Eggs', 'Tangy'], dot: '#6B8F71', ingredients: [{ qty: '4', unit: 'cloves', name: 'Garlic' }, { qty: '1', unit: 'pc', name: 'Egg yolk' }], notes: '' },
            { id: 'c531', name: 'Chili Crisp & Sesame Oil', time: 15, passive: 15, tags: ['Vegan', 'Spicy', 'Smoky'], dot: '#6B8F71', ingredients: [{ qty: '50', unit: 'g', name: 'Gochugaru' }, { qty: '100', unit: 'ml', name: 'Neutral oil' }], notes: '' },
            { id: 'c532', name: 'Chimichurri Salsa', time: 10, passive: 0, tags: ['Vegan', 'Tangy'], dot: '#6B8F71', ingredients: [{ qty: '1', unit: 'bunch', name: 'Flat-leaf parsley' }, { qty: '30', unit: 'ml', name: 'Red wine vinegar' }], notes: '' },
            { id: 'c533', name: 'Pesto Genovese', time: 10, passive: 0, tags: ['Dairy', 'Tree Nuts', 'Vegetarian'], dot: '#6B8F71', ingredients: [{ qty: '2', unit: 'cups', name: 'Italian basil' }, { qty: '50', unit: 'g', name: 'Parmigiano-Reggiano' }], notes: '' },
            { id: 'c534', name: 'Aged Balsamic Reduction', time: 5, passive: 20, tags: ['Vegan', 'Sweet', 'Tangy'], dot: '#6B8F71', ingredients: [{ qty: '100', unit: 'ml', name: 'Balsamic vinegar' }], notes: '' }
          ]
        }
      ]
    },
    TEXTURE: {
      collapsed: false,
      unfiled: [],
      folders: [
        {
          id: 'f-texture-crunch', name: 'Crunch & Nuts', collapsed: false, comps: [
            { id: 'c20', name: 'Toasted Almond Praline', time: 20, passive: 10, tags: ['Tree Nuts', 'Nutty', 'Crispy'], dot: '#E8A020', ingredients: [{ qty: '150', unit: 'g', name: 'Almonds' }, { qty: '100', unit: 'g', name: 'Caramelized Sugar' }], notes: 'Crush finely in food processor.' },
            { id: 'c540', name: 'Toasted Sesame Furikake', time: 5, passive: 0, tags: ['Sesame', 'Crispy', 'Earthy'], dot: '#888780', ingredients: [{ qty: '2', unit: 'tbsp', name: 'Toasted sesame seeds' }, { qty: '1', unit: 'sheet', name: 'Nori' }], notes: '' },
            { id: 'c541', name: 'Crispy Pancetta Crumbles', time: 10, passive: 0, tags: ['Crispy', 'Rich'], dot: '#888780', ingredients: [{ qty: '100', unit: 'g', name: 'Pancetta' }], notes: 'Render in skillet.' },
            { id: 'c542', name: 'Fried Shallot Crickets', time: 8, passive: 0, tags: ['Vegan', 'Crispy'], dot: '#888780', ingredients: [{ qty: '2', unit: 'pcs', name: 'Shallot' }], notes: 'Flash fry in neutral oil.' },
            { id: 'c543', name: 'Maldon Sea Salt & Microgreens', time: 2, passive: 0, tags: ['Vegan', 'Crispy'], dot: '#888780', ingredients: [{ qty: '1', unit: 'pinch', name: 'Maldon sea salt' }], notes: '' }
          ]
        }
      ]
    }
  },
  assembly: { BASE: [], PRIMARY: [], SECONDARY: [], TEXTURE: [] },
  savedRecipes: [],
  nextId: 600
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
    return ['BASE', 'PRIMARY', 'SECONDARY', 'TEXTURE']
      .flatMap(r => appState.assembly[r].map(findComp))
      .filter(Boolean);
  }, [appState.assembly, allComponents]);

  const autoTitle = useMemo(() => {
    const get = r => appState.assembly[r].map(findComp).filter(Boolean);
    const b = get('BASE'), p = get('PRIMARY'), s = get('SECONDARY'), t = get('TEXTURE');
    const parts = [];
    if (s.length) parts.push(s.map(c => c.name.split(' ')[0]).join('-'));
    if (p.length) parts.push(p.map(c => c.name).join(' & '));
    if (b.length) parts.push(b[0].name);
    if (t.length) parts.push('with ' + t.map(c => c.name).join(' and '));
    return parts.join(' ');
  }, [appState.assembly, allComponents]);

  const inheritedMeta = useMemo(() => {
    const tags = [...new Set(assemblyComps.flatMap(c => c.tags || []))];
    return {
      tags,
      allergens: tags.filter(t => ALLERGENS.includes(t)),
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
        // Create a new array and a updated folder object immutably
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

  const addFolder = (roleId) => {
    const nextId = 'id' + (appState.nextId + 1);
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
      const currentList = prev.assembly[role];
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
      assembly: { ...prev.assembly, [role]: prev.assembly[role].filter(id => id !== cid) }
    }));
  };

  const onSaveRecipe = () => {
    const compRefs = assemblyComps.map(c => ({ id: c.id, role: c.role }));
    const newRecipe = {
      id: 'id' + (appState.nextId + 1),
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
      assembly: { BASE: [], PRIMARY: [], SECONDARY: [], TEXTURE: [] },
      savedRecipes: [...prev.savedRecipes, newRecipe]
    }));
    setCurrentTab('recipes');
  };

  const openComponentModal = (compId = null, defaultRole = 'BASE', defaultFolderId = null) => {
    const comp = compId ? findComp(compId) : {
      name: '', time: 0, passive: 0, tags: [], ingredients: [{ qty: '', unit: '', name: '' }], notes: '', role: defaultRole, folderId: defaultFolderId
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
      const newId = compFormData.id || ('id' + (++nextId));
      
      // Clean up previous instance if editing
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
        dot: ROLE_DOTS[compFormData.role] || '#888780',
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

  // Filtered Component Registry logic
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
                  <button className="sb-create-btn" onClick={() => openComponentModal()}>
                    <i className="ti ti-plus"></i> New
                  </button>
                </div>
                <div>
                  {ROLES.map(role => {
                    const rs = appState.roles[role.id];
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
                    {inheritedMeta.allergens.map(a => (
                      <span key={a} className="meta-chip allergen"><i className="ti ti-alert-triangle"></i> {a}</span>
                    ))}
                    {inheritedMeta.dietTags.map(d => (
                      <span key={d} className="meta-chip diet">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div>
                  <div className="slot-label">Base vehicle <span className="slot-hint">(1 max)</span></div>
                  <SlotBox
                    role="BASE"
                    assemblyIds={appState.assembly.BASE}
                    findComp={findComp}
                    removeFromSlot={removeFromSlot}
                    addToSlot={addToSlot}
                    dragItem={dragItem}
                    dragOverSlot={dragOverSlot}
                    setDragOverSlot={setDragOverSlot}
                    placeholder="Drop or click a base"
                  />
                </div>

                <div className="slot-row">
                  <div>
                    <div className="slot-label">Primary flavors <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="PRIMARY"
                      assemblyIds={appState.assembly.PRIMARY}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop flavors"
                    />
                  </div>
                  <div>
                    <div className="slot-label">Secondary / aromatic <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="SECONDARY"
                      assemblyIds={appState.assembly.SECONDARY}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop aromatics"
                    />
                  </div>
                  <div>
                    <div className="slot-label">Textures <span className="slot-hint">(up to 3)</span></div>
                    <SlotBox
                      role="TEXTURE"
                      assemblyIds={appState.assembly.TEXTURE}
                      findComp={findComp}
                      removeFromSlot={removeFromSlot}
                      addToSlot={addToSlot}
                      dragItem={dragItem}
                      dragOverSlot={dragOverSlot}
                      setDragOverSlot={setDragOverSlot}
                      placeholder="Drop textures"
                    />
                  </div>
                </div>

                <div>
                  <div className="slot-label">Inherited tags</div>
                  <div className="tag-grid">
                    {inheritedMeta.tags.length > 0 ? (
                      inheritedMeta.tags.map(t => (
                        <span key={t} className={`tag-pill ${ALLERGENS.includes(t) ? 'allergen' : ''}`}>{t}</span>
                      ))
                    ) : (
                      <span className="tags-placeholder">Rolls up automatically from components</span>
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
                    <div className="rc-cat">{c.role}</div>
                    <div className="rc-title">{c.name}</div>
                    <div style={{ fontSize: '11px', color: '#9c9a96', margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-clock"></i>{c.time}m active{c.passive ? ` + ${c.passive}m passive` : ''}
                    </div>
                  </div>
                  <div className="rc-tags">
                    {(c.tags || []).map(t => (
                      <span key={t} className={`rc-tag ${ALLERGENS.includes(t) ? 'allergen' : ''}`}>{t}</span>
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
                        <span key={t} className={`rc-tag ${ALLERGENS.includes(t) ? 'allergen' : ''}`}>{t}</span>
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
        {/* Chevron Icon */}
        <i className={`ti ti-chevron-right folder-chevron ${isOpen ? 'open' : ''}`}></i>
        
        {/* Correct Tabler Folder Icons */}
        <i className={`ti ${isOpen ? 'ti-folder-open' : 'ti-folder'} folder-icon ${isOpen ? 'open' : ''}`}></i>

        {/* Editable Name or Plain Text */}
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

        {/* Action Buttons */}
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

      {/* Child Components inside Folder */}
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
    ingredients: data?.ingredients?.length ? data.ingredients : [{ qty: '', unit: '', name: '' }],
    notes: data?.notes || ''
  });

  const [tagInput, setTagInput] = useState('');

  const availableFolders = useMemo(() => {
    return roles[formData.role]?.folders || [];
  }, [roles, formData.role]);

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
    <div className="modal-overlay open">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">{data?.isEdit ? 'Edit Component' : 'Create Component'}</div>
          <button className="modal-close" onClick={onClose}><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Component Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Yuzu Curd"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
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
                <option value="PRIMARY">Primary flavors</option>
                <option value="SECONDARY">Secondary / aromatic</option>
                <option value="TEXTURE">Textures</option>
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
            <label className="form-label">Ingredients</label>
            <table className="ing-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Qty</th>
                  <th style={{ width: '25%' }}>Unit</th>
                  <th style={{ width: '45%' }}>Ingredient</th>
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
                      <button type="button" className="comp-btn del" onClick={() => removeIngRow(i)}><i className="ti ti-x"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn-small" onClick={addIngRow}><i className="ti ti-plus"></i> Add row</button>
          </div>

          <div className="form-group">
            <label className="form-label">Tags Information</label>
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
            <div style={{ fontSize: '10px', color: 'var(--tm)', marginTop: '2px' }}>Suggested tags:</div>
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
                        <span>{c.name}</span>
                        <span style={{ color: 'var(--tm)', fontSize: '11px' }}>{c.time}m active</span>
                      </div>
                      {c.ingredients?.length > 0 && (
                        <ul className="dish-comp-ings">
                          {c.ingredients.map((ing, i) => (
                            <li key={i}>{ing.qty} {ing.unit} {ing.name}</li>
                          ))}
                        </ul>
                      )}
                      {c.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--tm)', marginTop: '4px', fontStyle: 'italic' }}>
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
            <div className="dish-sec-title">Allergens & Tags</div>
            <div className="tag-grid">
              {(recipe.tags || []).map(t => (
                <span key={t} className={`tag-pill ${ALLERGENS.includes(t) ? 'allergen' : ''}`}>{t}</span>
              ))}
            </div>
          </div>

          {recipe.chefNotes && (
            <div className="dish-sec">
              <div className="dish-sec-title">Chef Notes</div>
              <p style={{ fontSize: '12px', color: 'var(--ts)', lineHeight: '1.4' }}>{recipe.chefNotes}</p>
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