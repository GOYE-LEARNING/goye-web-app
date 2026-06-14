"use client";

import { useParams, usePathname } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  backFunction: () => void;
  header: string;
  showBackButton?: boolean; // Optional prop to force show/hide back button
  subtitle?: string; // Optional subtitle for more context
}

export default function SubHeader({ 
  header, 
  backFunction, 
  showBackButton,
  subtitle 
}: Props) {
  const pathname = usePathname();
  const params = useParams<{ org_name: string }>();
  const [isHovered, setIsHovered] = useState(false);
  
  const pathsWithoutBackButton = [
    "dashboard/student/profile",
    "dashboard/tutor/profile",
    "dashboard/student/profile",
    `dashboard/${params.org_name}/admin`,
    `dashboard/${params.org_name}/organization`,
  ];
  
  const shouldShowBackButton = showBackButton !== undefined 
    ? showBackButton 
    : !pathsWithoutBackButton.includes(pathname);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const backButtonVariants = {
    initial: { opacity: 0, x: -10, scale: 0.8 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }
    },
    hover: { 
      scale: 1.1,
      x: -3,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      x: -2,
      transition: {
        duration: 0.1
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-4 mb-4">
        {shouldShowBackButton && (
          <motion.div
            variants={backButtonVariants as any}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <span
              onClick={backFunction}
              className="group relative flex items-center justify-center h-[40px] w-[40px] 
                bg-gradient-to-br from-white to-gray-50 dark:from-secondaryColors-0 dark:to-secondaryColors-100 
                rounded-xl shadow-md hover:shadow-lg cursor-pointer
                border border-gray-200 dark:border-gray-700
                transition-all duration-300"
              style={{
                boxShadow: isHovered 
                  ? "0 4px 12px rgba(0,0,0,0.15)" 
                  : "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <FaArrowLeft 
                size={18} 
                className="text-primaryColors-0 dark:text-primaryColors-400
                  transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              {/* Tooltip on hover */}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                bg-gray-900 text-white text-xs rounded-lg py-1 px-2 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                whitespace-nowrap pointer-events-none z-10">
                Go Back
              </span>
            </span>
          </motion.div>
        )}
        
        <motion.div
          variants={headerVariants as any}
          className="flex-1"
        >
          <h1 className="text-[28px] md:text-[32px] font-bold bg-gradient-to-r 
            from-primaryColors-0 to-primaryColors-600 dark:from-primaryColors-400 dark:to-primaryColors-200 
            bg-clip-text text-transparent leading-tight">
            {header}
          </h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>
      
      {/* Decorative underline */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="relative"
      >
        <div className="h-[3px] bg-gradient-to-r from-primaryColors-0 via-primaryColors-400 to-transparent 
          rounded-full w-20 md:w-32"></div>
      </motion.div>
    </motion.div>
  );
}