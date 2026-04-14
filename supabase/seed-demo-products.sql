insert into products (
  name,
  slug,
  description,
  category,
  price_lkr,
  image_url,
  image_urls,
  stock_quantity,
  is_active
)
values
  (
    'Classic Cotton Tee',
    'classic-cotton-tee',
    'Soft breathable cotton t-shirt for daily wear.',
    'Clothing',
    4200,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    array[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1'
    ],
    45,
    true
  ),
  (
    'Minimal Leather Wallet',
    'minimal-leather-wallet',
    'Slim genuine leather wallet with RFID protection.',
    'Accessories',
    6900,
    'https://images.unsplash.com/photo-1627123424574-724758594e93',
    array[
      'https://images.unsplash.com/photo-1627123424574-724758594e93',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa'
    ],
    30,
    true
  ),
  (
    'Urban Running Shoes',
    'urban-running-shoes',
    'Lightweight running shoes designed for comfort and grip.',
    'Footwear',
    18500,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    array[
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06'
    ],
    22,
    true
  ),
  (
    'Ceramic Coffee Mug Set',
    'ceramic-coffee-mug-set',
    'Set of two premium ceramic mugs with matte finish.',
    'Home',
    5200,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a',
    array[
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
    ],
    60,
    true
  ),
  (
    'Wireless Desk Lamp',
    'wireless-desk-lamp',
    'Rechargeable LED desk lamp with touch dimming control.',
    'Electronics',
    11900,
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
    array[
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944'
    ],
    18,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price_lkr = excluded.price_lkr,
  image_url = excluded.image_url,
  image_urls = excluded.image_urls,
  stock_quantity = excluded.stock_quantity,
  is_active = excluded.is_active;
