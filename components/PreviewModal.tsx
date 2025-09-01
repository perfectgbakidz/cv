import React, { useState, useRef, useLayoutEffect } from 'react';
import { CVData } from '../types';
import { CVTemplate } from './CVTemplate';

// Declare global variables from CDN scripts
declare const jspdf: any;
declare const html2canvas: any;

interface PreviewModalProps {
  data: CVData;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ data, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const cvTemplateRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const A4_WIDTH_PX = 794; // 210mm is roughly 793.7px
        const containerWidth = previewContainerRef.current.offsetWidth;
        const targetWidth = containerWidth - 48; // Subtract padding for margin
        
        if (targetWidth < A4_WIDTH_PX) {
          setScale(targetWidth / A4_WIDTH_PX);
        } else {
          setScale(1);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);


  const handleDownloadPdf = async () => {
    const input = cvTemplateRef.current;
    if (!input) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const pdfHeight = canvasHeight / ratio;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`${data.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* For high-quality PDF generation, rendered off-screen */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <CVTemplate ref={cvTemplateRef} data={data} />
      </div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200/50">
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">CV Preview</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        
        <div ref={previewContainerRef} className="p-4 sm:p-6 overflow-auto flex-grow bg-slate-50 flex justify-center items-start">
            <div 
                className="origin-top my-4"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                <div className="shadow-2xl bg-white">
                    <CVTemplate data={data} />
                </div>
            </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200/80 flex justify-end gap-4">
          <button onClick={onClose} className="bg-slate-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all duration-300">
            Close
          </button>
          <button onClick={handleDownloadPdf} disabled={isGenerating} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
