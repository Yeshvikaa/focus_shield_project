import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import confetti from 'canvas-confetti';
import { ChevronLeft, HelpCircle, Check, AlertTriangle, ArrowRight, BookOpen, Clock, Award } from 'lucide-react';

const MCQQuiz = () => {
  const { id } = useParams(); // Homework ID
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Scoring results state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // holds score, passed, details

  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizDetail();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const fetchQuizDetail = async () => {
    try {
      const res = await api.get(`/api/homework/${id}`);
      setData(res.data);
      
      const quiz = res.data.quiz;
      if (quiz) {
        setTimeRemaining(quiz.timeLimit);
        startTimer(quiz.timeLimit);
      }
    } catch (err) {
      console.error('Error fetching quiz info:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (limit) => {
    let timeLeft = limit;
    timerRef.current = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      setTimeRemaining(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        handleSubmitQuiz(true); // Auto-submit when timer expires
      }
    }, 1000);
  };

  const handleSelectOption = (optionIndex) => {
    if (result) return; // quiz completed
    setAnswers({ ...answers, [activeQuestion]: optionIndex });
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (submitting || result) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    // Format answers array
    const quizObj = data.quiz;
    const studentAnswers = [];
    for (let i = 0; i < quizObj.questions.length; i++) {
      studentAnswers.push(answers[i] !== undefined ? answers[i] : -1);
    }

    try {
      const res = await api.post(`/api/quiz/${quizObj._id}/submit`, { answers: studentAnswers });
      setResult(res.data);

      if (res.data.passed) {
        // Confetti Celebration!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Quiz submission failure:', err);
      alert(err.response?.data?.message || 'Error submitting test answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  const { homework, quiz, submission } = data;

  if (!quiz) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 max-w-md mx-auto">
        <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
        <h3 className="font-extrabold text-white text-base">Quiz Not Generated</h3>
        <p className="text-xs text-white/50 mt-1">This assignment PDF has no quiz test attached by the teacher yet.</p>
        <button
          onClick={() => navigate('/student/homework')}
          className="mt-6 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-xs font-bold transition-all"
        >
          Return to Protocols
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[activeQuestion];
  const isLastQuestion = activeQuestion === quiz.questions.length - 1;

  // Render Result Screen
  if (result) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        {result.passed ? (
          // Success view
          <div className="glass-panel p-8 rounded-2xl border border-green-500/20 shadow-glass-cyan text-center relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
            
            <div className="inline-flex p-4 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 shadow-lg">
              <Check size={40} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Quiz Completed: PASSED!</h2>
              <p className="text-xs text-white/50 mt-1">You unlocked focus shields and obtained parameters.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-white/5">
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Pass Score</span>
                <span className="text-xl font-extrabold text-green-400">{result.score}%</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Correct Answers</span>
                <span className="text-xl font-bold text-white">{result.correctCount} / {result.totalQuestions}</span>
              </div>
            </div>

            {/* Rewards Alert */}
            <div className="p-4 rounded-xl bg-brandCyan/10 border border-brandCyan/20 flex items-center gap-3 text-left">
              <div className="p-2.5 bg-brandCyan/15 text-brandCyan rounded-lg">
                <Award size={20} className="fill-brandCyan/10" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Rewards Successfully Unlocked!</span>
                <span className="text-[10px] text-brandCyan block">Received +{result.xpEarned} XP point boost.</span>
                {result.levelUpOccurred && <span className="text-[10px] text-brandPurple block font-semibold">User Level Increased!</span>}
                {result.badgesUnlocked?.length > 0 && (
                  <span className="text-[10px] text-orange-400 block font-semibold">Unlocked Badge: {result.badgesUnlocked.join(', ')}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/student/homework')}
              className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-1.5 uppercase"
            >
              Return to Protocols
            </button>
          </div>
        ) : (
          // Fail view
          <div className="glass-panel p-8 rounded-2xl border border-red-500/20 shadow-lg text-center relative overflow-hidden space-y-6 animate-shake">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
            
            <div className="inline-flex p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
              <AlertTriangle size={40} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Quiz Failed!</h2>
              <p className="text-xs text-white/50 mt-1">Passing requires a 70% minimum correctness score.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-white/5">
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Your Score</span>
                <span className="text-xl font-extrabold text-red-400">{result.score}%</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">Correct Answers</span>
                <span className="text-xl font-bold text-white">{result.correctCount} / {result.totalQuestions}</span>
              </div>
            </div>

            {/* Discipline warning panel */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left space-y-2">
              <span className="text-xs font-bold text-red-400 block uppercase tracking-wider">Discipline Reset Triggered!</span>
              <p className="text-xs text-white/70 leading-relaxed">
                As per the Focus Shield discipline guidelines, failing the quiz resets your PDF study logs. You must open and re-read the PDF before reattempting the quiz.
              </p>
            </div>

            <button
              onClick={() => navigate(`/student/homework/${id}/study`)}
              className="w-full py-3.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase"
            >
              <BookOpen size={14} />
              Re-open PDF Lock
            </button>
          </div>
        )}
      </div>
    );
  }

  // Format countdown seconds
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/student/homework')}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-brandCyan font-bold uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Exit Exam
        </button>

        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-inner">
          <Clock size={14} className="animate-pulse" />
          <span>Timer: {formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Progress tracking */}
      <div className="flex justify-between items-center text-xs text-white/50 font-bold px-1">
        <span>Question {activeQuestion + 1} of {quiz.questions.length}</span>
        <span>{Math.round(((activeQuestion + 1) / quiz.questions.length) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-brandCyan h-full transition-all duration-300" style={{ width: `${((activeQuestion + 1) / quiz.questions.length) * 100}%` }}></div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="flex gap-3">
          <div className="p-2 bg-brandCyan/10 text-brandCyan rounded-lg border border-brandCyan/25 h-fit mt-0.5 font-bold text-xs select-none">
            Q{activeQuestion + 1}
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
            {currentQuestion.questionText}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2 pt-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[activeQuestion] === index;
            return (
              <div
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold hover:bg-white/5 ${
                  isSelected
                    ? 'border-brandCyan bg-brandCyan/10 text-brandCyan shadow-glass-cyan font-bold'
                    : 'border-white/5 bg-slate-950/40 text-white/70'
                }`}
              >
                <span>{option}</span>
                {isSelected && <div className="w-2.5 h-2.5 bg-brandCyan rounded-full"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex justify-between gap-4">
        <button
          onClick={() => setActiveQuestion(Math.max(0, activeQuestion - 1))}
          disabled={activeQuestion === 0}
          className="px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-extrabold disabled:opacity-40 transition-all uppercase"
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={() => handleSubmitQuiz()}
            disabled={submitting}
            className="flex-1 py-3 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-1.5 uppercase"
          >
            {submitting ? 'GRADING EXAM...' : 'Submit Answers'}
          </button>
        ) : (
          <button
            onClick={() => setActiveQuestion(activeQuestion + 1)}
            disabled={answers[activeQuestion] === undefined}
            className="px-6 py-3 bg-brandBlue text-slate-950 font-black rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1 uppercase"
          >
            Next Question <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQQuiz;
