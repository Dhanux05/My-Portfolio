import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./style.module.scss";
import { opacity } from "../../anim";
import { cn } from "@/lib/utils";

interface IndexProps {
  src: string;
  isActive: boolean;
  alt: string;
}

const Index: React.FC<IndexProps> = ({ src, isActive, alt }) => {
  return (
    <motion.div
      variants={opacity}
      initial="initial"
      animate={isActive ? "open" : "closed"}
      className={styles.imageContainer}
    >
      <Image
        src={src}
        width={400}
        height={400}
        className="my-32 w-full h-auto object-cover"
        alt={alt}
        unoptimized={true}
      />
    </motion.div>
  );
};

export default Index;
