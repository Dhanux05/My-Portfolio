"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// @ts-ignore
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";

import "@splidejs/react-splide/css";

const PROJECTS = [
  {
    id: 1,
    name: "SmartGlass",
    description: `SmartGlass is an innovative hardware and software integration project that combines 
            smart technology with wearable devices. This project demonstrates advanced IoT concepts 
            and embedded systems programming, showcasing skills in hardware-software integration.`,
    link: "https://github.com/Dhanux05/smartglass",
    images: [
      "/assets/projects-screenshots/smartglass/1.png",
    ],
  },
  {
    id: 2,
    name: "AI Voice Bank",
    description: `AI Voice Bank is an advanced voice technology project that leverages artificial 
            intelligence to process, analyze, and generate voice content. This project showcases 
            integration of AI technologies with voice processing capabilities, demonstrating 
            expertise in modern AI applications and voice recognition systems.`,
    link: "https://github.com/Dhanux05/Ai-Voice-Bank",
    images: [
      "/assets/projects-screenshots/aivoicebank/1.png",
    ],
  },
  {
    id: 3,
    name: "Real Meta Museum",
    description: `Real Meta Museum is an immersive virtual reality experience that brings museum 
            exhibitions into the metaverse. This innovative project combines cutting-edge web 
            technologies with virtual reality to create an engaging and accessible way to explore 
            art and history in a fully interactive 3D environment.`,
    link: "https://github.com/Dhanux05/real-meta-museum",
    images: [
      "/assets/projects-screenshots/realmetamuseum/1.png",
    ],
  },
  {
    id: 4,
    name: "Delusion AI",
    description: `Delusion AI is an advanced artificial intelligence project built with TypeScript, 
            showcasing cutting-edge AI capabilities and intelligent solutions. This project 
            demonstrates expertise in AI development, machine learning integration, and modern 
            web technologies to create powerful AI-driven applications.`,
    link: "https://github.com/Dhanux05/Delusion-AI",
    images: [
      "/assets/projects-screenshots/delusionai/1.png",
    ],
  },
];
function Page() {
  return (
    <>
      <div className="container mx-auto px-4 md:px-[50px] xl:px-[150px] text-zinc-300 h-full">
        <h1 className="text-3xl md:text-4xl mt-[100px] mb-[50px] px-4 md:px-0">Projects</h1>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 justify-items-center md:place-content-around">
          {PROJECTS.map((project) => (
            <li
              className="w-full max-w-[300px] md:w-[300px] h-auto min-h-[400px] border-[.5px] rounded-md border-zinc-600"
              key={project.id}
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div className="h-[200px]">
                <Splide
                  options={{
                    type: "loop",
                    interval: 3000,
                    autoplay: true,
                    speed: 2000,
                    perMove: 1,
                    rewind: true,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                    arrows: false,
                  }}
                  aria-label="My Favorite Images"
                >
                  {project.images.map((image) => (
                    <SplideSlide key={image}>
                      <Image
                        src={image}
                        alt={`screenshot of "${project.name}`}
                        className="w-full h-[200px] rounded-md bg-zinc-900 object-cover"
                        width={300}
                        height={200}
                      />
                    </SplideSlide>
                  ))}
                </Splide>
              </div>
              <div className="p-4 text-zinc-300">
                <h2 className="text-xl">{project.name}</h2>
                <p className="mt-2 text-xs text-zinc-500">
                  {project.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Page;
