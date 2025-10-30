import React from 'react';
import { CVData } from '../types';

interface CoverLetterTemplateProps {
  data: CVData;
}

const CoverLetterTemplate = React.forwardRef<HTMLDivElement, CoverLetterTemplateProps>(({ data }, ref) => {
  const { personalInfo, coverLetter } = data;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const salutation = coverLetter.recipientName
    ? `Dear ${coverLetter.recipientName},`
    : 'Dear Hiring Team,';

  return (
    <div
      ref={ref}
      style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Calibri, Arial, sans-serif' }}
      className="p-12 bg-white text-gray-900 text-base leading-relaxed"
    >
      {/* Sender's Information */}
      <header className="mb-12">
        <h1 className="text-3xl font-bold border-b-2 border-gray-800 pb-2">{personalInfo.fullName}</h1>
        <p className="text-right text-sm">{personalInfo.address} | {personalInfo.phone} | {personalInfo.email}</p>
      </header>

      <main>
        {/* Date */}
        <div className="mb-8">
          <p>{today}</p>
        </div>

        {/* Recipient's Information */}
        <div className="mb-8">
          {coverLetter.recipientName && <p>{coverLetter.recipientName}</p>}
          {coverLetter.recipientDepartment && <p>{coverLetter.recipientDepartment}</p>}
          <p className="font-bold">{coverLetter.companyName}</p>
          {coverLetter.companyAddress && <p>{coverLetter.companyAddress}</p>}
        </div>

        {/* Subject Line */}
        <div className="mb-6">
          <p className="font-bold">Re: Application for the {coverLetter.jobTitle || '[Job Title]'} Position</p>
        </div>

        {/* Salutation */}
        <div className="mb-6">
            <p>{salutation}</p>
        </div>

        {/* Letter Body */}
        <div className="whitespace-pre-wrap text-justify space-y-4">
            {coverLetter.letterBody ? (
                coverLetter.letterBody.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))
            ) : (
                <p className="text-gray-400 italic">[Your cover letter body will appear here. Fill in the details above—especially the job requirements and company values—and use the AI drafter to generate a compelling draft.]</p>
            )}
        </div>

        {/* Closing */}
        <div className="mt-10">
            <p>Sincerely,</p>
            <p className="mt-6 font-semibold">{personalInfo.fullName}</p>
        </div>
      </main>
    </div>
  );
});

export { CoverLetterTemplate };