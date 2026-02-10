import React from 'react';
import { Copy, Check, FileText, Download, Printer, Tag, Sparkles, AlertTriangle, BookOpen, FileBadge } from 'lucide-react';
import Markdown from 'react-markdown';

interface QuestionDisplayProps {
  content: string;
}

// Helper para extrair texto de children do React de forma recursiva
const extractText = (children: React.ReactNode): string => {
  let text = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (typeof child === 'number') {
      text += String(child);
    } else if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{ children?: React.ReactNode }>;
      if (element.props.children) {
        text += extractText(element.props.children);
      }
    }
  });
  return text;
};

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);
  const [downloadingTarget, setDownloadingTarget] = React.useState<string | null>(null);

  // Lógica para separar Questão e RTQ
  const rtiSeparator = "# Relatório Técnico da Questão (RTQ)";
  const hasRti = content.includes(rtiSeparator);
  
  const parts = content.split(rtiSeparator);
  // A parte 0 é a questão. A parte 1 é o RTQ (precisamos recolocar o título).
  const questionText = parts[0];
  const rtiText = hasRti ? rtiSeparator + parts.slice(1).join(rtiSeparator) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToWord = () => {
    const element = document.getElementById('question-content');
    if (!element) return;

    // 1. Clonar o elemento para manipulação
    const clone = element.cloneNode(true) as HTMLElement;

    // 2. Pré-processamento do clone para o Word
    
    // Remover elementos que não devem aparecer no Word (ex: botões ocultos se houver)
    const hiddenElements = clone.querySelectorAll('.print\\:hidden');
    hiddenElements.forEach(el => el.remove());

    // Garantir que o RTQ quebre a página
    const rtiSection = clone.querySelector('#rti-section');
    if (rtiSection) {
        // Insere uma quebra de página explícita do Word antes do RTQ
        const pageBreak = document.createElement('br');
        pageBreak.setAttribute('style', 'page-break-before: always; mso-break-type: section-break');
        rtiSection.parentNode?.insertBefore(pageBreak, rtiSection);
    }

    // 3. HTML Wrapper com CSS Profissional para Word
    const preHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Questão Academicus AI</title>
        <style>
          /* Configuração de Página A4 */
          @page {
            mso-page-orientation: portrait;
            size: 210mm 297mm;
            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          }

          /* Tipografia Geral */
          body { 
            font-family: 'Calibri', 'Arial', sans-serif; 
            font-size: 12pt; 
            line-height: 1.5; 
            color: #000000;
            text-align: justify;
          }

          /* Cabeçalhos */
          h1 { 
            font-size: 16pt; 
            font-weight: bold; 
            color: #0284c7; /* Azul Inep */
            border-bottom: 2pt solid #0284c7; 
            padding-bottom: 6pt;
            margin-top: 24pt; 
            margin-bottom: 18pt; 
          }
          
          h2 { 
            font-size: 14pt; 
            font-weight: bold; 
            color: #1e293b; 
            margin-top: 24pt; 
            margin-bottom: 12pt; 
            background-color: #f8fafc;
            padding: 5pt;
            border-left: 4pt solid #cbd5e1;
          }

          h3 { 
            font-size: 12pt; 
            font-weight: bold; 
            text-transform: uppercase; 
            color: #64748b; 
            margin-top: 18pt; 
            margin-bottom: 6pt;
            letter-spacing: 1px;
          }

          /* Parágrafos e Listas */
          p { margin-bottom: 12pt; }
          
          /* Tabelas Profissionais */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 18pt; 
            border: 1px solid #94a3b8;
          }
          th { 
            background-color: #e2e8f0; 
            color: #1e293b;
            font-weight: bold; 
            border: 1px solid #94a3b8; 
            padding: 8pt; 
            text-align: left; 
          }
          td { 
            border: 1px solid #94a3b8; 
            padding: 8pt; 
            vertical-align: top; 
          }

          /* Elementos Específicos */
          hr { 
            border: 0; 
            border-top: 1px dashed #94a3b8; 
            margin: 24pt 0; 
          }
          
          blockquote { 
            background-color: #fffbeb; 
            border-left: 4pt solid #f59e0b; /* Amber border */
            padding: 12pt; 
            margin: 12pt 0;
            font-style: italic;
            color: #451a03;
          }

          /* Classes Utilitárias convertidas */
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          
          /* Estilo para Alternativas */
          .alternativa {
            margin-bottom: 8pt;
            display: block;
          }

          /* Header do Documento */
          .doc-header {
            margin-bottom: 30pt;
            text-align: right;
            color: #64748b;
            font-size: 10pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10pt;
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
           <strong>Academicus AI</strong> | Gerado em ${new Date().toLocaleDateString()}
        </div>
    `;
    const postHtml = `</body></html>`;

    const html = preHtml + clone.innerHTML + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Questao_Academicus_AI.doc'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (elementId: string, filename: string) => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) return;
    
    setDownloadingTarget(elementId);

    // @ts-ignore - html2pdf is loaded from CDN
    if (typeof window.html2pdf === 'undefined') {
        alert("Erro: Biblioteca PDF não carregada. Tente recarregar a página.");
        setDownloadingTarget(null);
        return;
    }

    // ESTRATÉGIA DE CLONAGEM PARA EVITAR PÁGINAS EM BRANCO
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Configuração de Estilos para "Papel" A4 no Clone
    // A4 width = 210mm. Margins = 10mm left + 10mm right = 20mm.
    // Usable width = 190mm.
    // 190mm @ 96dpi ≈ 718px. 
    // Definindo 715px para garantir que caiba com folga e centralize visualmente.
    clone.style.width = '715px'; 
    clone.style.maxWidth = '715px';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.margin = '0 auto'; // Centraliza o conteúdo no container
    clone.style.padding = '20px'; // Padding interno reduzido para ganhar espaço
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#1e293b'; // slate-800
    
    // Reset de transformações
    clone.style.transform = 'none';
    
    // Inject Print Styles for proper pagination
    const style = document.createElement('style');
    style.innerHTML = `
      .pdf-avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pdf-page-break {
        page-break-before: always !important;
        break-before: page !important;
        display: block !important;
        height: 1px !important;
        margin: 0 !important;
      }
    `;
    clone.appendChild(style);
    
    // TRATAMENTO DE VISIBILIDADE (print:block vs hidden)
    const printVisibleElements = clone.querySelectorAll('.print\\:block');
    printVisibleElements.forEach((el) => {
        el.classList.remove('hidden');
        (el as HTMLElement).style.display = 'block';
    });

    const printHiddenElements = clone.querySelectorAll('.print\\:hidden');
    printHiddenElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
    });

    const breakBeforeElements = clone.querySelectorAll('.print\\:break-before-page');
    breakBeforeElements.forEach((el) => {
        (el as HTMLElement).style.breakBefore = 'page';
        (el as HTMLElement).style.pageBreakBefore = 'always'; // Legacy support
        el.classList.remove('print:break-before-page');
    });

    if (elementId === 'rti-section') {
        clone.style.breakBefore = 'auto';
        clone.style.marginTop = '0';
        // Adiciona classe prose para styling correto em download isolado
        clone.classList.add('prose', 'prose-slate');
    } else if (elementId === 'question-content') {
        // Se estiver gerando o PDF completo, esconde o cabeçalho secundário do RTQ
        // para evitar duplicação (aparecer uma vez no topo e outra na página 2)
        const rtiHeaders = clone.querySelectorAll('.rti-only-header');
        rtiHeaders.forEach(el => (el as HTMLElement).style.display = 'none');
        
        // Remove prose-lg para reduzir tamanho da fonte e margens, facilitando o encaixe em uma página
        clone.classList.remove('prose-lg');
    }

    // Container temporário para isolar o clone do layout flex/grid da app
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-10000px'; // Fora da tela visualmente
    container.style.width = '715px'; // Restringe container para evitar captura de whitespace lateral
    container.style.height = 'auto';
    container.style.zIndex = '10000'; // Garante que esteja acima de qualquer background
    
    container.appendChild(clone);
    document.body.appendChild(container);

    const opt = {
      margin: [10, 10, 10, 10], // Margens em mm (Top, Left, Bottom, Right)
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0, 
          scrollX: 0,
          windowWidth: 1024 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
          mode: ['css', 'legacy']
      }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(container);
        setDownloadingTarget(null);
    }).catch((err: any) => {
        console.error("PDF Generation Error:", err);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        setDownloadingTarget(null);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
    });
  };

  const markdownComponents = {
    strong: ({node, ...props}: any) => <span className="font-bold text-slate-900" {...props} />,
    
    h1: ({node, ...props}: any) => {
        const text = extractText(props.children);
        // Atualizado para detectar RTQ
        if (text.includes('Relatório Técnico')) {
             return (
               // Added pdf-avoid-break to prevent header slicing
               <div className="mt-16 print:mt-0 mb-8 p-6 bg-gradient-to-r from-inep-700 to-inep-600 text-white rounded-xl shadow-lg flex items-center gap-4 border border-inep-500 pdf-avoid-break">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
                    <BookOpen className="w-6 h-6 text-inep-50" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-extrabold m-0 uppercase tracking-widest text-white leading-none" {...props} />
                    <p className="text-inep-100 text-xs font-medium mt-1 uppercase tracking-wide opacity-90">Design Instrucional & Pedagogia</p>
                  </div>
               </div>
             )
        }
        return <h1 className="text-2xl font-bold text-slate-900 mb-6 mt-8 border-b pb-3 pdf-avoid-break" {...props} />
    },
    
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-slate-900 mb-4 mt-6 flex items-center gap-2 pdf-avoid-break" {...props} />,
    
    h3: ({node, ...props}: any) => (
        <div className="flex items-center gap-3 mt-10 mb-5 border-b border-slate-100 pb-2 pdf-avoid-break">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-inep-100 text-inep-700 text-xs font-bold">#</span>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest m-0" {...props} />
        </div>
    ),
    
    p: ({node, ...props}: any) => {
      const text = extractText(props.children).trim();

      if (text === 'PORQUE' || text === '**PORQUE**') {
        return <p className="text-center font-bold text-xl my-8 uppercase tracking-widest text-slate-900 pdf-avoid-break" {...props}>PORQUE</p>;
      }

      if (/^[a-e]\)\s/i.test(text)) {
        return (
          <div className="flex gap-3 mb-3 pl-2 group transition-colors hover:bg-slate-50 p-2 rounded-lg pdf-avoid-break">
            <span className="font-bold text-inep-700 shrink-0">{text.substring(0, 2)}</span>
            <span className="text-slate-700">{text.substring(2)}</span>
          </div>
        );
      }
      
      if (text.startsWith('#')) {
          return (
              <div className="flex flex-wrap gap-2 not-prose mt-4 pt-4 border-t border-slate-100 pdf-avoid-break">
                  {text.split(' ').map((tag: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-inep-50 hover:text-inep-700 hover:border-inep-200 transition-colors cursor-default">
                          <Tag className="w-3 h-3" />
                          {tag.replace('#', '')}
                      </span>
                  ))}
              </div>
          )
      }

      return <p className="mb-4 text-justify text-slate-700 leading-relaxed pdf-avoid-break" {...props}>{props.children}</p>;
    },

    table: ({node, ...props}: any) => (
        <div className="overflow-hidden rounded-xl border border-inep-200 shadow-sm my-8 not-prose bg-white pdf-avoid-break">
            <table className="min-w-full divide-y divide-inep-100" {...props} />
        </div>
    ),
    thead: ({node, ...props}: any) => <thead className="bg-inep-50/80 text-xs uppercase text-inep-800 font-bold tracking-wider" {...props} />,
    th: ({node, ...props}: any) => <th className="px-6 py-4 text-left border-b border-inep-100" {...props} />,
    tbody: ({node, ...props}: any) => <tbody className="bg-white divide-y divide-slate-100" {...props} />,
    tr: ({node, ...props}: any) => <tr className="hover:bg-slate-50/80 transition-colors" {...props} />,
    td: ({node, ...props}: any) => <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap" {...props} />,

    blockquote: ({node, ...props}: any) => {
        const text = extractText(props.children);
        const isCorrection = text.toLowerCase().includes('autoavaliação') || text.toLowerCase().includes('ajuste') || text.toLowerCase().includes('melhoria');
        
        if (isCorrection) {
            return (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 my-6 relative not-prose break-inside-avoid shadow-sm pdf-avoid-break">
                    <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold text-xs uppercase tracking-wide border-b border-amber-200 pb-2">
                        <Sparkles className="w-4 h-4" />
                        Recomendação de Ajuste
                    </div>
                    <div className="text-slate-700 text-sm leading-relaxed" {...props} />
                </div>
            )
        }

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-6 text-slate-700 leading-relaxed shadow-sm relative overflow-hidden group hover:border-inep-200 transition-colors pdf-avoid-break">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300 group-hover:bg-inep-400 transition-colors"></div>
                <div className="pl-2" {...props} />
            </div>
        );
    },
    
    // HR agora força uma quebra de página real na impressão/PDF para separar questões
    hr: ({node, ...props}: any) => (
        <>
            <div className="hidden print:block pdf-page-break"></div>
            <hr className="my-8 border-slate-200 border-dashed print:hidden" {...props} />
        </>
    )
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in-up">
      {/* Action Bar */}
      <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-inep-50 rounded-lg text-inep-600">
                <FileText className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-slate-800 text-lg">Questão Gerada</h2>
                <p className="text-xs text-slate-500">Pronto para exportação</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {hasRti && (
              <button
                onClick={() => generatePDF('rti-section', 'relatorio-tecnico-rtq.pdf')}
                disabled={!!downloadingTarget}
                className="flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 rounded-lg bg-white text-inep-700 border border-inep-200 hover:bg-inep-50 hover:border-inep-300 shadow-sm disabled:opacity-50"
              >
                {downloadingTarget === 'rti-section' ? (
                   <span>Gerando...</span>
                ) : (
                  <>
                    <FileBadge className="w-4 h-4" />
                    <span>Baixar RTQ</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={exportToWord}
              className="flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 rounded-lg bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Word</span>
            </button>
            
            <button
              onClick={() => generatePDF('question-content', 'academicus-completo.pdf')}
              disabled={!!downloadingTarget}
              className="flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 rounded-lg bg-inep-600 text-white hover:bg-inep-700 shadow-sm shadow-inep-600/20 disabled:opacity-50"
            >
              {downloadingTarget === 'question-content' ? (
                  <span>Gerando...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF Completo</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 rounded-lg border ${
                copied 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Content Viewport */}
      <div className="p-8 overflow-y-auto flex-1 bg-white custom-scrollbar print:p-0 print:overflow-visible">
        <article id="question-content" className="prose prose-slate prose-lg max-w-none font-serif leading-loose text-slate-800 text-justify">
            {/* Logo para o PDF Completo (Visível apenas na impressão/PDF) */}
            <div className="hidden print:block mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-inep-800 m-0">Academicus AI</h1>
                <p className="text-sm text-slate-500 m-0">Questão Avaliativa</p>
            </div>

            {/* Renderiza a Questão */}
            <Markdown components={markdownComponents}>
              {questionText}
            </Markdown>

            {/* Renderiza o RTI Separadamente se existir */}
            {hasRti && (
              <div id="rti-section" className="print:break-before-page">
                 {/* Logo para o RTQ Isolado (Visível apenas na impressão/PDF se baixar só o RTQ) - Marcado com rti-only-header para ser ocultado no PDF completo */}
                 <div className="hidden print:block mb-8 border-b border-slate-200 pb-4 rti-only-header">
                    <h1 className="text-2xl font-bold text-inep-800 m-0">Academicus AI</h1>
                    <p className="text-sm text-slate-500 m-0">RTQ - Relatório Técnico da Questão</p>
                 </div>
                 
                 <Markdown components={markdownComponents}>
                   {rtiText}
                 </Markdown>
              </div>
            )}
        </article>
      </div>
    </div>
  );
};