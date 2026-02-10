import React, { useState } from 'react';
import { BookOpen, GraduationCap, PenTool, Layout, FileText, Sparkles, AlertCircle, ChevronRight, Check, Brain, BarChart3, GitCompare, Plus, Minus, Layers, Info, Target, ClipboardCheck, Microscope, ChevronDown } from 'lucide-react';
import { QuestionType, GenerationRequest, BloomLevel, DifficultyLevel } from './types';
import { generateExamQuestion, auditQuestion } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { QuestionDisplay } from './components/QuestionDisplay';
import { BLOOM_INFO, QUESTION_TYPE_INFO } from './constants';

// A chave agora está injetada no serviço, então consideramos que sempre existe.
const hasApiKey = true;

// Hierarquia de Bloom para renderização em pirâmide vertical (Do topo/mais complexo para a base/mais simples)
const bloomHierarchy = [
  BloomLevel.CREATE,     // Topo da pirâmide (menor largura visual)
  BloomLevel.EVALUATE,
  BloomLevel.ANALYZE,
  BloomLevel.APPLY,
  BloomLevel.UNDERSTAND,
  BloomLevel.REMEMBER    // Base da pirâmide (maior largura visual)
];

// Mapeamento das lógicas de Asserção e Razão
const assertionLogic: Record<string, string> = {
  'A': 'As asserções I e II são proposições verdadeiras, e a II é uma justificativa correta da I.',
  'B': 'As asserções I e II são proposições verdadeiras, mas a II não é uma justificativa correta da I.',
  'C': 'A asserção I é uma proposição verdadeira, e a II é uma proposição falsa.',
  'D': 'A asserção I é uma proposição falsa, e a II é uma proposição verdadeira.',
  'E': 'As asserções I e II são proposições falsas.'
};

