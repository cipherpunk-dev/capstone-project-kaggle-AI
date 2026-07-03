import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Code2, Play, CheckCircle2, ChevronRight, Loader2, ArrowLeft, Folder, Target } from 'lucide-react';

export default function VivaInterface() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialLocalPath = location.state?.localPath || '';

  const [localPath, setLocalPath] = useState(initialLocalPath);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    // If we landed here with a path, we can optionally auto-start or just let the user confirm
  }, []);

  const startViva = async () => {
    if (!localPath || localPath.trim().length === 0) {
      alert('Please provide a valid local repository path.');
      return;
    }
    
    setIsStarting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8080/api/viva/start',
        { localPath, projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.questions) {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(''));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to start viva session. Ensure the path is correct.');
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
      const res = await axios.post(
        'http://localhost:8080/api/viva/evaluate',
        { 
          localPath,
          questions: questions,
          answers: finalAnswers,
          projectId 
        },
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
        {/* Left Pane: Setup */}
        <div className="w-1/3 border-r border-white/10 p-6 flex flex-col bg-surface/30 border-r-2 shadow-2xl z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary" /> Repository Context
            </h2>
          </div>
          
          <div className="space-y-4 mb-8">
            <p className="text-sm text-gray-400">
              Provide the absolute path to your local project directory. The Interviewer Agent will scan your code and generate 3 tailored questions.
            </p>
            <input
              type="text"
              className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="C:/Projects/my-backend"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              disabled={questions.length > 0}
            />
          </div>

          {questions.length === 0 && (
            <button 
              onClick={startViva}
              disabled={isStarting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-105"
            >
              {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isStarting ? 'Scanning Codebase & Generating Questions...' : 'Start Viva Interview'}
            </button>
          )}

          {questions.length > 0 && !evaluation && (
             <div className="mt-8 p-6 glass rounded-2xl border-primary/20 animate-fade-in-up">
               <h3 className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5" /> Codebase Analyzed
               </h3>
               <p className="text-sm text-gray-400 leading-relaxed">
                 The Interviewer Agent successfully scanned <span className="text-white font-mono break-all">{localPath}</span>. 
                 <br/><br/>
                 Please proceed to answer the 3 generated questions on the right. Good luck!
               </p>
             </div>
          )}
        </div>

        {/* Right Pane: Interaction */}
        <div className="w-2/3 p-10 overflow-y-auto bg-surface/10">
          {questions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="p-6 bg-surface rounded-3xl border border-white/5 shadow-2xl">
                <Code2 className="w-16 h-16 text-gray-600 animate-pulse" />
              </div>
              <p className="text-center max-w-sm text-lg">Verify your repository path on the left and click start to begin your mock viva.</p>
            </div>
          ) : !evaluation ? (
            <div className="h-full flex flex-col animate-fade-in-up max-w-3xl mx-auto w-full">
              <div className="mb-8 flex gap-2">
                {questions.map((_, idx) => (
                  <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx <= currentQuestionIndex ? 'bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-surface border border-white/10'}`} />
                ))}
              </div>
              
              <div className="glass p-8 rounded-3xl mb-8 border-t-4 border-t-primary shadow-2xl">
                <span className="text-primary text-sm font-bold uppercase tracking-wider mb-4 block">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <h3 className="text-2xl font-medium leading-relaxed mb-4">{questions[currentQuestionIndex].question}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs text-gray-400 font-mono">Context: {questions[currentQuestionIndex].contextReferenced}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col mb-8">
                <label className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Your Answer</label>
                <textarea
                  className="flex-1 bg-surface border border-white/10 rounded-2xl p-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-inner"
                  placeholder="Explain your reasoning clearly..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer.trim() || isEvaluating}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary/30 hover:scale-105"
                >
                  {isEvaluating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Responses...</>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <><CheckCircle2 className="w-5 h-5" /> Submit All Answers</>
                  ) : (
                    <>Next Question <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-8 max-w-3xl mx-auto w-full pb-20">
              <div className="glass p-10 rounded-[2rem] text-center relative overflow-hidden shadow-2xl">
                <div className={`absolute top-0 left-0 w-full h-3 ${evaluation.isPass ? 'bg-accent' : 'bg-red-500'}`} />
                <h2 className="text-3xl font-bold mb-4">Evaluation Results</h2>
                <div className="flex items-end justify-center gap-1 my-8">
                  <span className={`text-8xl font-black tracking-tighter ${evaluation.score >= 7 ? 'text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]' : evaluation.score >= 4 ? 'text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}>
                    {evaluation.score}
                  </span>
                  <span className="text-3xl text-gray-500 font-bold pb-2">/10</span>
                </div>
                <p className={`font-bold inline-flex items-center gap-2 px-6 py-2 rounded-full text-lg ${evaluation.isPass ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                  {evaluation.isPass ? <><CheckCircle2 className="w-5 h-5"/> Senior Level Achieved</> : 'Needs Improvement'}
                </p>
              </div>

              <div className="glass p-8 rounded-3xl shadow-xl">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                  <span className="p-2 bg-accent/20 rounded-xl"><CheckCircle2 className="text-accent w-6 h-6" /></span>
                  Feedback
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{evaluation.feedback}</p>
              </div>

              {evaluation.missedPoints && evaluation.missedPoints.length > 0 && (
                <div className="glass p-8 rounded-3xl border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] mb-8">
                  <h3 className="font-bold text-xl mb-6 text-orange-400 flex items-center gap-3">
                    <span className="p-2 bg-orange-500/20 rounded-xl"><Target className="text-orange-500 w-6 h-6" /></span>
                    High-level Areas for Improvement
                  </h3>
                  <ul className="space-y-4">
                    {evaluation.missedPoints.map((pt, i) => (
                      <li key={i} className="flex gap-4 text-gray-300 items-start bg-surface/50 p-4 rounded-2xl">
                        <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.questionEvaluations && evaluation.questionEvaluations.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-bold text-2xl mb-4">Detailed Question Analysis</h3>
                  {evaluation.questionEvaluations.map((qe, i) => (
                    <div key={i} className="glass p-8 rounded-3xl border border-white/5">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h4 className="text-lg font-medium text-gray-200 flex-1">
                          <span className="text-primary font-bold mr-2">Q{i + 1}:</span>
                          {qe.question}
                        </h4>
                        <div className="flex flex-col items-center justify-center p-3 bg-surface/50 rounded-xl border border-white/10 shrink-0 min-w-[70px]">
                          <span className={`text-xl font-bold ${qe.score >= 7 ? 'text-accent' : qe.score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {qe.score}
                          </span>
                          <span className="text-xs text-gray-500 font-bold uppercase">/ 10</span>
                        </div>
                      </div>
                      <div className="bg-surface/50 p-5 rounded-2xl mb-4">
                        <p className="text-gray-300 leading-relaxed text-sm">{qe.feedback}</p>
                      </div>
                      {qe.missedPoints && qe.missedPoints.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Missed Points
                          </h5>
                          <ul className="space-y-2">
                            {qe.missedPoints.map((pt, idx) => (
                              <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                <span className="text-orange-500/50 mt-0.5">•</span>
                                {pt}
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
                className="w-full bg-surface hover:bg-white/5 border border-white/10 text-white font-bold py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] mt-8"
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
