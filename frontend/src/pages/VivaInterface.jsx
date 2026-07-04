import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Code2, Play, CheckCircle2, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

export default function VivaInterface() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [codeContext, setCodeContext] = useState('// Paste or upload your code context here...\n// e.g., your Express routes, controllers, or Prisma schema.');
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [inputType, setInputType] = useState('path'); // 'path' or 'text'
  const [localPath, setLocalPath] = useState('');
  
  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [startError, setStartError] = useState('');

  const startViva = async () => {
    if (inputType === 'text' && (!codeContext || codeContext.trim().length < 10)) {
      setStartError('Please provide some meaningful code context first.');
      return;
    }
    if (inputType === 'path' && (!localPath || localPath.trim().length === 0)) {
      setStartError('Please provide a valid local directory path.');
      return;
    }
    
    setIsStarting(true);
    setStartError('');
    try {
      const token = localStorage.getItem('token');
      const payload = { projectId };
      if (inputType === 'text') payload.codebaseContext = codeContext;
      if (inputType === 'path') payload.localPath = localPath;

      const res = await axios.post(
        '/api/viva/start',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.questions) {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(''));
      }
    } catch (err) {
      console.error(err);
      setStartError(err.response?.data?.error || 'Failed to start viva session. Check that the backend server is running.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(updatedAnswers[currentQuestionIndex + 1] || '');
    } else {
      submitEvaluation(updatedAnswers);
    }
  };

  const submitEvaluation = async (finalAnswers) => {
    setIsEvaluating(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        questions: questions,
        answers: finalAnswers,
        projectId 
      };
      if (inputType === 'text') payload.codebaseContext = codeContext;
      if (inputType === 'path') payload.localPath = localPath;

      const res = await axios.post(
        '/api/viva/evaluate',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate answers.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50 px-4 h-16 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Code2 className="text-primary w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">Viva Session: {projectId}</span>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Code Context */}
        <div className="w-1/2 border-r border-white/10 p-6 flex flex-col bg-surface/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" /> Codebase Context
            </h2>
            <div className="flex bg-surface rounded-lg p-1">
              <button 
                onClick={() => setInputType('path')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${inputType === 'path' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Local Path
              </button>
              <button 
                onClick={() => setInputType('text')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${inputType === 'text' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Text
              </button>
            </div>
          </div>
          
          {inputType === 'path' ? (
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-400 mb-2">Absolute Path to Project Directory</label>
              <input
                type="text"
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., C:\Users\YourName\Projects\my-app"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                disabled={questions.length > 0}
              />
              <p className="text-xs text-gray-500 mt-2">
                Our backend will securely read the files in this directory to generate highly context-aware interview questions.
              </p>
            </div>
          ) : (
            <textarea
              className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={codeContext}
              onChange={(e) => setCodeContext(e.target.value)}
              disabled={questions.length > 0}
              spellCheck={false}
            />
          )}
          {startError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {startError}
            </div>
          )}
          {questions.length === 0 && (
            <button 
              onClick={startViva}
              disabled={isStarting}
              className="mt-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isStarting ? 'Analyzing Code...' : 'Start Viva Interview'}
            </button>
          )}
        </div>

        {/* Right Pane: Interaction */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {questions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="p-4 bg-surface rounded-2xl border border-white/5">
                <Code2 className="w-12 h-12 text-gray-600" />
              </div>
              <p className="text-center max-w-sm">Provide your codebase context on the left and click start to begin your mock viva.</p>
            </div>
          ) : !evaluation ? (
            <div className="h-full flex flex-col animate-fade-in-up">
              <div className="mb-6 flex gap-2">
                {questions.map((_, idx) => (
                  <div key={idx} className={`h-2 flex-1 rounded-full ${idx <= currentQuestionIndex ? 'bg-primary' : 'bg-surface border border-white/10'}`} />
                ))}
              </div>
              
              <div className="glass p-6 rounded-2xl mb-6">
                <span className="text-primary text-sm font-bold uppercase tracking-wider mb-2 block">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <h3 className="text-xl font-medium leading-relaxed">{questions[currentQuestionIndex].question}</h3>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                  Context: {questions[currentQuestionIndex].contextReferenced}
                </p>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-400 mb-2">Your Answer</label>
                <textarea
                  className="flex-1 bg-surface border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Explain your reasoning..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer.trim() || isEvaluating}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  {isEvaluating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating...</>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <><CheckCircle2 className="w-5 h-5" /> Submit Answers</>
                  ) : (
                    <>Next Question <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-6">
              <div className="glass p-8 rounded-3xl text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${evaluation.isPass ? 'bg-accent' : 'bg-red-500'}`} />
                <h2 className="text-2xl font-bold mb-2">Evaluation Results</h2>
                <div className="flex items-end justify-center gap-1 my-6">
                  <span className={`text-6xl font-black ${evaluation.score >= 7 ? 'text-accent' : evaluation.score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {evaluation.score}
                  </span>
                  <span className="text-2xl text-gray-500 font-bold pb-1">/10</span>
                </div>
                <p className={`font-semibold inline-block px-4 py-1 rounded-full ${evaluation.isPass ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                  {evaluation.isPass ? 'Pass: Senior Level Achieved' : 'Needs Improvement'}
                </p>
              </div>

              <div className="glass p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-accent w-5 h-5" /> Feedback
                </h3>
                <p className="text-gray-300 leading-relaxed">{evaluation.feedback}</p>
              </div>

              {evaluation.missedPoints && evaluation.missedPoints.length > 0 && (
                <div className="glass p-6 rounded-2xl border-orange-500/20">
                  <h3 className="font-bold text-lg mb-3 text-orange-400">Areas for Improvement</h3>
                  <ul className="space-y-3">
                    {evaluation.missedPoints.map((pt, i) => (
                      <li key={i} className="flex gap-3 text-gray-300">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.questionEvaluations && evaluation.questionEvaluations.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-bold text-xl mb-4">Detailed Question Analysis</h3>
                  {evaluation.questionEvaluations.map((qe, idx) => (
                    <div key={idx} className="bg-surface/50 border border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <h4 className="font-semibold text-lg">{qe.question}</h4>
                        <div className="bg-background-tertiary px-3 py-1 rounded-lg text-sm font-bold shrink-0">
                          <span className={qe.score >= 7 ? 'text-accent' : qe.score >= 4 ? 'text-yellow-500' : 'text-red-500'}>{qe.score}</span> / 10
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{qe.feedback}</p>
                      {qe.missedPoints && qe.missedPoints.length > 0 && (
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-orange-400 mb-2">Missed in this answer:</p>
                          <ul className="space-y-1">
                            {qe.missedPoints.map((mp, i) => (
                              <li key={i} className="text-sm text-gray-400 flex gap-2">
                                <span className="text-orange-500">-</span> {mp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-surface hover:bg-white/5 border border-white/10 text-white font-medium py-4 rounded-xl transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
