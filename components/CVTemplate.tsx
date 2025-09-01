import React from 'react';
import { CVData } from '../types';
import { MailIcon, PhoneIcon, LocationIcon, LinkedinIcon, WebsiteIcon } from './Icons';

interface CVTemplateProps {
  data: CVData;
}

const CVTemplate = React.forwardRef<HTMLDivElement, CVTemplateProps>(({ data }, ref) => {
  const { personalInfo, careerObjective, education, experience, skills, certifications, projects, awards, languages, hobbies } = data;

  const Section: React.FC<{ title: string; children: React.ReactNode; show: boolean }> = ({ title, children, show }) => {
    if (!show) return null;
    return (
      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700 border-b-2 border-gray-200 pb-1 mb-3">{title}</h2>
        {children}
      </section>
    );
  };

  return (
    <div
      ref={ref}
      style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}
      className="p-10 bg-white text-gray-900"
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">{personalInfo.fullName}</h1>
        <div className="flex justify-center items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 flex-wrap">
          {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1.5"><MailIcon /> {personalInfo.email}</a>}
          {personalInfo.phone && <span className="flex items-center gap-1.5"><PhoneIcon /> {personalInfo.phone}</span>}
          {personalInfo.address && <span className="flex items-center gap-1.5"><LocationIcon /> {personalInfo.address}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} className="flex items-center gap-1.5"><LinkedinIcon /> LinkedIn</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} className="flex items-center gap-1.5"><WebsiteIcon /> Portfolio</a>}
        </div>
      </header>

      <main>
        <Section title="Career Objective" show={!!careerObjective}>
          <p className="text-sm text-gray-700">{careerObjective}</p>
        </Section>

        <Section title="Work Experience" show={experience.length > 0}>
          {experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-md">{exp.title}</h3>
                <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-sm italic text-gray-700">{exp.company} {exp.location && `| ${exp.location}`}</p>
              <p className="text-sm mt-1 text-gray-600">{exp.responsibilities}</p>
            </div>
          ))}
        </Section>

        <Section title="Education" show={education.length > 0}>
          {education.map(edu => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-md">{edu.institution}</h3>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
              </div>
              <p className="text-sm italic text-gray-700">{edu.degree}{edu.field && `, ${edu.field}`}</p>
              {edu.grade && <p className="text-sm mt-1 text-gray-600">Grade: {edu.grade}</p>}
            </div>
          ))}
        </Section>

        <div className="grid grid-cols-2 gap-x-8">
            <Section title="Skills" show={skills.length > 0}>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {skills.map(skill => <li key={skill.id}>{skill.skill} ({skill.level})</li>)}
              </ul>
            </Section>

            <Section title="Languages" show={languages.length > 0}>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {languages.map(lang => <li key={lang.id}>{lang.language} ({lang.proficiency})</li>)}
              </ul>
            </Section>
        </div>

        <Section title="Projects" show={projects.length > 0}>
          {projects.map(proj => (
            <div key={proj.id} className="mb-3">
              <h3 className="font-bold text-md">{proj.title}</h3>
              <p className="text-sm italic text-gray-700">Tools: {proj.tools}</p>
              <p className="text-sm mt-1 text-gray-600">{proj.description}</p>
            </div>
          ))}
        </Section>

        <Section title="Certifications" show={certifications.length > 0}>
          {certifications.map(cert => (
            <div key={cert.id} className="mb-2 text-sm">
              <span className="font-bold">{cert.name}</span> from <span className="italic">{cert.issuer}</span> ({cert.date})
            </div>
          ))}
        </Section>
        
        <Section title="Awards" show={awards.length > 0}>
            {awards.map(award => (
                <div key={award.id} className="mb-2 text-sm">
                    <span className="font-bold">{award.name}</span> ({award.year})
                    <p className="text-xs text-gray-600">{award.description}</p>
                </div>
            ))}
        </Section>

        <Section title="Hobbies & Interests" show={!!hobbies}>
            <p className="text-sm text-gray-700">{hobbies}</p>
        </Section>

      </main>
    </div>
  );
});

export { CVTemplate };
