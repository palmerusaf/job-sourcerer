import { useEffect, useState, useRef } from "react";
import { listResumes } from "@/utils/db/resumes";
import { render } from "jsonresume-theme-even";
import { Button } from "@/components/ui/button";

export function ResumeDisplay() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [html, setHtml] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function fetchResumes() {
        const rows = await listResumes(); // already newest-first
        if (Array.isArray(rows) && rows.length > 0) {
            const mapped = (rows as any[]).map(r => ({ ...r.json, __label: r.name }));
            setResumes(mapped);
            setSelectedIndex(0); // newest by default
        }
    }
    fetchResumes();
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && resumes.length > 0) {
      let rendered = render(resumes[selectedIndex]);
      rendered = rendered.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
      setHtml(rendered); // Render resume in JSON data with template for display
    }
  }, [selectedIndex, resumes]);

  const getKeywords = () => {
    const resume = resumes[selectedIndex];
    const keywords: string[] = [];

    // Get keywords from keywords field if exists
    if (resume.keywords && Array.isArray(resume.keywords)) {
      keywords.push(...resume.keywords.map(k => k.value || k));
    }

    // Get skills if exists
    if (resume.skills && Array.isArray(resume.skills)) {
      keywords.push(...resume.skills.map(s => s.value || s));
    }

    // Get tools if exists
    if (resume.tools && Array.isArray(resume.tools)) {
      keywords.push(...resume.tools.map(t => t.value || t));
    }

    // Get languages if exists
    if (resume.languages && Array.isArray(resume.languages)) {
      keywords.push(...resume.languages.map(l => l.value || l));
    }

    // Get interests if exists
    if (resume.interests && Array.isArray(resume.interests)) {
      keywords.push(...resume.interests.map(i => i.value || i));
    }

    // Get publications if exists
    if (resume.publications && Array.isArray(resume.publications)) {
      resume.publications.forEach((pub: any) => {
        if (pub.field) keywords.push(pub.field);
      });
    }

    // Get organizations if exists
    if (resume.organizations && Array.isArray(resume.organizations)) {
      resume.organizations.forEach((org: any) => {
        if (org.field) keywords.push(org.field);
      });
    }

    // Get education if exists
    if (resume.education && Array.isArray(resume.education)) {
      resume.education.forEach((edu: any) => {
        if (edu.field) keywords.push(edu.field);
      });
    }

    // Get certificates if exists
    if (resume.certifications && Array.isArray(resume.certifications)) {
      resume.certifications.forEach((cert: any) => {
        if (cert.name) keywords.push(cert.name);
      });
    }

    // Get projects if exists
    if (resume.projects && Array.isArray(resume.projects)) {
      resume.projects.forEach((proj: any) => {
        if (proj.name) keywords.push(proj.name);
      });
    }

    // Get volunteer if exists
    if (resume.volunteer && Array.isArray(resume.volunteer)) {
      resume.volunteer.forEach((vol: any) => {
        if (vol.position) keywords.push(vol.position);
      });
    }

    // Get awards if exists
    if (resume.awards && Array.isArray(resume.awards)) {
      resume.awards.forEach((award: any) => {
        if (award.name) keywords.push(award.name);
      });
    }

    // Get references if exists
    if (resume.references && Array.isArray(resume.references)) {
      resume.references.forEach((ref: any) => {
        if (ref.name) keywords.push(ref.name);
      });
    }

    // Get urls if exists
    if (resume.urls && Array.isArray(resume.urls)) {
      resume.urls.forEach((url: any) => {
        if (url.name) keywords.push(url.name);
      });
    }

    // Get social if exists
    if (resume.social && Array.isArray(resume.social)) {
      resume.social.forEach((social: any) => {
        if (social.network) keywords.push(social.network);
      });
    }

    // Get contact info
    if (resume.basics) {
      if (resume.basics.email) keywords.push("Email");
      if (resume.basics.phone) keywords.push("Phone");
      if (resume.basics.url) keywords.push("Website");
      if (resume.basics.location) {
        if (resume.basics.location.city) keywords.push(resume.basics.location.city);
        if (resume.basics.location.region) keywords.push(resume.basics.location.region);
      }
    }

    // Remove duplicates and limit to 10
    return [...new Set(keywords)].slice(0, 10);
  };

  const getNameOptions = () => {
    const nameCounts: Record<string, number> = {};
    const options = resumes
      .slice() // Clone array to preserve OG order
      .reverse() // Oldest to newest
      .map((resume, i, original) => {
          const base = resume.__label || resume.basics?.name || `Resume ${original.length - i}`;
          nameCounts[base] = (nameCounts[base] || 0) + 1;
          const suffix = nameCounts[base] > 1 ? ` ${nameCounts[base]}` : "";
          return { label: base + suffix, index: original.length - 1 - i }; // Adjust back to actual index
      });
    return options;
  };

  const handleExportJSON = () => {
    const json = resumes[selectedIndex];
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const nameOptions = getNameOptions();

  return (
    <div className="w-full p-6 space-y-6 flex flex-col items-center">
      <div className="w-full max-w-screen-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Select Resume</h2>
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="border border-slate-700 rounded-md px-3 py-2 text-sm
             bg-slate-900 text-slate-100 shadow-sm
             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
             min-w-[16rem] max-w-[20rem] truncate"
        >
          {nameOptions.map(({ label, index }) => (
            <option key={index} value={index}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleExportJSON}>Export as JSON</Button>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-slate-400">Keywords:</span>
          {getKeywords().map((kw, i) => (
            <span key={i} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {html ? (
        <div className="w-[900px] border rounded-lg overflow-hidden shadow bg-white">
          <iframe
            ref={iframeRef}
            title="resume-preview"
            className="w-full h-[1100px] border-none"
            srcDoc={html}
          />
        </div>
      ) : (
        <p className="text-center mt-8">Loading resume...</p>
      )}
    </div>
  );
}
