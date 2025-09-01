import React, { useState, useCallback } from 'react';
import { CVData, PersonalInfo, Education, Experience, Skill, Certification, Project, Award, Language, Referee, Errors } from './types';
import { Section } from './components/Section';
import { InputField } from './components/InputField';
import { TextareaField } from './components/TextareaField';
import { SelectField } from './components/SelectField';
import { PreviewModal } from './components/PreviewModal';
import { PlusIcon, TrashIcon } from './components/Icons';

const App: React.FC = () => {
    const [cvData, setCvData] = useState<CVData>({
        personalInfo: { fullName: '', dob: '', gender: '', phone: '', email: '', address: '', linkedin: '', portfolio: '' },
        careerObjective: '',
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: [],
        awards: [],
        languages: [],
        hobbies: '',
        referees: [],
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const validate = useCallback(() => {
        const newErrors: Errors = {};
        const { personalInfo, careerObjective, education, experience } = cvData;

        if (!personalInfo.fullName) newErrors.fullName = 'Full Name is required.';
        if (!personalInfo.email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
            newErrors.email = 'Email is invalid.';
        }
        if (!personalInfo.phone) {
            newErrors.phone = 'Contact Number is required.';
        } else if (!/^\+?[0-9\s-()]+$/.test(personalInfo.phone)) {
            newErrors.phone = 'Contact Number is invalid.';
        }
        if (!careerObjective) newErrors.careerObjective = 'Career Objective is required.';
        
        if (education.length === 0) {
           newErrors.education = 'At least one education entry is required.';
        } else {
            education.forEach((edu, index) => {
                if (!edu.institution) newErrors[`edu_institution_${index}`] = 'Institution Name is required.';
                if (!edu.degree) newErrors[`edu_degree_${index}`] = 'Degree/Certificate is required.';
                if (edu.endDate && edu.startDate && edu.endDate < edu.startDate) {
                    newErrors[`edu_endDate_${index}`] = 'End date cannot be before start date.';
                }
            });
        }
       
        if (experience.length === 0) {
            newErrors.experience = 'At least one work experience is required.';
        } else {
            experience.forEach((exp, index) => {
                if (!exp.title) newErrors[`exp_title_${index}`] = 'Job Title is required.';
                if (!exp.company) newErrors[`exp_company_${index}`] = 'Company Name is required.';
                if (!exp.responsibilities) newErrors[`exp_responsibilities_${index}`] = 'Responsibilities are required.';
                if (exp.endDate && exp.startDate && exp.endDate < exp.startDate) {
                    newErrors[`exp_endDate_${index}`] = 'End date cannot be before start date.';
                }
            });
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [cvData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsPreviewOpen(true);
        }
    };

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
    };

    const handleFieldChange = <T,>(section: keyof CVData, index: number, field: keyof T, value: string) => {
        setCvData(prev => {
            const newSection = [...(prev[section] as T[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };

    const addField = <T,>(section: keyof CVData, newField: T) => {
        setCvData(prev => ({ ...prev, [section]: [...(prev[section] as T[]), newField] }));
    };

    const removeField = (section: keyof CVData, index: number) => {
        setCvData(prev => {
            const sectionData = prev[section];
            if (Array.isArray(sectionData)) {
                const newSection = [...sectionData];
                newSection.splice(index, 1);
                return { ...prev, [section]: newSection };
            }
            return prev;
        });
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">CV Information Form</h1>
                    <p className="text-slate-600 mt-3 text-lg">Fill in your details to generate a professional CV.</p>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    {/* Personal Information */}
                    <Section title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Full Name" name="fullName" value={cvData.personalInfo.fullName} onChange={handlePersonalInfoChange} error={errors.fullName} required />
                            <InputField type="date" label="Date of Birth" name="dob" value={cvData.personalInfo.dob} onChange={handlePersonalInfoChange} />
                            <SelectField label="Gender" name="gender" value={cvData.personalInfo.gender} onChange={handlePersonalInfoChange} options={['Male', 'Female', 'Other']} />
                            <InputField type="tel" label="Contact Number" name="phone" value={cvData.personalInfo.phone} onChange={handlePersonalInfoChange} error={errors.phone} required />
                            <InputField type="email" label="Email Address" name="email" value={cvData.personalInfo.email} onChange={handlePersonalInfoChange} error={errors.email} required />
                            <InputField label="Home Address" name="address" value={cvData.personalInfo.address} onChange={handlePersonalInfoChange} />
                            <InputField type="url" label="LinkedIn Profile" name="linkedin" value={cvData.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
                            <InputField type="url" label="Portfolio/Website" name="portfolio" value={cvData.personalInfo.portfolio} onChange={handlePersonalInfoChange} />
                        </div>
                    </Section>

                    {/* Career Objective */}
                    <Section title="Career Objective / Personal Statement">
                        <TextareaField label="Career Objective" name="careerObjective" value={cvData.careerObjective} onChange={(e) => setCvData({ ...cvData, careerObjective: e.target.value })} maxLength={300} error={errors.careerObjective} required />
                    </Section>
                    
                    {/* Education */}
                    <Section title="Education Background" error={errors.education}>
                        {cvData.education.map((edu, index) => (
                            <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative transition-shadow hover:shadow-md">
                                <button type="button" onClick={() => removeField('education', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Institution Name" value={edu.institution} onChange={(e) => handleFieldChange<Education>('education', index, 'institution', e.target.value)} error={errors[`edu_institution_${index}`]} required/>
                                    <InputField label="Degree/Certificate" value={edu.degree} onChange={(e) => handleFieldChange<Education>('education', index, 'degree', e.target.value)} error={errors[`edu_degree_${index}`]} required/>
                                    <InputField label="Field of Study" value={edu.field} onChange={(e) => handleFieldChange<Education>('education', index, 'field', e.target.value)} />
                                    <InputField type="month" label="Start Date" value={edu.startDate} onChange={(e) => handleFieldChange<Education>('education', index, 'startDate', e.target.value)} />
                                    <InputField type="month" label="End Date" value={edu.endDate} onChange={(e) => handleFieldChange<Education>('education', index, 'endDate', e.target.value)} error={errors[`edu_endDate_${index}`]}/>
                                    <InputField label="Grade/CGPA" value={edu.grade} onChange={(e) => handleFieldChange<Education>('education', index, 'grade', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Education>('education', { id: Date.now().toString(), institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Education</button>
                    </Section>

                    {/* Work Experience */}
                    <Section title="Work Experience / Internship" error={errors.experience}>
                        {cvData.experience.map((exp, index) => (
                            <div key={exp.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative transition-shadow hover:shadow-md">
                                <button type="button" onClick={() => removeField('experience', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Job Title" value={exp.title} onChange={(e) => handleFieldChange<Experience>('experience', index, 'title', e.target.value)} error={errors[`exp_title_${index}`]} required />
                                    <InputField label="Company Name" value={exp.company} onChange={(e) => handleFieldChange<Experience>('experience', index, 'company', e.target.value)} error={errors[`exp_company_${index}`]} required/>
                                    <InputField label="Location" value={exp.location} onChange={(e) => handleFieldChange<Experience>('experience', index, 'location', e.target.value)} />
                                    <InputField type="month" label="Start Date" value={exp.startDate} onChange={(e) => handleFieldChange<Experience>('experience', index, 'startDate', e.target.value)} />
                                    <InputField type="month" label="End Date" value={exp.endDate} onChange={(e) => handleFieldChange<Experience>('experience', index, 'endDate', e.target.value)} error={errors[`exp_endDate_${index}`]} />
                                </div>
                                <div className="mt-4">
                                    <TextareaField label="Key Responsibilities & Achievements" value={exp.responsibilities} onChange={(e) => handleFieldChange<Experience>('experience', index, 'responsibilities', e.target.value)} error={errors[`exp_responsibilities_${index}`]} required/>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Experience>('experience', { id: Date.now().toString(), title: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Experience</button>
                    </Section>
                    
                     {/* Skills */}
                    <Section title="Skills">
                        {cvData.skills.map((skill, index) => (
                            <div key={skill.id} className="flex flex-wrap sm:flex-nowrap items-end gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4">
                                <div className="w-full sm:flex-grow">
                                    <InputField label="Skill Name" value={skill.skill} onChange={(e) => handleFieldChange<Skill>('skills', index, 'skill', e.target.value)} />
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <SelectField label="Proficiency Level" value={skill.level} onChange={(e) => handleFieldChange<Skill>('skills', index, 'level', e.target.value)} options={['Beginner', 'Intermediate', 'Advanced']} />
                                </div>
                                <button type="button" onClick={() => removeField('skills', index)} className="p-2 text-slate-400 hover:text-red-500 mb-1 sm:mb-2.5 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Skill>('skills', { id: Date.now().toString(), skill: '', level: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Skill</button>
                    </Section>

                    {/* Certifications */}
                    <Section title="Certifications / Trainings">
                        {cvData.certifications.map((cert, index) => (
                            <div key={cert.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative transition-shadow hover:shadow-md">
                                <button type="button" onClick={() => removeField('certifications', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Certification Name" value={cert.name} onChange={(e) => handleFieldChange<Certification>('certifications', index, 'name', e.target.value)} />
                                    <InputField label="Issuing Organization" value={cert.issuer} onChange={(e) => handleFieldChange<Certification>('certifications', index, 'issuer', e.target.value)} />
                                    <InputField type="date" label="Date of Completion" value={cert.date} onChange={(e) => handleFieldChange<Certification>('certifications', index, 'date', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Certification>('certifications', { id: Date.now().toString(), name: '', issuer: '', date: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Certification</button>
                    </Section>

                    {/* Projects */}
                    <Section title="Projects">
                        {cvData.projects.map((project, index) => (
                            <div key={project.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative transition-shadow hover:shadow-md">
                                <button type="button" onClick={() => removeField('projects', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                                <InputField label="Project Title" value={project.title} onChange={(e) => handleFieldChange<Project>('projects', index, 'title', e.target.value)} />
                                <TextareaField label="Description" value={project.description} onChange={(e) => handleFieldChange<Project>('projects', index, 'description', e.target.value)} className="mt-4"/>
                                <InputField label="Tools/Technologies Used" value={project.tools} onChange={(e) => handleFieldChange<Project>('projects', index, 'tools', e.target.value)} className="mt-4" />
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Project>('projects', { id: Date.now().toString(), title: '', description: '', tools: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Project</button>
                    </Section>

                    {/* Languages */}
                    <Section title="Languages">
                        {cvData.languages.map((lang, index) => (
                            <div key={lang.id} className="flex flex-wrap sm:flex-nowrap items-end gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4">
                                <div className="w-full sm:flex-grow">
                                    <InputField label="Language" value={lang.language} onChange={(e) => handleFieldChange<Language>('languages', index, 'language', e.target.value)} />
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <SelectField label="Proficiency" value={lang.proficiency} onChange={(e) => handleFieldChange<Language>('languages', index, 'proficiency', e.target.value)} options={['Basic', 'Intermediate', 'Fluent']} />
                                </div>
                                <button type="button" onClick={() => removeField('languages', index)} className="p-2 text-slate-400 hover:text-red-500 mb-1 sm:mb-2.5 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addField<Language>('languages', { id: Date.now().toString(), language: '', proficiency: '' })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"><PlusIcon /> Add Language</button>
                    </Section>

                    {/* Hobbies */}
                    <Section title="Hobbies & Interests">
                         <InputField label="Hobbies" placeholder="e.g., Coding, Reading, Football" value={cvData.hobbies} onChange={(e) => setCvData({ ...cvData, hobbies: e.target.value })} />
                    </Section>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            Preview & Generate CV
                        </button>
                    </div>
                </form>

                {isPreviewOpen && <PreviewModal data={cvData} onClose={() => setIsPreviewOpen(false)} />}
            </div>
        </div>
    );
};

export default App;