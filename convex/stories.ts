import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const add = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    description: v.optional(v.string()),
    issueLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stories")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const storyId = await ctx.db.insert("stories", {
      sessionId: args.sessionId,
      title: args.title,
      description: args.description,
      issueLink: args.issueLink,
      order: existing.length,
    });

    // If this is the first story, set it as current
    if (existing.length === 0) {
      await ctx.db.patch(args.sessionId, { currentStoryId: storyId });
    }

    return storyId;
  },
});

export const update = mutation({
  args: {
    storyId: v.id("stories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    issueLink: v.optional(v.string()),
    finalEstimate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.issueLink !== undefined) patch.issueLink = args.issueLink;
    if (args.finalEstimate !== undefined)
      patch.finalEstimate = args.finalEstimate;
    await ctx.db.patch(args.storyId, patch);
  },
});

export const remove = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const story = await ctx.db.get(args.storyId);
    if (!story) return;

    // Delete associated votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // If this was the current story, unset it
    const session = await ctx.db.get(story.sessionId);
    if (session && session.currentStoryId === args.storyId) {
      await ctx.db.patch(story.sessionId, { currentStoryId: undefined });
    }

    await ctx.db.delete(args.storyId);
  },
});
