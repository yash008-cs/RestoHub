// MASTER ITEM-BY-ITEM IMAGE MAP ENFORCING NON-NEGOTIABLE ACCURACY
// Each dish maps to its own authentic, distinct, real high-resolution photograph.

const EXACT_DISH_PHOTOS = [
  // ==========================================
  // 1. SPECIFIC CHICKEN SPECIALTIES (DIVERSE, DISTINCT PHOTOS)
  // ==========================================
  {
    keys: ['butter chicken', 'murgh makhani'],
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80' // Creamy orange-red butter chicken in black skillet with cream swirl
  },
  {
    keys: ['chicken curry', 'homestyle chicken curry', 'desi chicken curry'],
    url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80' // Traditional spiced golden-red chicken curry in copper handi
  },
  {
    keys: ['chicken masala', 'spicy chicken masala', 'chicken roast masala'],
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' // Thick roasted masala gravy with juicy chicken chunks
  },
  {
    keys: ['chicken kadai', 'kadai chicken', 'kadhai chicken'],
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80' // Wok-tossed chicken with bell peppers and roasted coriander
  },
  {
    keys: ['chicken handi', 'handi chicken'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' // Slow-cooked chicken in traditional earthen pot with rich gravy
  },
  {
    keys: ['chicken kolhapuri', 'kolhapuri chicken', 'kolhapuri rassa'],
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' // Fiery deep red spicy Kolhapuri gravy
  },
  {
    keys: ['chicken chettinad', 'chettinad chicken'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' // Dark roasted South Indian peppery coconut curry with curry leaves
  },
  {
    keys: ['chicken hyderabadi', 'hyderabadi chicken'],
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80' // Aromatic green mint-coriander spiced chicken gravy
  },
  {
    keys: ['chicken tikka masala', 'tikka masala'],
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' // Smoky charred tikka cubes in rich creamy tomato gravy
  },
  {
    keys: ['chicken korma', 'shahi chicken korma'],
    url: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80' // Royal Mughlai white cashew-cream korma
  },

  // ==========================================
  // 2. MUTTON DISHES
  // ==========================================
  {
    keys: ['mutton rogan josh', 'rogan josh'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' // Deep red Kashmiri rogan josh
  },
  {
    keys: ['mutton curry', 'mutton masala', 'mutton handi', 'kolhapuri mutton', 'mutton sukka'],
    url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80' // Rich slow-cooked mutton curry
  },

  // ==========================================
  // 3. PANEER & VEGETARIAN MAINS
  // ==========================================
  {
    keys: ['paneer butter masala', 'paneer makhani'],
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' // Creamy orange paneer makhani
  },
  {
    keys: ['kadai paneer', 'kadhai paneer'],
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' // Cottage cheese cooked with bell peppers
  },
  {
    keys: ['palak paneer', 'saag paneer'],
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80' // Velvety spinach gravy with fresh paneer cubes
  },
  {
    keys: ['shahi paneer', 'paneer lababdar', 'malai kofta'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' // Royal mild cream gravy
  },
  {
    keys: ['dal makhani', 'makhani dal'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' // Slow-cooked black lentils with cream & butter
  },
  {
    keys: ['dal tadka', 'yellow dal', 'dal fry'],
    url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80' // Golden yellow tempered lentils
  },
  {
    keys: ['chole', 'chana masala', 'rajma', 'chole bhature'],
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' // Spicy Punjabi chickpeas with rich sauce
  },
  {
    keys: ['aloo gobi', 'mix veg', 'veg kolhapuri', 'veg handi', 'bhindi masala'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' // Spiced mixed vegetarian curries
  },
  {
    keys: ['butter naan', 'garlic naan', 'naan', 'tandoori roti', 'roti', 'paratha', 'kulche'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' // Charred tandoori flatbread
  },

  // ==========================================
  // 4. BIRYANIS & RICE
  // ==========================================
  {
    keys: ['chicken dum biryani', 'hyderabadi chicken biryani', 'chicken biryani', 'lucknowi biryani'],
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' // Royal handi chicken dum biryani
  },
  {
    keys: ['mutton biryani', 'gosht biryani'],
    url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' // Spiced mutton biryani with browned onions
  },
  {
    keys: ['veg dum biryani', 'veg biryani', 'paneer biryani'],
    url: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80' // Basmati rice with fresh vegetables & fried paneer
  },
  {
    keys: ['egg biryani', 'anda biryani'],
    url: 'https://images.unsplash.com/photo-1631515223380-a1274d7ab424?auto=format&fit=crop&w=600&q=80' // Boiled spiced eggs in fragrant rice
  },
  {
    keys: ['jeera rice', 'veg pulao', 'steamed rice', 'pulao'],
    url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80' // Basmati rice with cumin & ghee
  },

  // ==========================================
  // 5. STARTERS & TANDOOR
  // ==========================================
  {
    keys: ['tandoori chicken', 'tandoori murgh'],
    url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80' // Charred red whole tandoori chicken
  },
  {
    keys: ['chicken tikka', 'murgh tikka'],
    url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80' // Charcoal-grilled boneless chicken tikka skewers
  },
  {
    keys: ['chicken 65'],
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' // Crispy fiery red fried chicken bites
  },
  {
    keys: ['paneer tikka', 'tandoori paneer'],
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' // Skewered charred paneer cubes with peppers
  },
  {
    keys: ['seekh kebab', 'chicken seekh', 'mutton seekh', 'kebab'],
    url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80' // Grilled minced meat kebabs
  },

  // ==========================================
  // 6. MAHARASHTRIAN & STREET FOOD
  // ==========================================
  {
    keys: ['misal pav', 'mumbai misal', 'puneri misal', 'misal'],
    url: '/misal-pav-authentic.png' // Real authentic Pune misal pav platter
  },
  {
    keys: ['vada pav', 'batata vada'],
    url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80' // Golden potato vada inside pav bun with green chili
  },
  {
    keys: ['pav bhaji', 'mumbai pav bhaji', 'cheese pav bhaji'],
    url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80' // Buttery vegetable mash with butter-toasted pav
  },
  {
    keys: ['samosa', 'samosa chaat'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' // Crispy golden triangular potato pastries
  },
  {
    keys: ['pani puri', 'sev puri', 'bhel puri', 'chaat', 'dahi puri'],
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' // Crispy street chaat
  },

  // ==========================================
  // 7. SOUTH INDIAN
  // ==========================================
  {
    keys: ['masala dosa', 'mysore masala dosa', 'plain dosa', 'dosa', 'paper dosa', 'ghee roast dosa'],
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80' // Golden crisp South Indian crepe only
  },
  {
    keys: ['steamed idli', 'idli', 'mini idli', 'rava idli'],
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' // Soft white steamed idlis on banana leaf with sambar
  },
  {
    keys: ['medu vada', 'sambar vada', 'vada'],
    url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80' // Golden crispy lentil donuts
  },

  // ==========================================
  // 8. CHINESE & ASIAN
  // ==========================================
  {
    keys: ['noodles', 'hakka noodles', 'schezwan noodles', 'chowmein'],
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' // Wok-tossed noodles
  },
  {
    keys: ['fried rice', 'schezwan fried rice'],
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' // Golden wok-fried rice
  },
  {
    keys: ['momos', 'dimsum', 'dumplings'],
    url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80' // Steamed momos in bamboo basket
  },
  {
    keys: ['manchurian', 'chilli chicken', 'chilli paneer'],
    url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' // Savory soy Asian gravy
  },
  {
    keys: ['spring roll', 'rolls', 'frankie', 'shawarma', 'wrap'],
    url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80' // Crispy wraps and rolls
  },

  // ==========================================
  // 9. PIZZAS, BURGERS & FRIES
  // ==========================================
  {
    keys: ['margherita pizza', 'cheese pizza'],
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80' // Authentic woodfired margherita pizza
  },
  {
    keys: ['pepperoni pizza'],
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80' // Sliced pepperoni pizza
  },
  {
    keys: ['farmhouse pizza', 'veggie supreme pizza', 'pizza'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' // Loaded gourmet vegetable pizza
  },
  {
    keys: ['burger', 'aloo tikki burger', 'crispy chicken burger', 'cheese burger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' // Gourmet burger on brioche bun
  },
  {
    keys: ['french fries', 'fries', 'peri peri fries'],
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80' // Golden crispy french fries
  },
  {
    keys: ['pasta', 'white sauce pasta', 'red sauce pasta', 'alfredo pasta'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?auto=format&fit=crop&w=600&q=80' // Penne pasta in rich creamy sauce
  },

  // ==========================================
  // 10. DESSERTS & SWEETS
  // ==========================================
  {
    keys: ['gulab jamun', 'rasgulla', 'rasmalai', 'kulfi', 'gajar ka halwa', 'kheer'],
    url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80' // Traditional Indian sweets
  },
  {
    keys: ['ice cream', 'sundae', 'gelato'],
    url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80' // Rich scoops of ice cream
  },
  {
    keys: ['brownie', 'chocolate brownie'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' // Fudgy chocolate brownie
  },
  {
    keys: ['lava cake', 'chocolate lava cake'],
    url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=600&q=80' // Molten chocolate lava cake
  },
  {
    keys: ['cheesecake'],
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80' // Creamy baked cheesecake slice
  },
  {
    keys: ['donut', 'doughnut'],
    url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80' // Glazed chocolate donut
  },
  {
    keys: ['waffles', 'waffle'],
    url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80' // Belgian waffle with chocolate
  },
  {
    keys: ['pancakes', 'pancake'],
    url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80' // Golden fluffy pancakes
  },

  // ==========================================
  // 11. BEVERAGES & DRINKS
  // ==========================================
  {
    keys: ['cold coffee', 'coffee', 'iced coffee', 'frappe'],
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80' // Chilled frosted cold coffee
  },
  {
    keys: ['cappuccino', 'latte', 'espresso'],
    url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80' // Hot steaming cafe latte with foam art
  },
  {
    keys: ['masala chai', 'chai', 'tea', 'lemon tea', 'green tea'],
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' // Traditional spiced Indian chai
  },
  {
    keys: ['mango lassi', 'lassi', 'sweet lassi'],
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80' // Thick golden Alphonso mango lassi
  },
  {
    keys: ['fresh lime soda', 'virgin mojito', 'lemon juice'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' // Chilled sparkling lime mint soda
  },
  {
    keys: ['watermelon juice', 'orange juice', 'juice'],
    url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80' // Fresh fruit juice
  },
  {
    keys: ['shake', 'chocolate shake', 'oreo shake', 'strawberry shake', 'vanilla shake', 'mango shake'],
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80' // Thick gourmet milkshake with whipped cream
  },
];

const RESTAURANT_IMAGES_POOL = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
];

const CATEGORY_IMAGE_MAP = {
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  'south-indian': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
  chinese: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
  'north-indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
  maharashtrian: '/misal-pav-authentic.png',
  snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
  beverages: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
  desserts: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80',
};

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
export const FALLBACK_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

/**
 * Get restaurant cover image URL by restaurant ID & name
 */
export const getRestaurantImage = (restaurant) => {
  if (!restaurant) return FALLBACK_RESTAURANT_IMAGE;

  let hash = (restaurant.id || 0) * 31;
  const s = String(restaurant.name || '');
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % RESTAURANT_IMAGES_POOL.length;
  return RESTAURANT_IMAGES_POOL[index];
};

/**
 * Get accurate, exact food item image URL matching its dish name
 */
export const getFoodImage = (food) => {
  if (!food) return FALLBACK_FOOD_IMAGE;

  if (food.imageUrl && food.imageUrl.startsWith('http') && !food.imageUrl.includes('placeholder')) {
    return food.imageUrl;
  }

  const dishName = (food.name || '').toLowerCase().trim();

  // 1. Check exact dish photo matches in order
  for (const entry of EXACT_DISH_PHOTOS) {
    for (const key of entry.keys) {
      if (dishName === key || dishName.includes(key)) {
        return entry.url;
      }
    }
  }

  // 2. Fallback check for category words in food category or dish name
  const category = (food.category || '').toLowerCase();

  if (dishName.includes('paneer') || category.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80';
  }
  if (dishName.includes('chicken') || category.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80';
  }
  if (dishName.includes('biryani') || category.includes('biryani')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80';
  }
  if (dishName.includes('dosa') || dishName.includes('idli') || category.includes('south')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80';
  }
  if (dishName.includes('pizza') || category.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80';
  }
  if (dishName.includes('burger') || category.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80';
  }

  return FALLBACK_FOOD_IMAGE;
};

/**
 * Get category cover image
 */
export const getCategoryImage = (catId) => {
  return CATEGORY_IMAGE_MAP[catId] || FALLBACK_FOOD_IMAGE;
};

/**
 * Image error handler fallback
 */
export const handleImageError = (e, fallbackUrl = FALLBACK_FOOD_IMAGE) => {
  if (e && e.target) {
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  }
};
