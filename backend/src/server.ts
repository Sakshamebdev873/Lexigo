import 'dotenv/config';
import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legixo';
async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('[db] connected');
  const app = buildApp();
  app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
}

main().catch((e) => {
  console.error('Fatal startup error', e);
  process.exit(1);
});
