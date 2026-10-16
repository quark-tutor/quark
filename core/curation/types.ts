import type { DaySlot } from "../../lib/lenses.ts";
import type { Perspective } from "../../lib/values.ts";
import type { DayPlan } from "./schedule.ts";

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

// One plan topic (a thread topic or a short lesson), both grade bands together. Ideas hang off the
// 2-3 row (topic_id).
export type WeekTopic = {
  id: string; // plan_topics.id of the 2-3 row
  keys: string[]; // both bands' keys
  kind: "thread" | "short";
  subject: string;
  slot: DaySlot;
  title: string;
  younger: string; // the 2-3 summary
  older: string; // the 4-5 summary
  items: OfferedItem[]; // approved content for this topic
  perspective: Perspective | null; // a thread topic's from its week, a short lesson's its own
  valuesPoints: number[];
  parentNote: string | null; // something a parent does with the child: play a recording, an experiment
  chapter?: { title: string; why: string }; // a thread topic's week in its stretch
  earlierInThread?: string[]; // the titles of the thread's topics before this one, most recent last
};

// One week of the family's plan, mixed: the thread on one slot a day, short lessons on the rest.
export type WeekPlan = {
  week: number; // the family's week in the plan
  title: string; // the theme's title
  thread: { stretch: string; title: string } | null; // null once the thread has run out
  topicIds: string[]; // every plan_topics row the week uses, both bands, for themes.topic_ids
  topics: WeekTopic[];
  schedule: DayPlan[]; // all seven days, even when fewer are built
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
