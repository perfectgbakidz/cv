import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { CVData } from '../types';
import { CVTemplate } from './CVTemplate';
import { LetterTemplate } from './LetterTemplate';
import { CoverLetterTemplate } from './CoverLetterTemplate';

declare const jspdf: any;
declare const html2canvas: any;

type DocumentSelection = {
  cv: boolean;
  applicationLetter: boolean;
  coverLetter: boolean;
};

interface PreviewModalProps {
  data: CVData;
  selection: DocumentSelection;
  onClose: () => void;
}

type ActiveTab = 'cv' | 'applicationLetter' | 'coverLetter';

export const PreviewModal: React.FC<PreviewModalProps> = ({ data, selection, onClose }) => {
  
  const availableTabs = useMemo(() => {
    return (Object.keys(selection) as ActiveTab[]).filter(key => selection[key]);
  }, [selection]);

  const [isGenerating, setIsGenerating] = useState<ActiveTab | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>(availableTabs[0] || 'cv');
  
  const cvTemplateRef = useRef<HTMLDivElement>(null);
  const letterTemplateRef = useRef<HTMLDivElement>(null);
  const coverLetterTemplateRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const A4_WIDTH_PX = 794;
        const containerWidth = previewContainerRef.current.offsetWidth;
        const targetWidth = containerWidth - 48;
        setScale(targetWidth < A4_WIDTH_PX ? targetWidth / A4_WIDTH_PX : 1);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleDownloadPdf = async (documentType: ActiveTab) => {
    let input: HTMLDivElement | null = null;
    if (documentType === 'cv') input = cvTemplateRef.current;
    if (documentType === 'applicationLetter') input = letterTemplateRef.current;
    if (documentType === 'coverLetter') input = coverLetterTemplateRef.current;
    
    if (!input) return;

    setIsGenerating(documentType);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      let fileName = `${data.personalInfo.fullName.replace(/\s+/g, '_')}`;
      if (documentType === 'cv') fileName += '_CV.pdf';
      if (documentType === 'applicationLetter') fileName += '_Application_Letter.pdf';
      if (documentType === 'coverLetter') fileName += '_Cover_Letter.pdf';
      
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsGenerating(null);
    }
  };

  const getTabName = (tabId: ActiveTab) => {
      switch(tabId) {
          case 'cv': return 'CV / Resume';
          case 'applicationLetter': return 'Application Letter';
          case 'coverLetter': return 'Cover Letter';
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {selection.cv && <CVTemplate ref={cvTemplateRef} data={data} />}
        {selection.applicationLetter && <LetterTemplate ref={letterTemplateRef} data={data} />}
        {selection.coverLetter && <CoverLetterTemplate ref={coverLetterTemplateRef} data={data} />}
      </div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-2">
            {availableTabs.map(tabId => (
                <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabId ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                    {getTabName(tabId)}
                </button>
            ))}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-3xl">&times;</button>
        </div>
        
        <div ref={previewContainerRef} className="p-6 overflow-auto flex-grow bg-slate-50 flex justify-center items-start">
            <div className="origin-top my-4" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                <div className="shadow-2xl bg-white">
                   {activeTab === 'cv' && selection.cv && <CVTemplate data={data} />}
                   {activeTab === 'applicationLetter' && selection.applicationLetter && <LetterTemplate data={data} />}
                   {activeTab === 'coverLetter' && selection.coverLetter && <CoverLetterTemplate data={data} />}
                </div>
            </div>
        </div>

        <div className="p-4 bg-white border-t flex justify-end gap-4">
          <button onClick={onClose} className="bg-slate-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-600">Close</button>
          <button onClick={() => handleDownloadPdf(activeTab)} disabled={!!isGenerating} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
            {isGenerating === activeTab ? 'Generating...' : `Download ${getTabName(activeTab)} PDF`}
          </button>
        </div>
      </div>
    </div>
  );
};
