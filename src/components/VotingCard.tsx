import { motion } from "framer-motion";

interface VotingCardProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

export function VotingCard({
  value,
  isSelected,
  onClick,
  delay = 0,
}: VotingCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.3, type: "spring", stiffness: 300 }}
      whileHover={{
        y: -8,
        scale: 1.05,
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-16 h-22 sm:w-18 sm:h-24 rounded-xl border-2 font-mono text-lg font-bold transition-colors duration-200 flex items-center justify-center cursor-pointer select-none ${
        isSelected
          ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow card-glow"
          : "bg-card/60 border-border/40 text-foreground/80 hover:border-brand-yellow/30 hover:bg-card/80"
      }`}
    >
      {/* Corner decorations */}
      <span className="absolute top-1.5 left-2 text-[9px] opacity-50">
        {value}
      </span>
      <span className="absolute bottom-1.5 right-2 text-[9px] opacity-50 rotate-180">
        {value}
      </span>

      {/* Main value */}
      <span className="relative z-10">{value}</span>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center"
        >
          <svg
            className="w-2.5 h-2.5 text-brand-blue-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
