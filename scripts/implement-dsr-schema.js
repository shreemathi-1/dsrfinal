import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { executeDSRSchema } from '../src/lib/database.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '../.env') });

// Verify required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Required environment variables are missing.');
  console.error('Please ensure you have set:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('Implementing DSR schema...');

executeDSRSchema()
  .then(() => {
    console.log('DSR schema implemented successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error implementing DSR schema:', error);
    process.exit(1);
  }); 