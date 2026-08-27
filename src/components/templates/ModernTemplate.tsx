import type { GeneratedResume } from "@/lib/types";
import { Mail, Phone, MapPin, Link2, Globe } from "lucide-react";

interface Props {
  resume: GeneratedResume;
  editMode?: boolean;
  onUpdate?: (updater: (r: GeneratedResume) => GeneratedResume) => void;
}

export default function ModernTemplate({ resume }: Props) {
  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex min-h-[280mm]">
      <aside className="w-[35%] bg-slate-800 text-white p-6 print:bg-slate-800 print:text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold mb-4">
            {resume.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <h1 className="text-xl font-bold">{resume.name}</h1>
          <p className="text-indigo-300 text-sm font-medium mt-1">
            {resume.title}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
            Contact
          </h2>
          <div className="space-y-2 text-sm text-slate-300">
            {resume.contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span className="break-all">{resume.contact.email}</span>
              </div>
            )}
            {resume.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{resume.contact.phone}</span>
              </div>
            )}
            {resume.contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{resume.contact.location}</span>
              </div>
            )}
            {resume.contact.linkedin && (
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="break-all">{resume.contact.linkedin}</span>
              </div>
            )}
            {resume.contact.portfolio && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="break-all">{resume.contact.portfolio}</span>
              </div>
            )}
          </div>
        </div>

        {resume.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-700 text-slate-200 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {resume.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-sm">{edu.degree}</h3>
                  <p className="text-xs text-slate-300">{edu.institution}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {edu.duration}
                    {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 p-8">
        {resume.summary && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b-2 border-indigo-500 pb-1 inline-block">
              About Me
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {resume.summary}
            </p>
          </section>
        )}

        {resume.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b-2 border-indigo-500 pb-1 inline-block">
              Experience
            </h2>
            <div className="space-y-5 mt-2">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-600 font-medium">
                    {exp.company}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li
                        key={j}
                        className="text-sm text-gray-600 pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-indigo-400 before:text-xs"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b-2 border-indigo-500 pb-1 inline-block">
              Projects
            </h2>
            <div className="space-y-3 mt-2">
              {resume.projects.map((proj, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {proj.name}
                    </h3>
                    <span className="text-xs text-indigo-500">
                      {proj.techStack}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
