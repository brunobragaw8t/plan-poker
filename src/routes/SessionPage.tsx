import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getIdentity, setIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Copy,
  Check,
  Eye,
  RotateCcw,
  Trash2,
  ChevronRight,
  Users,
  Loader2,
  Link2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { VotingCard } from "@/components/VotingCard";
import { ParticipantAvatar } from "@/components/ParticipantAvatar";
import { VoteResultsBar } from "@/components/VoteResultsBar";

export function SessionPage() {
  const { slug } = useParams({ from: "/session/$slug" });
  const navigate = useNavigate();
  const session = useQuery(api.sessions.getBySlug, { slug });
  const stories = useQuery(
    api.stories.list,
    session ? { sessionId: session._id } : "skip"
  );
  const participants = useQuery(
    api.participants.list,
    session ? { sessionId: session._id } : "skip"
  );
  const currentVotes = useQuery(
    api.votes.listByStory,
    session?.currentStoryId ? { storyId: session.currentStoryId } : "skip"
  );

  const joinSession = useMutation(api.participants.join);
  const heartbeat = useMutation(api.participants.heartbeat);
  const addStory = useMutation(api.stories.add);
  const removeStory = useMutation(api.stories.remove);
  const updateStory = useMutation(api.stories.update);
  const setCurrentStory = useMutation(api.sessions.setCurrentStory);
  const revealVotes = useMutation(api.sessions.revealVotes);
  const resetVotes = useMutation(api.sessions.resetVotes);
  const castVote = useMutation(api.votes.cast);
  const retractVote = useMutation(api.votes.retract);

  const [identity, setIdentityState] = useState(getIdentity);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");
  const [newStoryLink, setNewStoryLink] = useState("");
  const [addStoryOpen, setAddStoryOpen] = useState(false);
  const [editStoryOpen, setEditStoryOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLink, setEditLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [guestName, setGuestName] = useState("");

  // Check identity and join session
  useEffect(() => {
    if (!session || !identity) return;

    const isCreator = identity.oddsId === session.creatorId;
    const isAlreadyParticipant = participants?.some(
      (p) => p.oddsId === identity.oddsId
    );

    if (!isCreator && !isAlreadyParticipant) {
      // Auto-join if we have a name
      joinSession({
        sessionId: session._id,
        oddsId: identity.oddsId,
        name: identity.name,
      });
    }
  }, [session, identity, participants, joinSession]);

  // Heartbeat
  useEffect(() => {
    if (!identity) return;
    const interval = setInterval(() => {
      heartbeat({ oddsId: identity.oddsId });
    }, 15000);
    return () => clearInterval(interval);
  }, [identity, heartbeat]);

  // Handle no identity
  useEffect(() => {
    if (!identity) {
      setNeedsName(true);
    }
  }, [identity]);

  const handleGuestJoin = useCallback(async () => {
    if (!guestName.trim() || !session) return;
    const newIdentity = setIdentity(guestName.trim());
    setIdentityState(newIdentity);
    setNeedsName(false);

    await joinSession({
      sessionId: session._id,
      oddsId: newIdentity.oddsId,
      name: newIdentity.name,
    });
  }, [guestName, session, joinSession]);

  const handleAddStory = async () => {
    if (!newStoryTitle.trim() || !session) return;
    await addStory({
      sessionId: session._id,
      title: newStoryTitle.trim(),
      description: newStoryDesc.trim() || undefined,
      issueLink: newStoryLink.trim() || undefined,
    });
    setNewStoryTitle("");
    setNewStoryDesc("");
    setNewStoryLink("");
    setAddStoryOpen(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (value: string) => {
    if (!session?.currentStoryId || !identity) return;
    const myVote = currentVotes?.find(
      (v) => v.participantOddsId === identity.oddsId
    );
    if (myVote?.value === value) {
      retractVote({
        storyId: session.currentStoryId,
        participantOddsId: identity.oddsId,
      });
    } else {
      castVote({
        storyId: session.currentStoryId,
        sessionId: session._id,
        participantOddsId: identity.oddsId,
        value,
      });
    }
  };

  const handleSetEstimate = (storyId: Id<"stories">, value: string) => {
    updateStory({ storyId, finalEstimate: value });
  };

  const openEditStory = () => {
    if (!currentStory) return;
    setEditTitle(currentStory.title);
    setEditDesc(currentStory.description ?? "");
    setEditLink(currentStory.issueLink ?? "");
    setEditStoryOpen(true);
  };

  const handleEditStory = async () => {
    if (!currentStory || !editTitle.trim()) return;
    await updateStory({
      storyId: currentStory._id,
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      issueLink: editLink.trim() || undefined,
    });
    setEditStoryOpen(false);
  };

  const isCreator = identity?.oddsId === session?.creatorId;
  const myVote = currentVotes?.find(
    (v) => v.participantOddsId === identity?.oddsId
  );
  const canVote =
    isCreator ? session?.creatorParticipates : true;
  const currentStory = stories?.find(
    (s) => s._id === session?.currentStoryId
  );

  // Sorted stories: current first, then by order
  const sortedStories = stories
    ? [...stories].sort((a, b) => a.order - b.order)
    : [];

  // Loading state
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
            This session may have been removed.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/10"
          >
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  // Guest name entry overlay
  if (needsName) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <Layers className="w-6 h-6 text-brand-yellow" />
              <span className="text-2xl font-bold">
                <span className="text-brand-yellow">Plan</span>Poker
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Joining: <span className="text-foreground">{session.name}</span>
            </p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Enter your name to join
              </Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestJoin()}
                placeholder="Your name..."
                autoFocus
                className="bg-input/50"
              />
            </div>
            <Button
              onClick={handleGuestJoin}
              disabled={!guestName.trim()}
              className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-dark font-semibold"
            >
              Join
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const votingParticipants = participants?.filter((p) => {
    if (p.oddsId === session.creatorId && !session.creatorParticipates)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/30 bg-card/40 backdrop-blur-md sticky top-0 z-20"
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-yellow-dim flex items-center justify-center">
              <Layers className="w-4 h-4 text-brand-blue-dark" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">
                {session.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {session.creatorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Participant count */}
            <Badge
              variant="secondary"
              className="gap-1.5 bg-secondary/50 text-muted-foreground"
            >
              <Users className="w-3 h-3" />
              {participants?.filter((p) => p.isOnline).length ?? 0}
            </Badge>

            {/* Copy invite link */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 border-border/50 text-muted-foreground hover:text-brand-yellow hover:border-brand-yellow/30 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="text-xs">Invite</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar - Stories */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Stories
              </h2>
              {isCreator && (
                <Dialog open={addStoryOpen} onOpenChange={setAddStoryOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-brand-yellow hover:text-brand-yellow hover:bg-brand-yellow/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border/50 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Title
                        </Label>
                        <Input
                          value={newStoryTitle}
                          onChange={(e) => setNewStoryTitle(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddStory()
                          }
                          placeholder="e.g. User login flow"
                          autoFocus
                          className="bg-input/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Issue Link (optional)
                        </Label>
                        <Input
                          value={newStoryLink}
                          onChange={(e) => setNewStoryLink(e.target.value)}
                          placeholder="e.g. https://jira.example.com/browse/PROJ-123"
                          className="bg-input/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Description (optional)
                        </Label>
                        <Textarea
                          value={newStoryDesc}
                          onChange={(e) => setNewStoryDesc(e.target.value)}
                          placeholder="Add any details..."
                          className="bg-input/50 resize-none"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleAddStory}
                        disabled={!newStoryTitle.trim()}
                        className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-dark font-semibold"
                      >
                        Add Story
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {sortedStories.map((story) => {
                  const isActive = story._id === session.currentStoryId;
                  return (
                    <motion.div
                      key={story._id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <button
                        onClick={() => {
                          if (isCreator) {
                            setCurrentStory({
                              sessionId: session._id,
                              storyId: story._id,
                            });
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 group ${
                          isActive
                            ? "bg-brand-yellow/10 border-brand-yellow/30 shadow-sm shadow-brand-yellow/5"
                            : "bg-card/40 border-border/20 hover:bg-card/60 hover:border-border/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <ChevronRight className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                          ) : story.finalEstimate ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm truncate flex-1 ${
                              isActive
                                ? "text-brand-yellow font-medium"
                                : "text-foreground/80"
                            }`}
                          >
                            {story.title}
                          </span>
                          {story.finalEstimate && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-400 border-green-500/20"
                            >
                              {story.finalEstimate}
                            </Badge>
                          )}
                          {isCreator && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStory({ storyId: story._id });
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {story.description && isActive && (
                          <p className="text-xs text-muted-foreground mt-1.5 ml-5.5 line-clamp-2">
                            {story.description}
                          </p>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {sortedStories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground/60">
                  <p className="text-sm">No stories yet</p>
                  {isCreator && (
                    <p className="text-xs mt-1">
                      Click + to add your first story
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Participants */}
            <Separator className="bg-border/30" />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Participants
              </h2>
              <div className="space-y-1">
                {participants?.map((p) => (
                  <ParticipantAvatar
                    key={p._id}
                    name={p.name}
                    isOnline={p.isOnline}
                    isCreator={p.oddsId === session.creatorId}
                    hasVoted={
                      currentVotes?.some(
                        (v) => v.participantOddsId === p.oddsId
                      ) ?? false
                    }
                    isRevealed={session.isRevealed}
                    vote={
                      session.isRevealed
                        ? currentVotes?.find(
                            (v) => v.participantOddsId === p.oddsId
                          )?.value
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Main area - Voting */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {currentStory ? (
              <>
                {/* Current story */}
                <div className="bg-card/50 border border-border/30 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Now estimating
                      </p>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">
                          {currentStory.title}
                        </h2>
                        {currentStory.issueLink && (
                          <a
                            href={currentStory.issueLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-brand-blue-light/20 border border-brand-blue-light/30 text-blue-300 hover:bg-brand-blue-light/30 hover:text-blue-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Issue
                          </a>
                        )}
                      </div>
                      {currentStory.description && (
                        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                          {currentStory.description}
                        </p>
                      )}
                    </div>
                    {isCreator && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openEditStory}
                          className="gap-1.5 border-border/50 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        {!session.isRevealed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              revealVotes({ sessionId: session._id })
                            }
                            disabled={!currentVotes?.length}
                            className="gap-1.5 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/10 disabled:opacity-30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Reveal
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              resetVotes({ sessionId: session._id })
                            }
                            className="gap-1.5 border-border/50 text-muted-foreground hover:text-foreground"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Edit Story Dialog */}
                    <Dialog open={editStoryOpen} onOpenChange={setEditStoryOpen}>
                      <DialogContent className="bg-card border-border/50 sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Story</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Title
                            </Label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleEditStory()
                              }
                              autoFocus
                              className="bg-input/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Issue Link (optional)
                            </Label>
                            <Input
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              placeholder="https://jira.example.com/browse/PROJ-123"
                              className="bg-input/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Description (optional)
                            </Label>
                            <Textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Add any details..."
                              className="bg-input/50 resize-none"
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={handleEditStory}
                            disabled={!editTitle.trim()}
                            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-dark font-semibold"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Vote status */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex -space-x-1.5">
                      {votingParticipants?.map((p) => {
                        const hasVoted = currentVotes?.some(
                          (v) => v.participantOddsId === p.oddsId
                        );
                        return (
                          <motion.div
                            key={p._id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold ${
                              hasVoted
                                ? "bg-brand-yellow text-brand-blue-dark"
                                : "bg-secondary text-muted-foreground"
                            }`}
                            title={`${p.name}${hasVoted ? " (voted)" : ""}`}
                          >
                            {p.name[0]?.toUpperCase()}
                          </motion.div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {currentVotes?.length ?? 0} /{" "}
                      {votingParticipants?.length ?? 0} voted
                    </span>
                  </div>
                </div>

                {/* Results (when revealed) */}
                <AnimatePresence>
                  {session.isRevealed && currentVotes && (
                    <VoteResultsBar
                      votes={currentVotes}
                      participants={participants ?? []}
                      cardSet={session.cardSet}
                      onSetEstimate={
                        isCreator
                          ? (value) =>
                              handleSetEstimate(currentStory._id, value)
                          : undefined
                      }
                      currentEstimate={currentStory.finalEstimate}
                    />
                  )}
                </AnimatePresence>

                {/* Card deck */}
                {canVote && !session.isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Pick your card
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {session.cardSet.map((card, i) => (
                        <VotingCard
                          key={card}
                          value={card}
                          isSelected={myVote?.value === card}
                          onClick={() => handleVote(card)}
                          delay={i * 0.03}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {canVote && session.isRevealed && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Votes revealed — waiting for next round
                    </p>
                  </div>
                )}

                {!canVote && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      You are observing this session
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Copy className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {sortedStories.length > 0
                      ? "Select a story to start estimating"
                      : "Add stories to get started"}
                  </p>
                </div>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
