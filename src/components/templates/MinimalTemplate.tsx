import type { GeneratedResume } from "@/lib/types";

interface Props {
  resume: GeneratedResume;
  editMode?: boolean;
  onUpdate?: (updater: (r: GeneratedResume) => GeneratedResume) => void;
}

export default function MinimalTemplate({ resume }: Props) {
  return (
    <div className="bg-white text-black p-8 md:p-14 max-w-[210mm] mx-auto font-[Georgia,serif]">
      <header className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-normal tracking-wide text-gray-900 mb-1">
          {resume.name}
        </h1>
        <p className="text-base text-gray-500 italic mb-4">{resume.title}</p>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          {[
            resume.contact.email,
            resume.contact.phone,
            resume.contact.location,
            resume.contact.linkedin,
            resume.contact.portfolio,
          ]
            .filter(Boolean)
            .map((item, i, arr) => (
              <span key={i}>
                {item}
                {i < arr.length - 1 && (
                  <span className="ml-3 text-gray-300">|</span>
                )}
              </span>
            ))}
        </div>
      </header>

      {resume.summary && (
        <section className="mb-7">
          <p className="text-sm text-gray-600 leading-relaxed text-center max-w-2xl mx-auto italic">
            {resume.summary}
          </p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 text-center">
            Experience
          </h2>
          <div className="space-y-5">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 font-sans">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-gray-500">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4 font-sans">
                    {exp.duration}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-600 pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-gray-300"
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
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 text-center">
            Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 font-sans">
                    {proj.name}
                  </h3>
                  <span className="text-xs text-gray-400 font-sans">
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

      {resume.education.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 text-center">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 font-sans">
                    {edu.degree}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {edu.institution}
                    {edu.gpa ? ` · ${edu.gpa}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4 font-sans">
                  {edu.duration}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3 text-center">
            Skills
          </h2>
          <p className="text-sm text-gray-600 text-center">
            {resume.skills.join(" · ")}
          </p>
        </section>
      )}
    </div>
  );
}
