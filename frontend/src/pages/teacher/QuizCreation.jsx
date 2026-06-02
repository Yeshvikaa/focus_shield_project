import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api.js';
import { ChevronLeft, Plus, Trash2, CheckCircle, Save, AlertCircle } from 'lucide-react';

const QuizCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read homeworkId query if passed
  const queryHwId = new URLSearchParams(location.search).get('homeworkId') || '';

  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHw, setSelectedHw] = useState(queryHwId);
  const [quizTitle, setQuizTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(120); // default 2 mins
  
  // Array of questions: { questionText, options: ['', '', '', ''], correctAnswerIndex: 0 }
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const res = await api.get('/api/homework');
      setHomeworks(res.data);
      // If no queryHwId but lists available, choose first
      if (!selectedHw && res.data.length > 0) {
        setSelectedHw(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load homeworks lists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (qIdx, text) => {
    const updated = [...questions];
    updated[qIdx].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, text) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIdx, oIdx) => {
    const updated = [...questions];
    updated[qIdx].correctAnswerIndex = oIdx;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (!selectedHw) {
      return setErrorMsg('Please link this quiz to an active assignment.');
    }

    if (!quizTitle) {
      return setErrorMsg('Please enter a Quiz Title.');
    }

    // Verify all questions have text and options filled
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        return setErrorMsg(`Question ${i + 1} text is empty.`);
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          return setErrorMsg(`Question ${i + 1}, Option ${j + 1} is empty.`);
        }
      }
    }

    setIsSubmitting(true);
    try {
      const quizPayload = {
        homeworkId: selectedHw,
        title: quizTitle,
        questions,
        timeLimit
      };

      await api.post('/api/quiz', quizPayload);
      setStatusMsg('Quiz protocol generated successfully!');
      setTimeout(() => {
        navigate('/teacher');
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create quiz database record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/teacher')}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-brandCyan font-bold uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div>
          <h3 className="font-extrabold text-white text-base">Quiz Design Sandbox</h3>
          <p className="text-[11px] text-white/40 mt-0.5">Build MCQ question lists linked to study assignments.</p>
        </div>

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-brandCyan/15 border border-brandCyan/20 text-xs text-brandCyan text-center">
            {statusMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Homework Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Link to Study Protocol</label>
              <select
                value={selectedHw}
                onChange={(e) => setSelectedHw(e.target.value)}
                className="w-full bg-slate-950/80 hover:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none outline-0 transition-all cursor-pointer"
              >
                {homeworks.length === 0 ? (
                  <option value="">No assignments uploaded</option>
                ) : (
                  homeworks.map((hw) => (
                    <option key={hw._id} value={hw._id}>
                      {hw.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Time limit */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Quiz Time Limit (Seconds)</label>
              <input
                type="number"
                min="30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Quiz Title */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 block font-bold">Quiz Title</label>
            <input
              type="text"
              placeholder="e.g. MCQ Assessment: Quantum Physics basics"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
            />
          </div>

          {/* Questions Sandbox */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-white text-xs block">Questions Specifications</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-brandBlue text-slate-950 font-bold rounded-lg text-[10px] hover:opacity-90 transition-all flex items-center gap-1 uppercase"
              >
                <Plus size={12} /> Add Question
              </button>
            </div>

            {questions.map((question, qIdx) => (
              <div key={qIdx} className="p-5 rounded-xl bg-slate-950/40 border border-white/5 space-y-4 relative">
                {/* Delete floating button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="absolute top-4 right-4 text-red-500/60 hover:text-red-400 p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {/* Question Text */}
                <div className="space-y-2 pr-8">
                  <label className="text-[10px] text-white/40 block font-bold uppercase">Question {qIdx + 1}</label>
                  <input
                    type="text"
                    placeholder="Enter question text here..."
                    value={question.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-lg py-2.5 px-3 text-white outline-none transition-all"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 block font-bold uppercase">Option choices & correct answer</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name={`correct-ans-${qIdx}`}
                          checked={question.correctAnswerIndex === oIdx}
                          onChange={() => handleCorrectAnswerChange(qIdx, oIdx)}
                          className="w-4 h-4 accent-brandCyan cursor-pointer shrink-0"
                          title="Set as correct answer"
                        />
                        <input
                          type="text"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          className={`w-full bg-slate-950/70 border text-[11px] rounded-lg py-2 px-3 text-white outline-none transition-all ${
                            question.correctAnswerIndex === oIdx 
                              ? 'border-brandCyan/40 focus:border-brandCyan' 
                              : 'border-white/10 focus:border-brandCyan'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-brandPurple to-brandBlue text-white font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-purple flex items-center justify-center gap-2 uppercase"
          >
            <Save size={16} />
            {isSubmitting ? 'GENERATING SANDBOX...' : 'Save Quiz Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizCreation;
