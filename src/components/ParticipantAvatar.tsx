import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface ParticipantAvatarProps {
  name: string;
  isOnline: boolean;
  isCreator: boolean;
  hasVoted: boolean;
  isRevealed: boolean;
  vote?: string;
}

export function ParticipantAvatar({
  name,
  isOnline,
  isCreator,
  hasVoted,
  isRevealed,
  vote,
}: ParticipantAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
        isOnline ? "opacity-100" : "opacity-40"
      }`}
    >
      <div className="relative">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
            hasVoted
              ? "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40"
              : "bg-secondary text-muted-foreground border border-border/30"
          }`}
        >
          {initials}
        </div>
        {/* Online indicator */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
            isOnline ? "bg-green-500" : "bg-muted-foreground/30"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm truncate">{name}</span>
          {isCreator && (
            <Crown className="w-3 h-3 text-brand-yellow flex-shrink-0" />
          )}
        </div>
      </div>
      {/* Vote indicator or value */}
      <div className="flex-shrink-0">
        {isRevealed && vote ? (
          <motion.span
            initial={{ scale: 0, rotateY: 90 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-xs font-mono font-bold"
          >
            {vote}
          </motion.span>
        ) : hasVoted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-8 rounded-sm bg-brand-yellow/15 border border-brand-yellow/20"
          />
        ) : null}
      </div>
    </div>
  );
}
