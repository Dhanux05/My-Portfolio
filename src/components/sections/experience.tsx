"use client";

import Link from "next/link";
import React from "react";
import { BarChart3, BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/utils";

type ExperienceItem = {
  period: string;
  role: string;
  focus: string;
  highlights: string[];
  icon: React.ReactNode;
};

const experienceItems: ExperienceItem[] = [
  {
    period: "Nov 2023",
    role: "Data Analytics Micro Intern",
    focus: "IBM SkillsBuild CSRBOX",
    highlights: [
      "Analyzed large datasets to derive actionable insights.",
      "Created data dashboards using Excel and Power BI.",
      "Applied data mining and statistical modeling to solve business challenges.",
    ],
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    period: "2024 - 2025",
    role: "MERN Stack Web Development Trainee",
    focus: "Next Gen Employability Program",
    highlights: [
      "Built scalable full-stack applications using MongoDB, Express.js, React.js, and Node.js.",
      "Improved debugging and problem-solving skills through hands-on projects.",
    ],
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
];

const ExperienceSection = () => {
  return (
    <section id="experience" className="max-w-7xl mx-auto relative z-[2] px-4 py-20 md:py-28">
      <Link href={"#experience"}>
        <h2
          className={cn(
            "text-4xl text-center md:text-7xl mb-4 font-extrabold tracking-wide",
            "text-white drop-shadow-[0_6px_24px_rgba(255,255,255,0.45)]"
          )}
        >
          EXPERIENCE
        </h2>
      </Link>
      <p className="max-w-3xl mx-auto text-center text-sm md:text-base text-white/90 mb-10 md:mb-14">
        Professional and training experience in data analytics and full-stack web development.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {experienceItems.map((item) => (
          <article
            key={item.role}
            className={cn(
              "group rounded-2xl p-[1px] bg-gradient-to-br from-cyan-300/80 via-sky-200/70 to-emerald-200/70 dark:from-cyan-300/60 dark:via-blue-300/40 dark:to-emerald-300/40",
              "transition-transform duration-300 hover:-translate-y-1"
            )}
          >
            <div className="h-full rounded-2xl bg-white/92 dark:bg-zinc-950/75 backdrop-blur-md p-6 border border-white/70 dark:border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-zinc-900 dark:text-cyan-100">
                  {item.icon}
                  {item.period}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">{item.role}</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-1 mb-4">{item.focus}</p>
              <ul className="space-y-2 text-sm text-zinc-800 dark:text-zinc-100">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="leading-relaxed">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
