import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Verify API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const API_KEY = process.env.OPENAI_API_KEY;

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Quiz IDs from the database
const QUIZ_IDS = {
  easy: '550e8400-e29b-41d4-a716-446655440001',
  medium: '550e8400-e29b-41d4-a716-446655440002',
  hard: '550e8400-e29b-41d4-a716-446655440003'
};

// Configuration
const QUESTIONS_CONFIG = [
  { difficulty: 'easy', count: 200, grade: 6, quizId: QUIZ_IDS.easy },
  { difficulty: 'medium', count: 200, grade: 8, quizId: QUIZ_IDS.medium },
  { difficulty: 'hard', count: 150, grade: 10, quizId: QUIZ_IDS.hard }
];

const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES = 2000;
const DELAY_BETWEEN_API_CALLS = 1000; // 1 second delay for OpenAI

// OpenAI model to use
const MODEL = 'gpt-3.5-turbo'; // Fast and cost-effective

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const body = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates educational math questions in JSON format. Always return valid JSON arrays with no additional text or markdown.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 4000
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Test OpenAI API connection
 */
async function testConnection() {
  console.log('🔧 Testing OpenAI API connection...\n');
  
  try {
    console.log(`   Testing with model: ${MODEL}...`);
    await callOpenAI('Say "test"');
    console.log(`   ✅ Success! Connected to OpenAI API\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    console.error('\n❌ Could not connect to OpenAI API.');
    console.error('💡 This usually means:');
    console.error('   1. Your API key is invalid or expired');
    console.error('   2. You have insufficient credits in your OpenAI account');
    console.error('   3. Your API key doesn\'t have the right permissions');
    console.error('\n🔧 Solution:');
    console.error('   1. Go to: https://platform.openai.com/api-keys');
    console.error('   2. Create a new API key or verify your existing one');
    console.error('   3. Check your billing: https://platform.openai.com/account/billing');
    console.error('   4. Make sure you have credits available');
    return false;
  }
}

/**
 * Generate questions using OpenAI
 */
async function generateQuestions(difficulty, grade, count) {
  const CHUNK_SIZE = 20; // OpenAI can handle larger chunks
  const chunks = Math.ceil(count / CHUNK_SIZE);
  const allQuestions = [];
  
  console.log(`\n🤖 Generating ${count} ${difficulty} questions for grade ${grade} in ${chunks} chunks...`);
  
  for (let i = 0; i < chunks; i++) {
    const chunkCount = Math.min(CHUNK_SIZE, count - (i * CHUNK_SIZE));
    const chunkNum = i + 1;
    
    console.log(`   Chunk ${chunkNum}/${chunks}: Generating ${chunkCount} questions...`);
    
    const prompt = `Generate exactly ${chunkCount} multiple-choice math questions for grade ${grade} students.
The questions should be a mix of arithmetic and algebra topics appropriate for grade ${grade}.
Each question must have:
- A clear question text
- Four options (A, B, C, D)
- The correct answer (A, B, C, or D)
- A detailed explanation of the solution

Return the response as a valid JSON array with this exact structure:
[
  {
    "question": "What is 5 + 3?",
    "optionA": "6",
    "optionB": "7",
    "optionC": "8",
    "optionD": "9",
    "correctAnswer": "C",
    "explanation": "5 plus 3 equals 8 because when you add 3 more to 5, the total becomes 8."
  }
]

Important:
- Return ONLY the JSON array, no additional text or markdown formatting
- Ensure all ${chunkCount} questions are unique and varied
- Make sure the correct answer matches one of the four options
- Keep explanations clear and educational for grade ${grade} students`;

    try {
      let text = await callOpenAI(prompt);
      
      // Clean up the response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const questions = JSON.parse(text);
      console.log(`   ✅ Chunk ${chunkNum}: Generated ${questions.length} questions`);
      
      allQuestions.push(...questions);
      
      // Delay between chunks to avoid rate limits
      if (i < chunks - 1) {
        console.log(`   ⏳ Waiting ${DELAY_BETWEEN_API_CALLS / 1000}s before next chunk...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_API_CALLS));
      }
    } catch (error) {
      console.error(`   ❌ Chunk ${chunkNum} failed:`, error.message);
      
      // If rate limited, wait longer and retry once
      if (error.message.includes('429') || error.message.includes('rate_limit')) {
        console.log(`   ⏳ Rate limited! Waiting 10 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        try {
          let text = await callOpenAI(prompt);
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const questions = JSON.parse(text);
          console.log(`   ✅ Retry successful: Generated ${questions.length} questions`);
          allQuestions.push(...questions);
        } catch (retryError) {
          console.error(`   ❌ Retry also failed:`, retryError.message);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }
  
  console.log(`✅ Total generated: ${allQuestions.length} ${difficulty} questions`);
  return allQuestions;
}

/**
 * Insert questions into Supabase in batches
 */
async function insertQuestions(questions, difficulty, quizId) {
  console.log(`\n📝 Inserting ${questions.length} ${difficulty} questions into database...`);
  
  let insertedCount = 0;
  
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(questions.length / BATCH_SIZE);
    
    console.log(`  📦 Batch ${batchNumber}/${totalBatches}: Inserting ${batch.length} questions...`);
    
    const questionsToInsert = batch.map((q, index) => ({
      quiz_id: quizId,
      question_text: q.question,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: difficulty,
      order_num: i + index + 1
    }));
    
    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert);
    
    if (error) {
      console.error(`  ❌ Error inserting batch ${batchNumber}:`, error);
      throw error;
    }
    
    insertedCount += batch.length;
    console.log(`  ✅ Batch ${batchNumber} inserted successfully (Total: ${insertedCount}/${questions.length})`);
    
    if (i + BATCH_SIZE < questions.length) {
      console.log(`  ⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  console.log(`✅ Successfully inserted all ${insertedCount} ${difficulty} questions`);
}

/**
 * Main seeding function
 */
async function seedQuestions() {
  console.log('🚀 Starting question generation and seeding process...\n');
  console.log('🤖 Using OpenAI API (gpt-3.5-turbo)\n');
  
  // Test connection first
  const success = await testConnection();
  if (!success) {
    process.exit(1);
  }
  
  console.log('📊 Configuration:');
  console.log(`   - Easy: ${QUESTIONS_CONFIG[0].count} questions (Grade ${QUESTIONS_CONFIG[0].grade})`);
  console.log(`   - Medium: ${QUESTIONS_CONFIG[1].count} questions (Grade ${QUESTIONS_CONFIG[1].grade})`);
  console.log(`   - Hard: ${QUESTIONS_CONFIG[2].count} questions (Grade ${QUESTIONS_CONFIG[2].grade})`);
  console.log(`   - Total: ${QUESTIONS_CONFIG.reduce((sum, c) => sum + c.count, 0)} questions\n`);
  console.log('⏱️  Estimated time: ~10-15 minutes\n');
  console.log('💰 Estimated cost: ~$0.50-1.00 USD (using gpt-3.5-turbo)\n');
  
  try {
    for (const config of QUESTIONS_CONFIG) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing ${config.difficulty.toUpperCase()} difficulty questions`);
      console.log('='.repeat(60));
      
      const questions = await generateQuestions(config.difficulty, config.grade, config.count);
      await insertQuestions(questions, config.difficulty, config.quizId);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! All questions have been generated and seeded!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error during seeding process:', error);
    console.error('\n💡 Common issues:');
    console.error('   - Rate limits: Wait a few minutes and try again');
    console.error('   - Insufficient credits: Add credits to your OpenAI account');
    console.error('   - Invalid key: Get new key from https://platform.openai.com/api-keys');
    process.exit(1);
  }
}

seedQuestions();