type Mode = 'generator' | 'auditor';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>('generator');

  // Generator State
  const [course, setCourse] = useState('');
  const [content, setContent] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SINGLE_ANSWER);
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>(BloomLevel.CREATE);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [quantity, setQuantity] = useState<number>(1);
  const [multipleRange, setMultipleRange] = useState<3 | 4 | 5>(4);
  const [targetAlternative, setTargetAlternative] = useState<string>('A');

  // Auditor State
  const [auditInput, setAuditInput] = useState('');

  // Shared State
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.trim() || !content.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const request: GenerationRequest = {
        course,
        content,
        learningObjective,
        type: questionType,
        bloomLevel,
        difficulty,
        quantity,
        multipleRange: questionType === QuestionType.MULTIPLE_COMPLEMENTATION ? multipleRange : undefined,
        correctAlternative: questionType === QuestionType.ASSERTION_REASON ? targetAlternative : undefined
      };
      const result = await generateExamQuestion(request);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao gerar a questão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await auditQuestion(auditInput);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado durante a auditoria.');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  const getTypeIcon = (type: QuestionType, active: boolean) => {
    const className = `w-5 h-5 ${active ? 'text-inep-600' : 'text-slate-400 group-hover:text-inep-500 transition-colors'}`;
    switch (type) {
      case QuestionType.SINGLE_ANSWER: return <CheckCircle className={className} />;
      case QuestionType.INCOMPLETE_STATEMENT: return <PenTool className={className} />;
      case QuestionType.MULTIPLE_COMPLEMENTATION: return <Layout className={className} />;
      case QuestionType.ASSERTION_REASON: return <GitCompare className={className} />;
      case QuestionType.DISCURSIVE: return <FileText className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const getDynamicExample = (type: QuestionType) => {
    if (type !== QuestionType.MULTIPLE_COMPLEMENTATION) {
      return QUESTION_TYPE_INFO[type].example;
    }

    const items = [
      "I. A água ferve a 100ºC ao nível do mar.",
      "II. O gelo é menos denso que a água líquida.",
      "III. A molécula de água é apolar.",
      "IV. A tensão superficial da água é alta.",
      "V. O calor específico da água é elevado."
    ];

    const currentItems = items.slice(0, multipleRange).join("\n");
    let alternatives = "";
    let commandPhrase = "É correto o que se afirma em";

    if (multipleRange === 3) {
      alternatives = "a) I, apenas.\nb) II, apenas.\nc) I e II, apenas.\nd) II e III, apenas.\ne) I, II e III.";
      // Keeps standard command for 3 items (implicit colon removal if consistent, but preserving phrase)
    } else if (multipleRange === 4) {
      alternatives = "a) I e II.\nb) I e IV.\nc) II e III.\nd) I, III e IV.\ne) II, III e IV.";
      commandPhrase = "É correto apenas o que se afirma em";
    } else {
       alternatives = "a) I, II e III.\nb) I, IV e V.\nc) II, III e IV.\nd) I, III e V.\ne) II, IV e V.";
       commandPhrase = "É correto apenas o que se afirma em";
    }

    return `${currentItems}\n\n${commandPhrase}\n\n${alternatives}`;
  };

  const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-inep-100 selection:text-inep-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-inep-600 p-2 rounded-lg shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Academicus AI</h1>
              <p className="text-xs text-slate-500 font-medium">Inteligência Avaliativa para Ensino Superior</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-inep-700 bg-inep-50 px-3 py-1.5 rounded-full border border-inep-100">
             <Sparkles className="w-3 h-3" />
             Powered by Gemini 3 Flash
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 gap-8 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Input Form (Switchable) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
             <button
               onClick={() => { setActiveMode('generator'); setError(null); setGeneratedContent(null); }}
               className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                 activeMode === 'generator' 
                  ? 'bg-white text-inep-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <PenTool className="w-4 h-4" />
               Design de Avaliação
             </button>
             <button
               onClick={() => { setActiveMode('auditor'); setError(null); setGeneratedContent(null); }}
               className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                 activeMode === 'auditor' 
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <ClipboardCheck className="w-4 h-4" />
               Auditoria Técnica
             </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {activeMode === 'generator' ? (
              // === GENERATOR MODE ===
              <>
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-inep-600" />
                    Parâmetros da Questão
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify">
                    Configure os parâmetros abaixo para gerar uma questão inédita alinhada à Taxonomia de Bloom.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <form onSubmit={handleGenerate} className="space-y-6">
                    {/* Course Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="course" className="block text-sm font-semibold text-slate-700">
                        Curso / Área de Conhecimento
                      </label>
                      <input
                        id="course"
                        type="text"
                        required
                        placeholder="Ex: Medicina, Direito Civil, Engenharia..."
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-inep-500 focus:ring-4 focus:ring-inep-500/10 outline-none transition-all duration-200 shadow-sm"
                      />
                    </div>

                    {/* Subject Content & Learning Objective Combined */}
                    <div className="space-y-1.5">
                      <label htmlFor="content" className="block text-sm font-semibold text-slate-700">
                        Objeto de Conhecimento
                      </label>
                      
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-inep-500 focus-within:ring-4 focus-within:ring-inep-500/10 transition-all duration-200 overflow-hidden">
                        <textarea
                          id="content"
                          required
                          rows={3}
                          placeholder="Descreva o tema específico, competência ou habilidade a ser avaliada..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 outline-none resize-none block"
                        />
                        <div className="h-px bg-slate-100 mx-4"></div>
                        <div className="bg-slate-50/50 px-4 py-2.5 flex items-start gap-3">
                          <Target className="w-4 h-4 text-inep-500 mt-1 shrink-0" />
                          <div className="flex-1">
                            <label htmlFor="learningObjective" className="sr-only">Objetivo de Aprendizagem</label>
                            <textarea
                                id="learningObjective"
                                rows={1}
                                placeholder="Objetivo de Aprendizagem (Opcional)..."
                                value={learningObjective}
                                onChange={(e) => setLearningObjective(e.target.value)}
                                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none"
                                style={{ minHeight: '24px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Selector */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-slate-500" />
                          Nível de Dificuldade
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-3 h-28">
                          {/* Fácil */}
                          <button
                            type="button"
                            onClick={() => setDifficulty(DifficultyLevel.EASY)}
                            className={`relative rounded-xl border flex flex-col justify-end items-center p-2 transition-all duration-300 group
                              ${difficulty === DifficultyLevel.EASY 
                                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-100 ring-offset-2' 
                                : 'bg-white border-slate-200 hover:border-sky-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className={`w-full rounded-t-md transition-all duration-300 mb-2
                              ${difficulty === DifficultyLevel.EASY ? 'bg-sky-400 h-1/3 shadow-sm' : 'bg-slate-200 h-1/4 group-hover:bg-sky-200'}
                            `}></div>
                            <span className={`text-xs font-bold ${difficulty === DifficultyLevel.EASY ? 'text-sky-700' : 'text-slate-500'}`}>
                              {DifficultyLevel.EASY}
                            </span>
                          </button>

                          {/* Médio */}
                          <button
                            type="button"
                            onClick={() => setDifficulty(DifficultyLevel.MEDIUM)}
                            className={`relative rounded-xl border flex flex-col justify-end items-center p-2 transition-all duration-300 group
                              ${difficulty === DifficultyLevel.MEDIUM 
                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100 ring-offset-2' 
                                : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className={`w-full rounded-t-md transition-all duration-300 mb-2
                              ${difficulty === DifficultyLevel.MEDIUM ? 'bg-blue-500 h-2/3 shadow-sm' : 'bg-slate-200 h-2/5 group-hover:bg-blue-200'}
                            `}></div>
                            <span className={`text-xs font-bold ${difficulty === DifficultyLevel.MEDIUM ? 'text-blue-700' : 'text-slate-500'}`}>
                              {DifficultyLevel.MEDIUM}
                            </span>
                          </button>

                          {/* Difícil */}
                          <button
                            type="button"
                            onClick={() => setDifficulty(DifficultyLevel.HARD)}
                            className={`relative rounded-xl border flex flex-col justify-end items-center p-2 transition-all duration-300 group
                              ${difficulty === DifficultyLevel.HARD 
                                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100 ring-offset-2' 
                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className={`w-full rounded-t-md transition-all duration-300 mb-2
                              ${difficulty === DifficultyLevel.HARD ? 'bg-indigo-600 h-full shadow-sm' : 'bg-slate-200 h-3/5 group-hover:bg-indigo-200'}
                            `}></div>
                            <span className={`text-xs font-bold ${difficulty === DifficultyLevel.HARD ? 'text-indigo-700' : 'text-slate-500'}`}>
                              {DifficultyLevel.HARD}
                            </span>
                          </button>
                      </div>
                    </div>

                    {/* Bloom Taxonomy */}
                    <div className="border-2 border-indigo-500/30 rounded-xl p-4 space-y-4 bg-white/50">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-indigo-600" />
                          Taxonomia de Bloom
                        </label>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nível Cognitivo</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        {bloomHierarchy.map((level, index) => {
                          const isSelected = bloomLevel === level;
                          const levelInfo = BLOOM_INFO[level];
                          const widthPercent = 45 + (index * 11);
                          
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setBloomLevel(level)}
                              style={{ width: `${widthPercent}%` }}
                              className={`text-xs py-2.5 px-2 rounded-lg border font-bold transition-all duration-200 flex items-center justify-center relative shadow-sm
                                ${isSelected 
                                  ? `${levelInfo.activeClass} z-10 scale-[1.02] ring-2 ring-offset-1 ring-offset-white ring-current` 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>

                      <div className={`p-4 rounded-xl border transition-colors duration-300 ${BLOOM_INFO[bloomLevel].borderClass}`}>
                        <p className="text-sm font-bold text-slate-800 mb-1">{bloomLevel}:</p>
                        <p className="text-sm text-slate-600 italic mb-3 leading-relaxed">
                          {BLOOM_INFO[bloomLevel].description}
                        </p>
                        <p className={`text-[11px] uppercase tracking-wide leading-tight ${BLOOM_INFO[bloomLevel].textClass}`}>
                            <span className="font-extrabold">VERBOS:</span> {BLOOM_INFO[bloomLevel].verbs.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Question Type - Interactive Sequence */}
                    <div className="space-y-4 pt-2">
                      <label className="block text-sm font-semibold text-slate-700">Modelo da Questão</label>
                      <div className="space-y-2">
                        {Object.values(QuestionType).map((type) => {
                          const isActive = questionType === type;
                          const info = QUESTION_TYPE_INFO[type];

                          return (
                            <div
                              key={type}
                              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                isActive
                                  ? 'bg-white border-inep-600 shadow-md ring-1 ring-inep-600/20'
                                  : 'bg-white border-slate-200 hover:border-inep-300 hover:bg-slate-50'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setQuestionType(type)}
                                className="w-full text-left px-4 py-3.5 flex items-center gap-4 outline-none focus:bg-slate-50"
                              >
                                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                  {getTypeIcon(type, isActive)}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-sm font-bold ${isActive ? 'text-inep-900' : 'text-slate-700'}`}>
                                    {type}
                                  </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'border-inep-600 bg-inep-600' : 'border-slate-300'}`}>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </button>

                              {/* Expanded Content */}
                              {isActive && (
                                <div className="px-4 pb-4 animate-fade-in">
                                  {/* Description & Example */}
                                  <div className="mb-4 pl-9">
                                     <p className="text-xs text-slate-600 leading-relaxed mb-3">{info.description}</p>
                                     
                                     <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                                        <div className="flex items-center gap-1.5 mb-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                           <Sparkles className="w-3 h-3" /> Exemplo
                                        </div>
                                        <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">{getDynamicExample(type)}</p>
                                     </div>
                                  </div>

                                  {/* Specific Controls */}
                                  {type === QuestionType.MULTIPLE_COMPLEMENTATION && (
                                    <div className="ml-9 p-3 bg-inep-50 rounded-lg border border-inep-100">
                                       <label className="text-xs font-bold text-inep-800 block mb-2">Quantidade de Itens (I, II...):</label>
                                       <div className="flex gap-2">
                                          {[3, 4, 5].map((range) => (
                                            <button
                                              key={range}
                                              type="button"
                                              onClick={() => setMultipleRange(range as 3|4|5)}
                                              className={`text-xs py-1.5 px-3 rounded-md border font-bold transition-all ${
                                                multipleRange === range
                                                  ? 'bg-inep-600 text-white border-inep-600 shadow-sm'
                                                  : 'bg-white text-slate-600 border-slate-200 hover:border-inep-300 hover:text-inep-700'
                                              }`}
                                            >
                                              {range === 3 ? 'I a III' : range === 4 ? 'I a IV' : 'I a V'}
                                            </button>
                                          ))}
                                       </div>
                                    </div>
                                  )}

                                  {type === QuestionType.ASSERTION_REASON && (
                                    <div className="ml-9 p-3 bg-inep-50 rounded-lg border border-inep-100">
                                      <label className="text-xs font-bold text-inep-800 block mb-2">Definir Gabarito (Engenharia Reversa):</label>
                                      <div className="flex flex-wrap gap-2">
                                        {['A', 'B', 'C', 'D', 'E'].map((alt) => (
                                          <button
                                            key={alt}
                                            type="button"
                                            onClick={() => setTargetAlternative(alt)}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all border ${
                                              targetAlternative === alt
                                                ? 'bg-inep-600 text-white border-inep-600 shadow-sm'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-inep-300 hover:text-inep-700'
                                            }`}
                                            title={assertionLogic[alt]}
                                          >
                                            {alt}
                                          </button>
                                        ))}
                                      </div>
                                      <p className="mt-2 text-[10px] text-inep-700 leading-tight">
                                        {assertionLogic[targetAlternative]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-slate-500" />
                          Quantidade de Questões
                        </label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-lg text-slate-800">{quantity}</span>
                          <button 
                            type="button" 
                            onClick={incrementQuantity}
                            disabled={quantity >= 10}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !hasApiKey || !course || !content}
                      className="w-full bg-inep-600 hover:bg-inep-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-inep-600/20 hover:shadow-inep-600/30 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">Processando...</span>
                      ) : (
                        <>
                          Gerar Questão Avaliativa
                          <ChevronRight className="w-4 h-4 opacity-80" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // === AUDITOR MODE ===
              <>
                <div className="px-6 py-5 border-b border-emerald-100 bg-emerald-50/50">
                  <h2 className="font-bold text-emerald-800 text-lg mb-2 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-emerald-600" />
                    Auditor Pedagógico (Padrão ENADE)
                  </h2>
                  <p className="text-xs text-emerald-700 leading-relaxed text-justify">
                    Cole uma ou múltiplas questões completas (até 10 itens por vez). O sistema analisará cada item individualmente, gerando laudos técnicos sobre qualidade psicométrica, alinhamento cognitivo e conformidade com as diretrizes do INEP.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <form onSubmit={handleAudit} className="space-y-6">
                     <div className="space-y-2">
                        <label htmlFor="auditInput" className="block text-sm font-semibold text-emerald-900">
                          Questões para Auditoria (Lote)
                        </label>
                        <div className="bg-white border border-emerald-200 rounded-xl shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-200">
                          <textarea
                            id="auditInput"
                            required
                            rows={15}
                            placeholder="Cole aqui uma ou mais questões completas (texto-base, enunciado e alternativas)... O sistema identificará automaticamente cada item."
                            value={auditInput}
                            onChange={(e) => setAuditInput(e.target.value)}
                            className="w-full px-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 outline-none resize-none block rounded-xl font-mono text-sm leading-relaxed"
                          />
                        </div>
                        <p className="text-xs text-slate-500 text-right flex items-center justify-end gap-1">
                          <Info className="w-3 h-3" />
                          Inclua o gabarito se desejar verificar a precisão.
                        </p>
                     </div>

                     <button
                        type="submit"
                        disabled={isLoading || !hasApiKey || !auditInput}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">Analisando...</span>
                        ) : (
                          <>
                            Auditar Questão
                            <ClipboardCheck className="w-4 h-4 opacity-80" />
                          </>
                        )}
                      </button>
                  </form>
                  
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex gap-3">
                     <div className="shrink-0">
                       <AlertCircle className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-emerald-800 mb-1">Critérios de Análise</h4>
                       <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside">
                          <li>Anatomia do item e clareza do comando.</li>
                          <li>Alinhamento com Taxonomia de Bloom.</li>
                          <li>Plausibilidade dos distratores (pegadinhas).</li>
                          <li>Vieses e alucinações de conteúdo.</li>
                       </ul>
                     </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Results & Status */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {isLoading ? (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-fade-in h-full">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Erro na Geração</h3>
              <p className="text-red-600 max-w-md">{error}</p>
            </div>
          ) : generatedContent ? (
            <QuestionDisplay content={generatedContent} />
          ) : (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400 h-full border-dashed">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">Aguardando Input</h3>
              <p className="max-w-sm">
                Preencha os parâmetros à esquerda e clique em "Gerar" para criar uma questão avaliativa de alta qualidade.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;