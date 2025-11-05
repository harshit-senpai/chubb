import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  try {
    // Migration 1: Add difficulty column
    console.log('📝 Migration 1: Adding difficulty column...');
    
    const migration1 = `
      -- Add difficulty column to questions table
      ALTER TABLE public.questions 
      ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));

      -- Update existing questions with difficulty based on their quiz
      UPDATE public.questions 
      SET difficulty = (
        SELECT q.difficulty 
        FROM public.quizzes q 
        WHERE q.id = questions.quiz_id
      )
      WHERE difficulty IS NULL;

      -- Make difficulty NOT NULL after populating existing data
      ALTER TABLE public.questions 
      ALTER COLUMN difficulty SET NOT NULL;
    `;

    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });
    
    if (error1) {
      console.log('⚠️  Note: You may need to run this migration manually via Supabase Dashboard');
      console.log('   SQL Editor → Copy the migration SQL from:');
      console.log('   supabase/migrations/20251105000000_add_difficulty_to_questions.sql\n');
    } else {
      console.log('✅ Migration 1 completed\n');
    }

    // Migration 2: Update total_questions
    console.log('📝 Migration 2: Updating total_questions...');
    
    const { error: error2 } = await supabase
      .from('quizzes')
      .update({ total_questions: 2 })
      .in('id', [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003'
      ]);

    if (error2) {
      console.log('❌ Migration 2 failed:', error2);
    } else {
      console.log('✅ Migration 2 completed\n');
    }

    console.log('🎉 Migrations completed! You can now run: npm run seed:questions\n');

  } catch (error) {
    console.error('❌ Error running migrations:', error);
    console.log('\n💡 Please run the migrations manually via Supabase Dashboard SQL Editor');
  }
}

runMigrations();

