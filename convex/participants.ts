import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("participants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const join = mutation({
  args: {
    sessionId: v.id("sessions"),
    oddsId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if participant already exists
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_odds_id", (q) => q.eq("oddsId", args.oddsId))
      .first();

    if (existing) {
      // Update their online status and name
      await ctx.db.patch(existing._id, {
        isOnline: true,
        lastSeen: Date.now(),
        name: args.name,
      });
      return existing._id;
    }

    return await ctx.db.insert("participants", {
      sessionId: args.sessionId,
      oddsId: args.oddsId,
      name: args.name,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

export const heartbeat = mutation({
  args: { oddsId: v.string() },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_odds_id", (q) => q.eq("oddsId", args.oddsId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        isOnline: true,
        lastSeen: Date.now(),
      });
    }
  },
});

export const leave = mutation({
  args: { oddsId: v.string() },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_odds_id", (q) => q.eq("oddsId", args.oddsId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, { isOnline: false });
    }
  },
});
