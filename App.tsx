import React, { useState, useCallback, useMemo } from 'react';
import { CVData, PersonalInfo, Education, Experience, Skill, Certification, Project, Award, Language, Referee, Errors, CoverLetterData } from './types';
import { Section } from './components/Section';
import { InputField } from './components/InputField';
import { TextareaField } from './components/TextareaField';
import { SelectField } from './components/SelectField';
import { PreviewModal } from './components/PreviewModal';
import { PlusIcon, TrashIcon, MagicWandIcon } from './components/Icons';
import { GoogleGenAI, Type } from "@google/genai";

type DocumentSelection = {
    cv: boolean;
    applicationLetter: boolean;
    coverLetter: boolean;
};

const App: React.FC = () => {
    const [documentSelection, setDocumentSelection] = useState<DocumentSelection>({
        cv: true,
        applicationLetter: false,
        coverLetter: false,
    });

    const [cvData, setCvData] = useState<CVData>({
        personalInfo: { fullName: '', dob: '', gender: '', phone: '', email: '', address: '', linkedin: '', portfolio: '', profilePicture: '' },
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
        applicationLetter: { hiringManager: '', companyName: '', jobTitle: '', sourceOfJobAd: '', letterBody: '' },
        coverLetter: { recipientName: '', recipientDepartment: '', companyName: '', companyAddress: '', jobTitle: '', sourceOfJobAd: '', keyRequirements: '', companyValues: '', letterBody: '' },
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
    const [isSuggestingHobbies, setIsSuggestingHobbies] = useState(false);
    const [isSuggestingAppLetter, setIsSuggestingAppLetter] = useState(false);
    const [isSuggestingCoverLetter, setIsSuggestingCoverLetter] = useState(false);

    const handleDocSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setDocumentSelection(prev => ({ ...prev, [name]: checked }));
    };

    const isAnyDocumentSelected = useMemo(() => Object.values(documentSelection).some(Boolean), [documentSelection]);

    const validate = useCallback(() => {
        const newErrors: Errors = {};
        const { personalInfo, careerObjective, education, experience, applicationLetter, coverLetter } = cvData;

        if (documentSelection.cv || documentSelection.applicationLetter || documentSelection.coverLetter) {
            if (!personalInfo.fullName) newErrors.fullName = 'Full Name is required.';
            if (!personalInfo.email) {
                newErrors.email = 'Email is required.';
            } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
                newErrors.email = 'Email is invalid.';
            }
            if (!personalInfo.phone) {
                newErrors.phone = 'Contact Number is required.';
            }
        }
        
        if (documentSelection.cv) {
            if (!careerObjective) newErrors.careerObjective = 'Career Objective is required.';
            if (education.length === 0) newErrors.education = 'At least one education entry is required.';
            if (experience.length === 0) newErrors.experience = 'At least one work experience is required.';
        }

        if (documentSelection.applicationLetter) {
            if (!applicationLetter.jobTitle) newErrors.appLetterJobTitle = "Job Title is required for the application letter.";
            if (!applicationLetter.companyName) newErrors.appLetterCompanyName = "Company Name is required for the application letter.";
        }

        if (documentSelection.coverLetter) {
            if (!coverLetter.jobTitle) newErrors.coverLetterJobTitle = "Job Title is required for the cover letter.";
            if (!coverLetter.companyName) newErrors.coverLetterCompanyName = "Company Name is required for the cover letter.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [cvData, documentSelection]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAnyDocumentSelected) {
            alert("Please select at least one document type to generate.");
            return;
        }
        if (validate()) {
            setIsPreviewOpen(true);
        }
    };

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
             if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (!['image/png', 'image/jpeg'].includes(file.type)) {
                    alert('Please upload a PNG or JPG image.'); return;
                }
                if (file.size > 2 * 1024 * 1024) { 
                    alert('Image size should be less than 2MB.'); return;
                }
                const reader = new FileReader();
                reader.onload = (event) => setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, profilePicture: event.target?.result as string } }));
                reader.readAsDataURL(file);
            }
        } else {
            setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
        }
    };

    const handleApplicationLetterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData(prev => ({ ...prev, applicationLetter: { ...prev.applicationLetter, [name]: value } }));
    };
    
    const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData(prev => ({ ...prev, coverLetter: { ...prev.coverLetter, [name]: value } }));
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

    const handleSuggestSkills = async () => {
        setIsSuggestingSkills(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const relevantInfo = `
                Career Objective: ${cvData.careerObjective}
                Experience: ${cvData.experience.map(exp => `Title: ${exp.title}, Responsibilities: ${exp.responsibilities}`).join('; ')}
            `;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on the following CV details, suggest 10 relevant hard and soft skills. ${relevantInfo}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { skills: { type: Type.ARRAY, items: { type: Type.STRING } } } }
                }
            });
            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.skills && Array.isArray(jsonResponse.skills)) {
                jsonResponse.skills.forEach((skill: string) => {
                    if (!cvData.skills.some(s => s.skill.toLowerCase() === skill.toLowerCase())) {
                        addField<Skill>('skills', { id: Date.now().toString() + skill, skill: skill, level: 'Intermediate' });
                    }
                });
            }
        } catch (error) { console.error("Error suggesting skills:", error); alert("Could not suggest skills.");
        } finally { setIsSuggestingSkills(false); }
    };
    
    const handleSuggestHobbies = async () => {
        setIsSuggestingHobbies(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on a professional profile with job titles like ${cvData.experience.map(exp => exp.title).join(', ')}, suggest some interesting hobbies. Return as a comma-separated list.`,
            });
            setCvData(prev => ({ ...prev, hobbies: response.text }));
        } catch (error) { console.error("Error suggesting hobbies:", error); alert("Could not suggest hobbies.");
        } finally { setIsSuggestingHobbies(false); }
    };

    const handleSuggestAppLetterBody = async () => {
        const { applicationLetter } = cvData;
        if (!applicationLetter.jobTitle || !applicationLetter.companyName) {
            alert("Please provide the Job Title and Company Name.");
            return;
        }
        setIsSuggestingAppLetter(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const prompt = `Draft a concise 3-paragraph application letter body for a "${applicationLetter.jobTitle}" position at "${applicationLetter.companyName}".
            Candidate's CV Info:
            - Career Objective: ${cvData.careerObjective}
            - Most Recent Job: ${cvData.experience[0]?.title || 'Not specified'}
            - Key Skills: ${cvData.skills.map(s => s.skill).join(', ') || 'Not specified'}
            - I found this job posting on: ${applicationLetter.sourceOfJobAd || 'your company website'}.

            Instructions:
            1.  In the first paragraph, state the position you're applying for and mention where you saw the advertisement (${applicationLetter.sourceOfJobAd || 'your company website'}).
            2.  In the second paragraph, briefly highlight 1-2 key skills or experiences that make you a strong candidate.
            3.  In the third paragraph, reiterate your interest in the role and the company, and state your availability for an interview.
            Generate only the body text of the letter. Do not include salutations or closings.`;
            const response = await ai.models.generateContent({ model: "gemini-2.5-pro", contents: prompt });
            setCvData(prev => ({ ...prev, applicationLetter: { ...prev.applicationLetter, letterBody: response.text } }));
        } catch (error) { console.error("Error suggesting letter body:", error); alert("Could not generate the letter body.");
        } finally { setIsSuggestingAppLetter(false); }
    };

     const handleSuggestCoverLetterBody = async () => {
        const { coverLetter, experience, skills } = cvData;
        if (!coverLetter.jobTitle || !coverLetter.companyName) {
            alert("Please provide the Job Title and Company Name to generate a cover letter.");
            return;
        }
        setIsSuggestingCoverLetter(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const prompt = `
                Generate a professional and compelling cover letter body. This is for the "${coverLetter.jobTitle}" position at "${coverLetter.companyName}".

                **Candidate's Background:**
                - Most Recent Role: "${experience[0]?.title}" at ${experience[0]?.company}. Responsibilities included: ${experience[0]?.responsibilities}
                - Key Skills: ${skills.map(s => s.skill).join(', ')}

                **Job & Company Context:**
                - Job was advertised on: ${coverLetter.sourceOfJobAd || 'the company website'}.
                - Key requirements from the job description: "${coverLetter.keyRequirements || 'No specific requirements provided. Focus on general skills.'}"
                - Company values/mission: "${coverLetter.companyValues || 'No specific values provided. Assume a focus on innovation and teamwork.'}"

                **Instructions for the AI:**
                Draft a 3-4 paragraph letter body.
                1.  **Introduction:** Start by stating the position being applied for and mention where you saw it (${coverLetter.sourceOfJobAd || 'the company website'}). Express genuine enthusiasm for the opportunity.
                2.  **Body Paragraph 1:** Directly address the provided "Key requirements". Connect your most recent experience ("${experience[0]?.title}") and its responsibilities to these requirements. Provide a specific example or achievement that demonstrates your capability.
                3.  **Body Paragraph 2:** Highlight how your key skills align with the role. If company values are provided, connect your personal work ethic or motivation to these values ("${coverLetter.companyValues}"). This shows you are a good cultural fit.
                4.  **Conclusion:** Reiterate your strong interest in contributing to ${coverLetter.companyName}. End with a clear call to action, expressing your eagerness for an interview.

                **Important:** Generate ONLY the body text. Do not include the sender's address, date, recipient's address, salutation (e.g., "Dear..."), or closing (e.g., "Sincerely,").
            `;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
            });
            setCvData(prev => ({ ...prev, coverLetter: { ...prev.coverLetter, letterBody: response.text } }));
        } catch (error) {
            console.error("Error suggesting cover letter body:", error);
            alert("Could not generate the cover letter body at this moment.");
        } finally {
            setIsSuggestingCoverLetter(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Document Builder</h1>
                    <p className="text-slate-600 mt-3 text-lg">Select the documents you need and fill in the details.</p>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    <Section title="1. Select Your Documents">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.keys(documentSelection).map(key => (
                                <label key={key} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${documentSelection[key as keyof DocumentSelection] ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-white'}`}>
                                    <input type="checkbox" name={key} checked={documentSelection[key as keyof DocumentSelection]} onChange={handleDocSelectionChange} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                    <span className="ml-3 font-semibold text-slate-800">{key === 'cv' ? 'CV / Resume' : key === 'applicationLetter' ? 'Application Letter' : 'Cover Letter'}</span>
                                </label>
                            ))}
                        </div>
                    </Section>

                    {isAnyDocumentSelected && (
                        <>
                            <Section title="2. Personal Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Full Name" name="fullName" value={cvData.personalInfo.fullName} onChange={handlePersonalInfoChange} error={errors.fullName} required />
                                    <InputField type="date" label="Date of Birth" name="dob" value={cvData.personalInfo.dob} onChange={handlePersonalInfoChange} />
                                    <SelectField label="Gender" name="gender" value={cvData.personalInfo.gender} onChange={handlePersonalInfoChange} options={['Male', 'Female', 'Other']} />
                                    <InputField type="tel" label="Contact Number" name="phone" value={cvData.personalInfo.phone} onChange={handlePersonalInfoChange} error={errors.phone} required />
                                    <InputField type="email" label="Email Address" name="email" value={cvData.personalInfo.email} onChange={handlePersonalInfoChange} error={errors.email} required />
                                    <InputField label="Home Address" name="address" value={cvData.personalInfo.address} onChange={handlePersonalInfoChange} />
                                    <InputField type="url" label="LinkedIn Profile" name="linkedin" value={cvData.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
                                    <InputField type="url" label="Portfolio/Website" name="portfolio" value={cvData.personalInfo.portfolio} onChange={handlePersonalInfoChange} />
                                    {documentSelection.cv && <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Profile Picture</label>
                                        <div className="mt-1 flex items-center gap-4">
                                            {cvData.personalInfo.profilePicture ? <img src={cvData.personalInfo.profilePicture} alt="Profile" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400"><svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>}
                                            <input type="file" name="profilePicture" id="profilePicture" accept="image/png, image/jpeg" onChange={handlePersonalInfoChange} className="hidden" />
                                            <label htmlFor="profilePicture" className="cursor-pointer bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Upload</label>
                                            {cvData.personalInfo.profilePicture && <button type="button" onClick={() => setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, profilePicture: ''}}))} className="text-sm text-red-600 hover:text-red-800">Remove</button>}
                                        </div>
                                    </div>}
                                </div>
                            </Section>

                            {documentSelection.cv && <>
                                <Section title="Career Objective / Personal Statement"><TextareaField label="Career Objective" name="careerObjective" value={cvData.careerObjective} onChange={(e) => setCvData({ ...cvData, careerObjective: e.target.value })} maxLength={300} error={errors.careerObjective} required /></Section>
                                <Section title="Education Background" error={errors.education}>{cvData.education.map((edu, index) => <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative"><button type="button" onClick={() => removeField('education', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full"><TrashIcon /></button><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Institution" value={edu.institution} onChange={(e) => handleFieldChange<Education>('education', index, 'institution', e.target.value)} required/><InputField label="Degree" value={edu.degree} onChange={(e) => handleFieldChange<Education>('education', index, 'degree', e.target.value)} required/><InputField label="Field of Study" value={edu.field} onChange={(e) => handleFieldChange<Education>('education', index, 'field', e.target.value)} /><InputField type="month" label="Start Date" value={edu.startDate} onChange={(e) => handleFieldChange<Education>('education', index, 'startDate', e.target.value)} /><InputField type="month" label="End Date" value={edu.endDate} onChange={(e) => handleFieldChange<Education>('education', index, 'endDate', e.target.value)} /><InputField label="Grade/CGPA" value={edu.grade} onChange={(e) => handleFieldChange<Education>('education', index, 'grade', e.target.value)} /></div></div>)}<button type="button" onClick={() => addField<Education>('education', { id: Date.now().toString(), institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' })} className="flex items-center gap-2 text-indigo-600 font-semibold"><PlusIcon /> Add Education</button></Section>
                                <Section title="Work Experience / Internship" error={errors.experience}>{cvData.experience.map((exp, index) => <div key={exp.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 mb-4 relative"><button type="button" onClick={() => removeField('experience', index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-full"><TrashIcon /></button><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Job Title" value={exp.title} onChange={(e) => handleFieldChange<Experience>('experience', index, 'title', e.target.value)} required /><InputField label="Company Name" value={exp.company} onChange={(e) => handleFieldChange<Experience>('experience', index, 'company', e.target.value)} required/><InputField label="Location" value={exp.location} onChange={(e) => handleFieldChange<Experience>('experience', index, 'location', e.target.value)} /><InputField type="month" label="Start Date" value={exp.startDate} onChange={(e) => handleFieldChange<Experience>('experience', index, 'startDate', e.target.value)} /><InputField type="month" label="End Date" value={exp.endDate} onChange={(e) => handleFieldChange<Experience>('experience', index, 'endDate', e.target.value)} /></div><div className="mt-4"><TextareaField label="Key Responsibilities" value={exp.responsibilities} onChange={(e) => handleFieldChange<Experience>('experience', index, 'responsibilities', e.target.value)} required/></div></div>)}<button type="button" onClick={() => addField<Experience>('experience', { id: Date.now().toString(), title: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' })} className="flex items-center gap-2 text-indigo-600 font-semibold"><PlusIcon /> Add Experience</button></Section>
                                <Section title="Skills"><div className="flex justify-end mb-4"><button type="button" onClick={handleSuggestSkills} disabled={isSuggestingSkills} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-200 disabled:bg-slate-200 disabled:cursor-wait"><MagicWandIcon />{isSuggestingSkills ? 'Analyzing...' : 'Suggest Skills with AI'}</button></div>{cvData.skills.map((skill, index) => <div key={skill.id} className="flex items-end gap-4 p-4 border rounded-lg bg-slate-50 mb-4"><div className="flex-grow"><InputField label="Skill" value={skill.skill} onChange={(e) => handleFieldChange<Skill>('skills', index, 'skill', e.target.value)} /></div><div className="w-1/3"><SelectField label="Level" value={skill.level} onChange={(e) => handleFieldChange<Skill>('skills', index, 'level', e.target.value)} options={['Beginner', 'Intermediate', 'Advanced']} /></div><button type="button" onClick={() => removeField('skills', index)} className="p-2 text-slate-400 hover:text-red-500 rounded-full"><TrashIcon /></button></div>)}<button type="button" onClick={() => addField<Skill>('skills', { id: Date.now().toString(), skill: '', level: '' })} className="flex items-center gap-2 text-indigo-600 font-semibold"><PlusIcon /> Add Skill</button></Section>
                                <Section title="Hobbies & Interests"><div className="flex items-end gap-4"><InputField label="Hobbies" placeholder="e.g., Coding, Reading" value={cvData.hobbies} onChange={(e) => setCvData({ ...cvData, hobbies: e.target.value })} className="flex-grow"/><button type="button" onClick={handleSuggestHobbies} disabled={isSuggestingHobbies} className="flex-shrink-0 flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-200 disabled:bg-slate-200 disabled:cursor-wait"><MagicWandIcon />{isSuggestingHobbies ? 'Thinking...' : 'Suggest'}</button></div></Section>
                            </>}
                            
                            {documentSelection.applicationLetter && <Section title="Application Letter Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Job Title" name="jobTitle" value={cvData.applicationLetter.jobTitle} onChange={handleApplicationLetterChange} error={errors.appLetterJobTitle} required />
                                    <InputField label="Company Name" name="companyName" value={cvData.applicationLetter.companyName} onChange={handleApplicationLetterChange} error={errors.appLetterCompanyName} required />
                                    <InputField label="Hiring Manager's Name (Optional)" name="hiringManager" value={cvData.applicationLetter.hiringManager} onChange={handleApplicationLetterChange} />
                                    <InputField label="Where did you see this job?" name="sourceOfJobAd" value={cvData.applicationLetter.sourceOfJobAd} onChange={handleApplicationLetterChange} placeholder="e.g., LinkedIn, Company Website"/>
                                </div>
                                <div className="mt-6"><div className="flex justify-between items-center mb-1.5"><label className="block text-sm font-medium">Letter Body</label><button type="button" onClick={handleSuggestAppLetterBody} disabled={isSuggestingAppLetter} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-200 disabled:bg-slate-200 disabled:cursor-wait"><MagicWandIcon />{isSuggestingAppLetter ? 'Drafting...' : 'Draft with AI'}</button></div><TextareaField label="" name="letterBody" value={cvData.applicationLetter.letterBody} onChange={handleApplicationLetterChange} /></div>
                            </Section>}

                            {documentSelection.coverLetter && <Section title="Cover Letter Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Job Title" name="jobTitle" value={cvData.coverLetter.jobTitle} onChange={handleCoverLetterChange} error={errors.coverLetterJobTitle} required />
                                    <InputField label="Company Name" name="companyName" value={cvData.coverLetter.companyName} onChange={handleCoverLetterChange} error={errors.coverLetterCompanyName} required/>
                                    <InputField label="Recipient Name (Optional)" name="recipientName" value={cvData.coverLetter.recipientName} onChange={handleCoverLetterChange} placeholder="e.g., Mr. John Doe" />
                                    <InputField label="Recipient Department (Optional)" name="recipientDepartment" value={cvData.coverLetter.recipientDepartment} onChange={handleCoverLetterChange} placeholder="e.g., Human Resources" />
                                     <InputField label="Where did you see this job?" name="sourceOfJobAd" value={cvData.coverLetter.sourceOfJobAd} onChange={handleCoverLetterChange} placeholder="e.g., LinkedIn, Company Website"/>
                                    <InputField label="Company Address (Optional)" name="companyAddress" value={cvData.coverLetter.companyAddress} onChange={handleCoverLetterChange} />
                                    <div className="md:col-span-2">
                                        <TextareaField label="Key Requirements from Job Description" name="keyRequirements" value={cvData.coverLetter.keyRequirements} onChange={handleCoverLetterChange} placeholder="Copy & paste 2-3 key requirements from the job ad." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <TextareaField label="Company Values / Mission (Optional)" name="companyValues" value={cvData.coverLetter.companyValues} onChange={handleCoverLetterChange} placeholder="e.g., Innovation, Customer Focus, Sustainability." />
                                    </div>
                                </div>
                                <div className="mt-6"><div className="flex justify-between items-center mb-1.5"><label className="block text-sm font-medium">Letter Body</label><button type="button" onClick={handleSuggestCoverLetterBody} disabled={isSuggestingCoverLetter} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-200 disabled:bg-slate-200 disabled:cursor-wait"><MagicWandIcon />{isSuggestingCoverLetter ? 'Drafting...' : 'Draft with AI'}</button></div><TextareaField label="" name="letterBody" value={cvData.coverLetter.letterBody} onChange={handleCoverLetterChange} /></div>
                            </Section>}

                            <div className="flex justify-center pt-8">
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={!isAnyDocumentSelected}>
                                    Preview & Generate Documents
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {isPreviewOpen && <PreviewModal data={cvData} selection={documentSelection} onClose={() => setIsPreviewOpen(false)} />}
            </div>
        </div>
    );
};

export default App;