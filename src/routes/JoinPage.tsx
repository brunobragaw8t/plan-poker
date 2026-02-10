import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setIdentity, getIdentity } from "@/lib/identity";
import { motion } from "framer-motion";
import { Layers, UserPlus, Loader2 } from "lucide-react";

export function JoinPage() {
  const { slug } = useParams({ from: "/join/$slug" });
  const navigate = useNavigate();
  const session = useQuery(api.sessions.getBySlug, { slug });
  const joinSession = useMutation(api.participants.join);

  const existingIdentity = getIdentity();
  const [name, setName] = useState(existingIdentity?.name ?? "");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!name.trim() || !session) return;
    setIsJoining(true);

    const identity = setIdentity(name.trim());

    try {
      await joinSession({
        sessionId: session._id,
        oddsId: identity.oddsId,
        name: name.trim(),
      });
      navigate({ to: "/session/$slug", params: { slug } });
    } catch (err) {
      console.error("Failed to join session:", err);
      setIsJoining(false);
    }
  };

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-brand-yellow" />
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Session not found</h2>
          <p className="text-muted-foreground mb-4">
            This session link may be invalid or expired.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/10"
          >
            Create a new session
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow-dim flex items-center justify-center shadow-lg shadow-brand-yellow/20">
              <Layers className="w-5 h-5 text-brand-blue-dark" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-brand-yellow">Plan</span>
              <span className="text-foreground">Poker</span>
            </h1>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-brand-blue/10">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-lg">
              Join{" "}
              <span className="text-brand-yellow">{session.name}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hosted by {session.creatorName}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-muted-foreground">
                Your Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
                className="bg-input/50 border-border/50 focus:border-brand-yellow/50 transition-colors"
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={!name.trim() || isJoining}
              className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-dark font-semibold h-11 text-sm transition-all duration-200 hover:shadow-lg hover:shadow-brand-yellow/20 disabled:opacity-40"
            >
              {isJoining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
