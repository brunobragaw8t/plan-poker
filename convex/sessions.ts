import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    creatorName: v.string(),
    creatorId: v.string(),
    cardSet: v.array(v.string()),
    creatorParticipates: v.boolean(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      slug: args.slug,
      name: args.name,
      creatorName: args.creatorName,
      creatorId: args.creatorId,
      cardSet: args.cardSet,
      creatorParticipates: args.creatorParticipates,
      isRevealed: false,
    });

    // Add the creator as participant if they want to participate
    if (args.creatorParticipates) {
      await ctx.db.insert("participants", {
        sessionId,
        oddsId: args.creatorId,
        name: args.creatorName,
        isOnline: true,
        lastSeen: Date.now(),
      });
    }

    return sessionId;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const revealVotes = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { isRevealed: true });
  },
});

export const resetVotes = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Clear revealed state
    await ctx.db.patch(args.sessionId, { isRevealed: false });

    // Delete all votes for the current story
    if (session.currentStoryId) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_story", (q) => q.eq("storyId", session.currentStoryId!))
        .collect();
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
    }
  },
});

export const setCurrentStory = mutation({
  args: {
    sessionId: v.id("sessions"),
    storyId: v.optional(v.id("stories")),
  },
  handler: async (ctx, args) => {
    let isRevealed = false;
    if (args.storyId) {
      const story = await ctx.db.get(args.storyId);
      if (story?.finalEstimate) {
        isRevealed = true;
      }
    }
    await ctx.db.patch(args.sessionId, {
      currentStoryId: args.storyId,
      isRevealed,
    });
  },
});

export const updateSettings = mutation({
  args: {
    sessionId: v.id("sessions"),
    cardSet: v.optional(v.array(v.string())),
    creatorParticipates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.cardSet !== undefined) patch.cardSet = args.cardSet;
    if (args.creatorParticipates !== undefined)
      patch.creatorParticipates = args.creatorParticipates;
    await ctx.db.patch(args.sessionId, patch);
  },
});
