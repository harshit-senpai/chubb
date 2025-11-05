-- Add difficulty column to questions table
ALTER TABLE public.questions 
ADD COLUMN difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Update existing questions with difficulty based on their quiz
UPDATE public.questions 
SET difficulty = (
  SELECT q.difficulty 
  FROM public.quizzes q 
  WHERE q.id = questions.quiz_id
);

-- Make difficulty NOT NULL after populating existing data
ALTER TABLE public.questions 
ALTER COLUMN difficulty SET NOT NULL;

