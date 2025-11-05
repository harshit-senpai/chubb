import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import bg2 from "@/assets/bg2.jpg";
import chubbLogo from "@/assets/chubb.png"; // ✅ Added logo import

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_num: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  total_questions: number;
}

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = windowSize;

  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestion]);

  useEffect(() => {
    if (selectedAnswer) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selectedAnswer]);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    if (!quizId) return;

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) {
      toast.error("Quiz not found");
      navigate("/dashboard");
      return;
    }

    setQuiz(quizData);

    // Fetch all questions for this difficulty
    const { data: allQuestions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("difficulty", quizData.difficulty);

    if (questionsError) {
      toast.error("Failed to load questions");
      return;
    }

    if (!allQuestions || allQuestions.length === 0) {
      toast.error("No questions available for this difficulty");
      navigate("/dashboard");
      return;
    }

    // Randomly select 2 questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 2);

    setQuestions(selectedQuestions);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correct_answer;
    setAnswers({ ...answers, [currentQuestion]: isCorrect });

    if (isCorrect) {
      setScore(score + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      toast.success("Correct! 🎉");
    } else {
      toast.error("Wrong answer. Try the next one!");
    }
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      setTimeout(() => {
        finishQuiz();
      }, 200);
      return;
    }
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
  };

  const finishQuiz = async () => {
    if (!quiz) return;
    const points = score * 10;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    if (!userId) {
      setShowResult(true);
      return;
    }

    const { error: attemptError } = await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: quiz.id,
      score: points,
      total_questions: quiz.total_questions,
      correct_answers: score,
    });

    if (attemptError) {
      console.error("Attempt insert error:", attemptError);
      toast.error("Failed to save quiz attempt");
    }

    setShowResult(true);

    if (score === questions.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const getOptionClass = (option: string) => {
    const correct = option === questions[currentQuestion]?.correct_answer;
    const selected = option === selectedAnswer;

    if (!selectedAnswer) return "option-hover border bg-transparent";
    if (selected && correct) return "option-correct border";
    if (selected && !correct) return "option-wrong border";
    if (correct) return "option-correct border";
    return "opacity-40 border";
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-light via-background to-secondary relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bg2})` }}
        ></div>

        {/* ✅ Logo on result screen too */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
          <img
            src={chubbLogo}
            alt="Chubb Logo"
            className="h-8 pl-6 w-auto object-contain drop-shadow-md cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />

        </div>

        <Card className="max-w-md w-full shadow-2xl border-2 border-primary/20 bg-white/80 backdrop-blur-xl rounded-2xl p-1">
          <CardContent className="pt-5 text-center space-y-6">
            <div className="text-6xl">
              {score === questions.length ? "🏆" : "🎯"}
            </div>

            <h2 className="text-4xl font-extrabold text-primary">Congratulations</h2>
            <span className="text-muted-foreground">You won your CHUBB Delight Box </span>

            <div className="flex justify-center relative">
              <svg width="180" height="180" className="transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="#d1d5db"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="url(#tealGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-[58px] text-4xl font-bold text-primary">
                {percentage}%
              </div>
            </div>

            <p className="text-xl font-semibold">
              Your Score {score} out of {questions.length}
            </p>

            <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg shadow-inner">
              <p className="text-2xl font-semibold text-primary">
                +{score * 10} Points ⭐
              </p>
            </div>

            <div className="flex gap-4 pt-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold shadow-md hover:bg-primary/90"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1 h-12 rounded-xl border-primary text-primary font-semibold hover:bg-primary/10"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary p-6 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bg2})` }}
        ></div>

        {/* ✅ Logo on loading screen */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
          <img
            src={chubbLogo}
            alt="Chubb Logo"
            className="h-6 pl-6 w-auto object-contain drop-shadow-md cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />
        </div>

        <div className="max-w-xl mx-auto mt-16 relative z-10">
          <Card className="shadow-xl border border-primary/30 rounded-2xl bg-background/40 backdrop-blur-lg">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-32" />

              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-20" />
              </div>

              <Skeleton className="h-2 w-full" />

              <div className="pt-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4 mt-2" />
              </div>

              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary p-6 relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bg2})` }}
      ></div>

      {/* ✅ Logo at Top Left */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <img
          src={chubbLogo}
          alt="Chubb Logo"
          className="h-6 pl-6  w-auto object-contain drop-shadow-md cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />

      </div>

      {/* Floating Math Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <span className="absolute top-10 left-20 text-6xl text-primary animate-float-slow">
          π
        </span>
        <span className="absolute top-40 right-72 text-5xl text-primary animate-float">
          √
        </span>
        <span className="absolute top-1/2 left-40 text-4xl text-primary rotate-12">
          Σ
        </span>
        <span className="absolute bottom-40 right-20 text-7xl text-primary rotate-6">
          ∞
        </span>
      </div>

      <div className="max-w-xl mx-auto mt-16">
        <Card className="relative shadow-xl border border-primary/30 rounded-2xl bg-background/40 backdrop-blur-lg overflow-hidden">
          {/* ✅ Watermark logo
  <div className="absolute inset-0 flex justify-center items-center opacity-15 pointer-events-none select-none">
    <img
      src={chubbLogo}
      alt="Chubb Watermark"
      className="w-2/3 max-w-[300px] object-contain"
    />
  </div> */}
          <CardContent className="relative z-10 p-6 space-y-4">

            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-secondary text-secondary-foreground px-4 py-1 rounded-lg"
            >
              ← Back
            </Button>

            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full shadow">
                Score: {score}/{questions.length}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Practice Quiz</p>
              <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm">
                ⏳ {timeLeft}s
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-semibold">
                {currentQuestion + 1}. {currentQ.question_text}
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { key: "A", text: currentQ.option_a },
                { key: "B", text: currentQ.option_b },
                { key: "C", text: currentQ.option_c },
                { key: "D", text: currentQ.option_d },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  disabled={!!selectedAnswer}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionClass(
                    option.key
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {option.key}
                    </span>
                    <span>{option.text}</span>

                    {selectedAnswer &&
                      option.key === currentQ.correct_answer && (
                        <Check className="ms-auto text-green-400" />
                      )}

                    {selectedAnswer &&
                      selectedAnswer === option.key &&
                      selectedAnswer !== currentQ.correct_answer && (
                        <X className="ms-auto text-red-400" />
                      )}
                  </div>
                </button>
              ))}

              {selectedAnswer && selectedAnswer !== currentQ.correct_answer && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl">
                  <p className="text-red-600 font-semibold">Explanation:</p>
                  <p className="text-gray-800 mt-1">{currentQ.explanation}</p>
                </div>
              )}

              {selectedAnswer && selectedAnswer === currentQ.correct_answer && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-xl">
                  <p className="text-green-600 font-semibold">Correct! ✅</p>
                  <p className="text-gray-800 mt-1">{currentQ.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-muted-foreground">
                {currentQuestion + 1} of {questions.length} Questions
              </p>
              {selectedAnswer && (
                <Button onClick={handleNext} className="bg-primary text-white px-6">
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
