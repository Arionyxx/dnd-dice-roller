// Item Definitions - All collectible items with effects

export const items = [
  // Movement Speed Items
  {
    id: 'speed_up',
    name: 'Runner Shoes',
    description: 'Speed Up!',
    rarity: 'common',
    effect: (player) => {
      player.speed += 40;
    }
  },

  {
    id: 'super_speed',
    name: 'Rocket Boots',
    description: 'Huge Speed Up!',
    rarity: 'rare',
    effect: (player) => {
      player.speed += 80;
    }
  },

  // Damage Items
  {
    id: 'damage_up',
    name: 'Strength Pill',
    description: 'Damage Up!',
    rarity: 'common',
    effect: (player) => {
      player.damage += 0.5;
    }
  },

  {
    id: 'mega_damage',
    name: 'Power Crystal',
    description: 'Massive Damage Up!',
    rarity: 'rare',
    effect: (player) => {
      player.damage += 1.5;
    }
  },

  // Health Items
  {
    id: 'health_up',
    name: 'Max Health Up',
    description: '+1 Max Health',
    rarity: 'uncommon',
    effect: (player) => {
      player.maxHealth += 2; // 2 half-hearts = 1 full heart
      player.health += 2;
    }
  },

  {
    id: 'full_heal',
    name: 'Full Health',
    description: 'Fully Healed!',
    rarity: 'uncommon',
    effect: (player, game) => {
      player.health = player.maxHealth;
      game.particles.createHeal(player.x, player.y);
    }
  },

  // Fire Rate Items
  {
    id: 'tear_delay_down',
    name: 'Rapid Fire',
    description: 'Tears Up!',
    rarity: 'common',
    effect: (player) => {
      player.tearDelay = Math.max(0.1, player.tearDelay - 0.05);
    }
  },

  {
    id: 'machine_gun',
    name: 'Machine Gun Tears',
    description: 'Extreme Fire Rate!',
    rarity: 'rare',
    effect: (player) => {
      player.tearDelay = Math.max(0.1, player.tearDelay - 0.15);
    }
  },

  // Range Items
  {
    id: 'range_up',
    name: 'Long Barrel',
    description: 'Range Up!',
    rarity: 'common',
    effect: (player) => {
      player.range += 80;
    }
  },

  {
    id: 'sniper_scope',
    name: 'Sniper Scope',
    description: 'Huge Range Up!',
    rarity: 'uncommon',
    effect: (player) => {
      player.range += 150;
    }
  },

  // Shot Speed Items
  {
    id: 'shot_speed_up',
    name: 'Velocity Boost',
    description: 'Shot Speed Up!',
    rarity: 'common',
    effect: (player) => {
      player.tearSpeed += 100;
    }
  },

  // Multi-stat Items
  {
    id: 'all_stats_up',
    name: 'Golden Crown',
    description: 'All Stats Up!',
    rarity: 'special',
    effect: (player) => {
      player.speed += 30;
      player.damage += 0.3;
      player.tearDelay = Math.max(0.1, player.tearDelay - 0.03);
      player.range += 50;
      player.maxHealth += 2;
      player.health += 2;
    }
  },

  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: 'High Risk, High Reward!',
    rarity: 'special',
    effect: (player) => {
      player.damage += 2;
      player.tearDelay = Math.max(0.1, player.tearDelay - 0.1);
      player.maxHealth = 2; // Only 1 heart
      player.health = Math.min(player.health, player.maxHealth);
    }
  },

  {
    id: 'tank_mode',
    name: 'Tank Armor',
    description: 'Slow but Tough!',
    rarity: 'uncommon',
    effect: (player) => {
      player.maxHealth += 6; // 3 extra hearts
      player.health += 6;
      player.speed = Math.max(100, player.speed - 40);
    }
  },

  // Utility Items
  {
    id: 'invincibility',
    name: 'Guardian Angel',
    description: 'Extended Invulnerability!',
    rarity: 'rare',
    effect: (player) => {
      player.invulnerableDuration += 0.5;
    }
  },

  {
    id: 'tear_size_up',
    name: 'Giant Tears',
    description: 'Bigger Tears!',
    rarity: 'uncommon',
    effect: (player) => {
      // Increase tear visual size (we'd need to modify player.js to support this)
      player.damage += 0.3;
      // Future: player.tearSize += 2;
    }
  }
];

// Helper function to get random item
export function getRandomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

// Helper function to get item by ID
export function getItemById(id) {
  return items.find(item => item.id === id);
}

// Helper function to get items by rarity
export function getItemsByRarity(rarity) {
  return items.filter(item => item.rarity === rarity);
}

// Rarity weights for spawning
export const rarityWeights = {
  common: 50,
  uncommon: 30,
  rare: 15,
  special: 5
};

// Get weighted random item
export function getWeightedRandomItem() {
  const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    random -= weight;
    if (random <= 0) {
      const rarityItems = getItemsByRarity(rarity);
      return rarityItems[Math.floor(Math.random() * rarityItems.length)];
    }
  }

  return items[0]; // Fallback
}
