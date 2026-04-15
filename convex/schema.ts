import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    slug: v.string(),
    name: v.string(),
    creatorName: v.string(),
    creatorId: v.string(),
    cardSet: v.array(v.string()),
    creatorParticipates: v.boolean(),
    currentStoryId: v.optional(v.id("stories")),
    isRevealed: v.boolean(),
  }).index("by_slug", ["slug"]),

  stories: defineTable({
    sessionId: v.id("sessions"),
    title: v.string(),
    description: v.optional(v.string()),
    issueLink: v.optional(v.string()),
    finalEstimate: v.optional(v.string()),
    order: v.number(),
  }).index("by_session", ["sessionId"]),

  participants: defineTable({
    sessionId: v.id("sessions"),
    oddsId: v.string(),
    name: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_odds_id", ["oddsId"])
    .index("by_session_and_odds_id", ["sessionId", "oddsId"]),

  votes: defineTable({
    storyId: v.id("stories"),
    sessionId: v.id("sessions"),
    participantOddsId: v.string(),
    value: v.string(),
  })
    .index("by_story", ["storyId"])
    .index("by_story_and_participant", ["storyId", "participantOddsId"]),
});
