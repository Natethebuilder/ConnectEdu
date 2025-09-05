import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function EduLogo({ size = 80 }: { size?: number }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="flex flex-col items-center cursor-pointer select-none"
    >
      {/* Graduation Cap Only */}
      <motion.div
        variants={{
          rest: { y: 0, rotate: 0, scale: 1 },
          hover: { y: -10, rotate: -10, scale: 1.1 },
        }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="relative"
      >
        <GraduationCap
          size={size}
          className="text-purple-600 ]"
          

          strokeWidth={2.5}
        />
      </motion.div>

      {/* Brand Text */}
      <h1 className="mt-3 text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        ConnectEdu
      </h1>
    </motion.div>
  );
}
