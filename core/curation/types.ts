import type { DaySlot } from "../../lib/lenses.ts";
import type { Perspective } from "../../lib/values.ts";

// The pieces a week is built from (docs/04, "How a week is built"): the plan's week as both grade
// bands have it, the approved content offered with it, and what the model writes.

export type OfferedItem = {
  id: string; // content_items.id
  type: string; // image, audio...
  title: string;
  creator: string | null;
  attribution: string;
  description?: string;
  storagePath?: string;
};

// One plan topic, both grade bands together. Ideas hang off the 2-3 row (topic_id).
export type WeekTopic = {
  id: string; // plan_topics.id of the 2-3 row
  keys: string[]; // both bands' keys
  subject: string;
  slot: DaySlot;
  title: string;
  younger: string; // the 2-3 summary
  older: string; // the 4-5 summary
  items: OfferedItem[]; // approved content for this topic
};

export type WeekPlan = {
  stretch: string;
  week: number;
  title: string;
  why: string;
  perspective: Perspective | null;
  valuesPoints: number[];
  topicIds: string[]; // every plan_topics row of the week, both bands, for themes.topic_ids
  topics: WeekTopic[];
};

export type AnswerKey = { accept: string[]; rubric: string };

export type IdeaLayer = {
  layer: 1 | 2 | 3 | 4;
  title: string;
  statement: string;
  question: string;
  answer_key: AnswerKey;
  content_item_id: string | null;
};

// One day-slot's chain of four ideas, as stored.
export type IdeaChain = {
  day: number;
  slot: DaySlot;
  topic: WeekTopic;
  layers: IdeaLayer[];
  ids?: string[]; // ideas.id per layer, once saved
  asked?: number; // idea calls made: 2 when layer 1 was sent back for having no item
};
