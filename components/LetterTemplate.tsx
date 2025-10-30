import React from 'react';
import { CVData } from '../types';

interface LetterTemplateProps {
  data: CVData;
}

const LetterTemplate = React.forwardRef<HTMLDivElement, LetterTemplateProps>(({ data }, ref) => {
  const { personalInfo, applicationLetter } = data;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const salutation = applicationLetter.hiringManager
    ? `Dear ${applicationLetter.hiringManager},`
    : 'Dear Hiring Team,';

  return (
    <div
      ref={ref}
      style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}
      className="p-12 bg-white text-gray-900 text-sm leading-relaxed"
    >
      <header className="text-right mb-12">
        <h1 className="text-2xl font-bold">{personalInfo.fullName}</h1>
        <p>{personalInfo.address}</p>
        <p>{personalInfo.phone}</p>
        <p>{personalInfo.email}</p>
      </header>

      <main>
        <div className="mb-8">
          <p>{today}</p>
        </div>

        <div className="mb-8">
          {applicationLetter.hiringManager && <p>{applicationLetter.hiringManager}</p>}
          <p className="font-bold">{applicationLetter.companyName}</p>
        </div>

        <div className="mb-6">
          <p className="font-bold">Re: Application for the {applicationLetter.jobTitle || '[Job Title]'} Position</p>
        </div>

        <div className="mb-6">
            <p>{salutation}</p>
        </div>

        <div className="whitespace-pre-wrap">
            {applicationLetter.letterBody || (
                <p className="text-gray-400 italic">[Your application letter body will appear here.]</p>
            )}
        </div>

        <div className="mt-8">
            <p>Sincerely,</p>
            <p className="mt-4 font-semibold">{personalInfo.fullName}</p>
        </div>
      </main>
    </div>
  );
});

export { LetterTemplate };
