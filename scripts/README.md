# Question Seeding Script

This script generates math questions using Google's Gemini AI and seeds them into the Supabase database.

## Prerequisites

1. **Environment Variables**: Make sure your `.env` file contains:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Database Migration**: Run the migration to add the `difficulty` column:
   ```bash
   # Apply the migration through Supabase CLI or dashboard
   ```

## Configuration

The script generates:
- **200 Easy questions** (Grade 6 level) - Arithmetic and Algebra
- **200 Medium questions** (Grade 8 level) - Arithmetic and Algebra
- **150 Hard questions** (Grade 10 level) - Arithmetic and Algebra

**Total: 550 questions**

Questions are generated in batches of 20 to avoid API rate limits, with a 2-second delay between batches.

## Usage

Run the seeding script:

```bash
npm run seed:questions
```

## What the Script Does

1. **Generates Questions**: Uses Gemini 1.5 Flash to generate questions with:
   - Question text
   - Four multiple-choice options (A, B, C, D)
   - Correct answer
   - Detailed explanation

2. **Seeds Database**: Inserts questions into the `questions` table with:
   - Link to appropriate quiz (easy/medium/hard)
   - Difficulty level
   - All options and correct answer
   - Explanation for learning

3. **Progress Tracking**: Shows real-time progress with:
   - Generation status
   - Batch insertion progress
   - Success/error messages

## Notes

- This is a **one-time seed script**
- Questions are linked to existing quizzes in the database
- The script will fail if the `difficulty` column doesn't exist (run migration first)
- Make sure you have a valid Gemini API key with sufficient quota

## Troubleshooting

**Error: "Failed to parse JSON response"**
- The Gemini API might have returned malformed JSON
- Try running the script again

**Error: "column 'difficulty' does not exist"**
- Run the migration file first: `supabase/migrations/20251105000000_add_difficulty_to_questions.sql`

**Rate Limit Errors**
- Increase `DELAY_BETWEEN_BATCHES` in the script
- Reduce `BATCH_SIZE` if needed

