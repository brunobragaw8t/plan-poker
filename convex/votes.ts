import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByStory = query({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
      .collect();
  },
});

export const cast = mutation({
  args: {
    storyId: v.id("stories"),
    sessionId: v.id("sessions"),
    participantOddsId: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if vote already exists
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_story_and_participant", (q) =>
        q.eq("storyId", args.storyId).eq("participantOddsId", args.participantOddsId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }

    return await ctx.db.insert("votes", {
      storyId: args.storyId,
      sessionId: args.sessionId,
      participantOddsId: args.participantOddsId,
      value: args.value,
    });
  },
});

export const retract = mutation({
  args: {
    storyId: v.id("stories"),
    participantOddsId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_story_and_participant", (q) =>
        q.eq("storyId", args.storyId).eq("participantOddsId", args.participantOddsId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
