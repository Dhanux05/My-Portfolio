"use client";

import { config as defaultConfig } from "@/data/config";
import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const greetingKannada = "\u0ca8\u0cae\u0cb8\u0ccd\u0c95\u0cbe\u0cb0!";
const nameKannada =
  "\u0ca7\u0ca8\u0cc1\u0cb7\u0ccd \u0c95\u0cc1\u0cae\u0cbe\u0cb0\u0ccd";
const heroRoles = [
  "Web Enthusiast",
  "Frontend Developer",
  "UI/UX Designer",
  "Full Stack Developer",
];

const HeroSection = () => {
  const { isLoading } = usePreloader();
  const [resumeLink, setResumeLink] = useState(defaultConfig.resume);
  const [roleIndex, setRoleIndex] = useState(0);
  const [typedRole, setTypedRole] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const cachedResume = localStorage.getItem("resumeLink");
    if (cachedResume) {
      setResumeLink(cachedResume);
    }

    fetch("/api/admin/resume")
      .then((res) => res.json())
      .then((data) => {
        if (data.resume) {
          setResumeLink(data.resume);
          localStorage.setItem("resumeLink", data.resume);
        }
      })
      .catch((error) => {
        console.error("Error fetching resume link:", error);
      });
  }, []);

  useEffect(() => {
    const currentRole = heroRoles[roleIndex];
    const isTypingDone = typedRole === currentRole;
    const isDeletingDone = typedRole === "";

    const timeout = setTimeout(
      () => {
        if (!isDeleting && !isTypingDone) {
          setTypedRole(currentRole.slice(0, typedRole.length + 1));
          return;
        }

        if (!isDeleting && isTypingDone) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !isDeletingDone) {
          setTypedRole(currentRole.slice(0, typedRole.length - 1));
          return;
        }

        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % heroRoles.length);
      },
      !isDeleting && isTypingDone ? 1400 : isDeleting ? 55 : 100
    );

    return () => clearTimeout(timeout);
  }, [isDeleting, roleIndex, typedRole]);

  return (
    <section id="hero" className="relative h-screen w-full">
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            "z-[2] col-span-1 h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)]",
            "flex flex-col items-center justify-start md:items-start md:justify-center",
            "pt-24 sm:pb-32 sm:pt-0 md:p-24 lg:p-40 xl:p-48"
          )}
        >
          {!isLoading && (
            <>
              <div className="w-full max-w-3xl">
                <BlurIn delay={0.7}>
                  <p className="ml-1 text-sm font-medium tracking-[0.28em] text-slate-700 md:text-base dark:text-slate-200 dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]">
                    Hii ({greetingKannada})
                  </p>
                </BlurIn>

                <BlurIn delay={1}>
                  <div className="mt-4 flex flex-col items-center gap-5 md:items-start">
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="text-center md:text-left">
                          <p className="text-base font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-slate-100 dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]">
                            I&apos;m
                          </p>
                          <h1 className="mt-2 whitespace-nowrap text-3xl font-semibold leading-none sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.75rem]">
                            <span className="text-slate-900 dark:hidden">
                              Dhanush Kumar R
                            </span>
                            <span className="hidden dark:inline gradient-text hero-name-gradient">
                              Dhanush Kumar R
                            </span>
                          </h1>
                          <div className="mt-5 inline-flex rounded-full border border-amber-500/40 bg-white/80 px-5 py-2 text-sm font-medium tracking-[0.12em] text-slate-800 shadow-[0_0_24px_rgba(251,191,36,0.12)] backdrop-blur dark:border-amber-400/40 dark:bg-slate-950/50 dark:text-amber-100 dark:shadow-[0_0_30px_rgba(251,191,36,0.18)] md:text-base">
                            {nameKannada}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="dark:bg-white dark:text-black"
                      >
                        there&apos;s something waiting for you in devtools
                      </TooltipContent>
                    </Tooltip>
                    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300/35 via-sky-200/15 to-amber-200/25 blur-2xl dark:from-sky-300/30 dark:via-indigo-300/10 dark:to-amber-200/20" />
                      <Image
                        src="/assets/7.png"
                        alt="Dhanush Kumar R profile photo"
                        width={160}
                        height={160}
                        className="relative h-full w-full rounded-full border-4 border-slate-400/60 object-cover shadow-2xl dark:border-slate-700/80"
                        priority
                      />
                    </div>
                  </div>
                </BlurIn>

                <BlurIn delay={1.2}>
                  <div className="ml-1 mt-5 min-h-[2rem] text-sm font-light tracking-[0.2em] text-slate-700 md:text-base dark:text-zinc-300">
                    <span className="inline-flex items-center">
                      {typedRole}
                      <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-amber-500 align-middle dark:bg-amber-200" />
                    </span>
                  </div>
                </BlurIn>
              </div>

              <div className="mt-8 flex flex-col gap-3 md:ml-1">
                <Link href={resumeLink} target="_blank" className="flex-1">
                  <BoxReveal delay={2} width="100%">
                    <Button className="flex w-full items-center gap-2">
                      <File size={24} />
                      <p>Resume</p>
                    </Button>
                  </BoxReveal>
                </Link>
                <div className="flex gap-3 md:self-start">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href="#contact">
                        <Button
                          variant="outline"
                          className="block w-full overflow-hidden"
                        >
                          Hire Me
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>pls</p>
                    </TooltipContent>
                  </Tooltip>
                  <Link href={defaultConfig.social.github} target="_blank">
                    <Button variant="outline">
                      <SiGithub size={24} />
                    </Button>
                  </Link>
                  <Link href={defaultConfig.social.linkedin} target="_blank">
                    <Button variant="outline">
                      <SiLinkedin size={24} />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="col-span-1 grid" />
      </div>
      <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
        <ScrollDownIcon />
      </div>
    </section>
  );
};

export default HeroSection;
