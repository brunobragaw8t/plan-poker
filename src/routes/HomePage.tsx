import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CARD_PRESETS, PRESET_LABELS } from "@/lib/cardSets";
import { generateSlug, setIdentity } from "@/lib/identity";
import { motion } from "framer-motion";
import { Layers, Sparkles, ArrowRight } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const createSession = useMutation(api.sessions.create);

  const [sessionName, setSessionName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("fibonacci");
  const [creatorParticipates, setCreatorParticipates] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!sessionName.trim() || !creatorName.trim()) return;
    setIsCreating(true);

    const slug = generateSlug();
    const identity = setIdentity(creatorName.trim());

    try {
      await createSession({
        name: sessionName.trim(),
        creatorName: creatorName.trim(),
        creatorId: identity.oddsId,
        cardSet: CARD_PRESETS[selectedPreset],
        creatorParticipates,
        slug,
      });
      navigate({ to: "/session/$slug", params: { slug } });
    } catch (err) {
      console.error("Failed to create session:", err);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow-dim flex items-center justify-center shadow-lg shadow-brand-yellow/20">
              <Layers className="w-6 h-6 text-brand-blue-dark" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-brand-yellow">Plan</span>
              <span className="text-foreground">Poker</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Estimate together. Decide faster.
          </p>
        </motion.div>

        {/* Create Session Form */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-brand-blue/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              New Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Your Name */}
            <div className="space-y-2">
              <Label htmlFor="creatorName" className="text-sm text-muted-foreground">
                Your Name
              </Label>
              <Input
                id="creatorName"
                placeholder="e.g. Alex"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="bg-input/50 border-border/50 focus:border-brand-yellow/50 transition-colors"
              />
            </div>

            {/* Session Name */}
            <div className="space-y-2">
              <Label htmlFor="sessionName" className="text-sm text-muted-foreground">
                Session Name
              </Label>
              <Input
                id="sessionName"
                placeholder="e.g. Sprint 42 Planning"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="bg-input/50 border-border/50 focus:border-brand-yellow/50 transition-colors"
              />
            </div>

            {/* Card Set */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Card Set</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESET_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPreset(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedPreset === key
                        ? "bg-brand-yellow/15 border-brand-yellow/50 text-brand-yellow"
                        : "bg-secondary/30 border-border/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Preview cards */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CARD_PRESETS[selectedPreset].map((card) => (
                  <motion.span
                    key={card}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center w-9 h-11 rounded-md bg-secondary/50 border border-border/30 text-xs font-mono text-foreground/80"
                  >
                    {card}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Participate toggle */}
            <div className="flex items-center justify-between py-2">
              <Label
                htmlFor="participate"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Participate in voting
              </Label>
              <Switch
                id="participate"
                checked={creatorParticipates}
                onCheckedChange={setCreatorParticipates}
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={!sessionName.trim() || !creatorName.trim() || isCreating}
              className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-dark font-semibold h-11 text-sm transition-all duration-200 hover:shadow-lg hover:shadow-brand-yellow/20 disabled:opacity-40"
            >
              {isCreating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-brand-blue-dark/30 border-t-brand-blue-dark rounded-full"
                />
              ) : (
                <>
                  Create Session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
