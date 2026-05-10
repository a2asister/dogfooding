import fastify from 'fastify';
import cors from '@fastify/cors';
import mercurius from 'mercurius';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { schema, resolvers } from './graphql.js';
import { insertProduct, getAllProducts } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({
  logger: true
});

const PORT = process.env.PORT || 8765;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.register(cors, {
  origin: true,
  credentials: true
});

app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.register(fastifyStatic, {
  root: UPLOAD_DIR,
  prefix: '/uploads/'
});

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
});

app.post('/api/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: 'No file uploaded' });
  }

  const ext = path.extname(data.filename).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  if (!allowedExts.includes(ext)) {
    return reply.status(400).send({ error: 'Invalid file type' });
  }

  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  const buffer = await data.toBuffer();
  fs.writeFileSync(filepath, buffer);

  const url = `http://localhost:${PORT}/uploads/${filename}`;
  
  return {
    success: true,
    url,
    filename
  };
});

function seedDatabase() {
  const existing = getAllProducts();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const sampleProducts = [
    {
      id: uuidv4(),
      name: 'Luxe Chronograph Watch',
      price: 12999.00,
      description: 'Handcrafted Swiss precision timepiece with sapphire crystal and 18K gold accents.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20gold%20chronograph%20watch%20on%20black%20background%20product%20photography&image_size=square_hd',
      category: 'Watches',
      specs: [
        { key: 'Movement', value: 'Automatic Swiss' },
        { key: 'Case Material', value: '18K Gold' },
        { key: 'Glass', value: 'Sapphire Crystal' },
        { key: 'Water Resistance', value: '100m' }
      ],
      createdAt: now
    },
    {
      id: uuidv4(),
      name: 'Aurora Diamond Earrings',
      price: 28500.00,
      description: 'Brilliant cut diamonds set in platinum, reflecting light from every angle.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20diamond%20earrings%20platinum%20setting%20elegant%20product%20photography&image_size=square_hd',
      category: 'Jewelry',
      specs: [
        { key: 'Total Carat', value: '4.2 ct' },
        { key: 'Clarity', value: 'VVS1' },
        { key: 'Metal', value: 'Platinum 950' },
        { key: 'Cut', value: 'Brilliant Round' }
      ],
      createdAt: now
    },
    {
      id: uuidv4(),
      name: 'Midnight Leather Bag',
      price: 4800.00,
      description: 'Hand-stitched Italian calfskin with 24K gold-plated hardware.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20black%20leather%20handbag%20gold%20hardware%20elegant%20product%20photography&image_size=square_hd',
      category: 'Accessories',
      specs: [
        { key: 'Material', value: 'Italian Calfskin' },
        { key: 'Hardware', value: '24K Gold Plated' },
        { key: 'Dimensions', value: '35x25x15cm' },
        { key: 'Origin', value: 'Italy' }
      ],
      createdAt: now
    },
    {
      id: uuidv4(),
      name: 'Velvet Noir Perfume',
      price: 2200.00,
      description: 'A mysterious blend of oud, amber, and rare Bulgarian rose.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20black%20crystal%20perfume%20bottle%20elegant%20dark%20background%20product%20photography&image_size=square_hd',
      category: 'Fragrance',
      specs: [
        { key: 'Volume', value: '100ml EDP' },
        { key: 'Top Notes', value: 'Saffron, Bergamot' },
        { key: 'Heart Notes', value: 'Bulgarian Rose, Oud' },
        { key: 'Base Notes', value: 'Amber, Musk' }
      ],
      createdAt: now
    },
    {
      id: uuidv4(),
      name: 'Crystal Champagne Flutes',
      price: 3600.00,
      description: 'Set of 6 hand-blown crystal glasses from Bohemia.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20crystal%20champagne%20flutes%20elegant%20reflective%20product%20photography&image_size=square_hd',
      category: 'Home',
      specs: [
        { key: 'Quantity', value: 'Set of 6' },
        { key: 'Material', value: 'Lead-free Crystal' },
        { key: 'Capacity', value: '220ml' },
        { key: 'Origin', value: 'Czech Republic' }
      ],
      createdAt: now
    },
    {
      id: uuidv4(),
      name: 'Platinum Pen Set',
      price: 8500.00,
      description: 'Fountain and ballpoint pen with 18K gold nib and platinum body.',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20platinum%20fountain%20pen%20gold%20nib%20elegant%20product%20photography&image_size=square_hd',
      category: 'Accessories',
      specs: [
        { key: 'Body', value: 'Platinum 950' },
        { key: 'Nib', value: '18K Gold' },
        { key: 'Filling', value: 'Converter/Cartridge' },
        { key: 'Set Includes', value: 'Fountain + Ballpoint' }
      ],
      createdAt: now
    }
  ];

  sampleProducts.forEach(product => {
    insertProduct(product);
  });

  console.log('Database seeded with sample products');
}

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  seedDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`GraphiQL: http://localhost:${PORT}/graphiql`);
});
