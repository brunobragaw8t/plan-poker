import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Vote {
  participantOddsId: string;
  value: string;
}

interface Participant {
  oddsId: string;
  name: string;
}

interface VoteResultsBarProps {
  votes: Vote[];
  participants: Participant[];
  cardSet: string[];
  onSetEstimate?: (value: string) => void;
  currentEstimate?: string;
}

export function VoteResultsBar({
  votes,
  participants,
  cardSet,
  onSetEstimate,
  currentEstimate,
}: VoteResultsBarProps) {
  // Group votes by value
  const grouped: Record<string, string[]> = {};
  for (const vote of votes) {
    if (!grouped[vote.value]) grouped[vote.value] = [];
    const participant = participants.find(
      (p) => p.oddsId === vote.participantOddsId
    );
    grouped[vote.value].push(participant?.name ?? "Unknown");
  }

  // Sort by card set order
  const sortedValues = Object.keys(grouped).sort((a, b) => {
    const ai = cardSet.indexOf(a);
    const bi = cardSet.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const maxCount = Math.max(...Object.values(grouped).map((v) => v.length));

  // Compute numeric average (if applicable)
  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((n) => !isNaN(n));
  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(
          1
        )
      : null;

  // Check consensus
  const isConsensus = sortedValues.length === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      className="bg-card/50 border border-border/30 rounded-xl p-5 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Results
          </h3>
          {isConsensus && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-medium"
            >
              Consensus!
            </motion.span>
          )}
        </div>
        {average && (
          <span className="text-sm text-muted-foreground">
            Average:{" "}
            <span className="text-brand-yellow font-mono font-semibold">
              {average}
            </span>
          </span>
        )}
      </div>

      <div className="space-y-2">
        {sortedValues.map((value, i) => {
          const names = grouped[value];
          const percent = (names.length / maxCount) * 100;

          return (
            <motion.div
              key={value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Card value */}
              <button
                onClick={() => onSetEstimate?.(value)}
                disabled={!onSetEstimate}
                className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold flex-shrink-0 transition-all ${
                  currentEstimate === value
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : onSetEstimate
                      ? "bg-card/60 border-border/40 text-foreground/80 hover:border-brand-yellow/30 cursor-pointer"
                      : "bg-card/60 border-border/40 text-foreground/80"
                }`}
              >
                {currentEstimate === value ? (
                  <Check className="w-4 h-4" />
                ) : (
                  value
                )}
              </button>

              {/* Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                    className="h-6 rounded-md bg-brand-yellow/20 border border-brand-yellow/20 flex items-center px-2 min-w-fit"
                  >
                    <span className="text-xs text-brand-yellow font-medium whitespace-nowrap">
                      {names.length} vote{names.length > 1 ? "s" : ""}
                    </span>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {names.join(", ")}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All card options for host to pick from */}
      {onSetEstimate && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground/60 mb-2">
            {currentEstimate
              ? "Change final estimate"
              : "Select final estimate"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cardSet.map((value) => {
              const wasVoted = sortedValues.includes(value);
              const isSelected = currentEstimate === value;
              return (
                <button
                  key={value}
                  onClick={() => onSetEstimate(value)}
                  className={`w-9 h-11 rounded-md border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : wasVoted
                        ? "bg-card/60 border-border/40 text-foreground/80 hover:border-brand-yellow/30"
                        : "bg-card/30 border-border/20 text-muted-foreground hover:border-brand-yellow/30 hover:text-foreground/80"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : value}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
