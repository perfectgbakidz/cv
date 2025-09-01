import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  error?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, error }) => {
  return (
    <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
      <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">{title}</h2>
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
};