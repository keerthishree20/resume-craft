import type { GeneratedResume } from "@/lib/types";
import { Mail, Phone, MapPin, Link2, Globe } from "lucide-react";
import EditableText from "@/components/EditableText";

interface Props {
  resume: GeneratedResume;
  editMode?: boolean;
  onUpdate?: (updater: (r: GeneratedResume) => GeneratedResume) => void;
}

export default function ClassicTemplate({ resume, editMode, onUpdate }: Props) {
  function E({ value, onChange, className, multiline, tag }: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
    multiline?: boolean;
    tag?: "h1" | "h2" | "h3" | "p" | "span" | "li";
  }) {
    if (!editMode || !onUpdate) {
      const Tag = tag || "span";
      return <Tag className={className}>{value}</Tag>;
    }
    return <EditableText value={value} onChange={onChange} className={className} multiline={multiline} tag={tag} />;
  }

  return (
    <div className="bg-white text-black p-8 md:p-12 max-w-[210mm] mx-auto">
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <E
          value={resume.name}
          onChange={(v) => onUpdate?.((r) => ({ ...r, name: v }))}
          className="text-3xl font-bold text-gray-900 block"
          tag="h1"
        />
        <E
          value={resume.title}
          onChange={(v) => onUpdate?.((r) => ({ ...r, title: v }))}
          className="text-lg text-indigo-700 font-medium mt-1 block"
          tag="p"
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
          {resume.contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {resume.contact.email}
            </span>
          )}
          {resume.contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {resume.contact.phone}
            </span>
          )}
          {resume.contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {resume.contact.location}
            </span>
          )}
          {resume.contact.linkedin && (
            <span className="flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              {resume.contact.linkedin}
            </span>
          )}
          {resume.contact.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {resume.contact.portfolio}
            </span>
          )}
        </div>
      </header>

      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
            Professional Summary
          </h2>
          <E
            value={resume.summary}
            onChange={(v) => onUpdate?.((r) => ({ ...r, summary: v }))}
            className="text-sm text-gray-700 leading-relaxed"
            multiline
            tag="p"
          />
        </section>
      )}

      {resume.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <E
                    value={exp.role}
                    onChange={(v) =>
                      onUpdate?.((r) => {
                        const e = [...r.experience];
                        e[i] = { ...e[i], role: v };
                        return { ...r, experience: e };
                      })
                    }
                    className="font-semibold text-gray-900"
                    tag="h3"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {exp.duration}
                  </span>
                </div>
                <p className="text-sm text-indigo-700">{exp.company}</p>
                <ul className="mt-1.5 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <E
                      key={j}
                      value={bullet}
                      onChange={(v) =>
                        onUpdate?.((r) => {
                          const e = [...r.experience];
                          const bullets = [...e[i].bullets];
                          bullets[j] = v;
                          e[i] = { ...e[i], bullets };
                          return { ...r, experience: e };
                        })
                      }
                      className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400"
                      tag="li"
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2">
                  <E
                    value={proj.name}
                    onChange={(v) =>
                      onUpdate?.((r) => {
                        const p = [...r.projects];
                        p[i] = { ...p[i], name: v };
                        return { ...r, projects: p };
                      })
                    }
                    className="font-semibold text-gray-900"
                    tag="h3"
                  />
                  <span className="text-xs text-gray-500">{proj.techStack}</span>
                </div>
                <E
                  value={proj.description}
                  onChange={(v) =>
                    onUpdate?.((r) => {
                      const p = [...r.projects];
                      p[i] = { ...p[i], description: v };
                      return { ...r, projects: p };
                    })
                  }
                  className="text-sm text-gray-700 mt-0.5"
                  tag="p"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">
                    {edu.institution}
                    {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {edu.duration}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {editMode && (
        <div className="mt-4 pt-3 border-t border-dashed border-yellow-300 text-center print:hidden">
          <p className="text-xs text-yellow-600">
            Click any text to edit — changes are reflected in real-time
          </p>
        </div>
      )}
    </div>
  );
}
