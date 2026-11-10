import type { MathProblem } from "./problem.ts";

// Two of the twelve problems Brandon and June read at stop 1 (plan/candidates/math-problems.md), as the model writes
// them: problem 5 for the older boy's style and problem 12 for the younger's. The tests hold checkMath() to them, and
// core/prompts/math.md shows the same two as the shape. Keep the three in step.

export const MARKET: MathProblem = {
  title: "The farmers' market",
  setting: "Saturday morning at the farmers' market. Apple bananas are $2 a bunch. A pineapple is $5.",
  graph: { kind: "none", numbers: [], labels: [] },
  parts: [
    {
      question: "You buy 3 bunches of apple bananas. How many dollars is that?",
      answer: 6,
      unit: "dollars",
      expression: "3 × 2",
      wordings: ["Each bunch costs $2, and you take 3 bunches. How much do you pay?", "How much is 3 lots of $2?"],
      steps: [
        { question: "How much do 2 bunches cost?", answer: 4, expression: "2 × 2" },
        { question: "Add one more bunch. How much now?", answer: 6, expression: "4 + 2" },
      ],
      tie: "It's like counting by 2s.",
      working: ["3 × $2 = $6.", "The bananas cost $6."],
    },
    {
      question: "You also buy 2 pineapples. How much do they cost?",
      answer: 10,
      unit: "dollars",
      expression: "2 × 5",
      wordings: ["Pineapples are $5 each. How much for 2 of them?", "What is $5 and $5 more?"],
      steps: [
        { question: "How much is one pineapple?", answer: 5, expression: "5" },
        { question: "And two?", answer: 10, expression: "5 + 5" },
      ],
      tie: "It's like two hands of fingers, 5 on each.",
      working: ["2 × $5 = $10.", "The pineapples cost $10."],
    },
    {
      question: "How much for the bananas and the pineapples together?",
      answer: 16,
      unit: "dollars",
      expression: "6 + 10",
      wordings: ["The bananas were $6 and the pineapples were $10. What is the total?", "What do $6 and $10 make?"],
      steps: [
        { question: "Start at $10 and add $5. How much?", answer: 15, expression: "10 + 5" },
        { question: "Add the last $1. How much?", answer: 16, expression: "15 + 1" },
      ],
      tie: "It's like adding two scores at the end of a game.",
      working: ["$6 + $10 = $16.", "You spend $16."],
    },
    {
      question: "You pay with a $20 bill. How much change do you get back?",
      answer: 4,
      unit: "dollars",
      expression: "20 - 16",
      wordings: ["The total is $16 and you hand over $20. How many dollars come back to you?", "What do you add to $16 to make $20?"],
      steps: [
        { question: "What is $16 and $2 more?", answer: 18, expression: "16 + 2" },
        { question: "How many more dollars from $18 to $20?", answer: 2, expression: "20 - 18" },
        { question: "So how many dollars from $16 to $20?", answer: 4, expression: "20 - 16" },
      ],
      tie: "It's like the person at the stand counting up from the price to the bill you gave.",
      working: ["$20 − $16 = $4.", "You get $4 back."],
    },
  ],
  example: {
    text: "A shave ice costs $4. Two of them cost $4 + $4 = $8. Pay with a $10 bill: $8 and $2 more make $10, so you get $2 back.",
    working: ["$4 + $4 = $8", "$10 − $8 = $2"],
    expression: "10 - (4 + 4)",
    picture: { kind: "groups", numbers: [2, 4], labels: ["shave ice", "dollars"] },
  },
  handoff: "Ask Mom or Dad to let you pay at the market and count the change with you.",
};

export const CONES: MathProblem = {
  title: "Cones at soccer practice",
  setting: "At soccer practice, the coach sets out cones for drills. Every drill is a shape on the grass with a cone on each corner, and no two shapes share a cone. A square has 4 corners and a triangle has 3.",
  graph: { kind: "none", numbers: [], labels: [] },
  parts: [
    {
      question: "The coach makes 6 squares. How many cones does that take?",
      answer: 24,
      unit: "cones",
      expression: "6 × 4",
      wordings: ["A square has 4 corners, and each corner gets a cone. How many cones for 6 squares?", "How many is 6 fours?"],
      steps: [
        { question: "How many corners does one square have?", answer: 4, expression: "4" },
        { question: "How many cones for 3 squares?", answer: 12, expression: "3 × 4" },
        { question: "How many for 6 squares?", answer: 24, expression: "6 × 4" },
      ],
      tie: "It's like a picnic blanket on a windy day: a rock on each of its 4 corners.",
      working: ["6 × 4 = 24.", "6 squares take 24 cones."],
    },
    {
      question: "Then the coach sets out 5 triangles. How many cones?",
      answer: 15,
      unit: "cones",
      expression: "5 × 3",
      wordings: ["A triangle has 3 corners. How many cones for 5 triangles?", "How many is 5 threes?"],
      steps: [
        { question: "How many corners does a triangle have?", answer: 3, expression: "3" },
        { question: "How many cones for 2 triangles?", answer: 6, expression: "2 × 3" },
        { question: "For 4 triangles?", answer: 12, expression: "4 × 3" },
        { question: "And 5?", answer: 15, expression: "5 × 3" },
      ],
      tie: "It's like a three-legged stool: 3 legs every time.",
      working: ["5 × 3 = 15.", "5 triangles take 15 cones."],
    },
    {
      question: "How many more cones do the squares use than the triangles?",
      answer: 9,
      unit: "cones",
      expression: "24 - 15",
      wordings: ["The squares use 24 cones and the triangles use 15. How many more do the squares use?", "What do you add to 15 to make 24?"],
      steps: [
        { question: "From 15 up to 20 is how many?", answer: 5, expression: "20 - 15" },
        { question: "From 20 up to 24 is how many?", answer: 4, expression: "24 - 20" },
        { question: "So from 15 to 24 is how many?", answer: 9, expression: "24 - 15" },
      ],
      tie: "It's like two piles of cones side by side: how many extra are in the big pile?",
      working: ["24 − 15 = 9.", "The squares use 9 more cones."],
    },
    {
      question: "Quick one: 7 triangles. How many cones?",
      answer: 21,
      unit: "cones",
      expression: "7 × 3",
      wordings: ["Each triangle needs 3 cones. How many for 7 triangles?", "How many is 7 threes?"],
      steps: [
        { question: "How many for 5 triangles?", answer: 15, expression: "5 × 3" },
        { question: "How many for 2 more triangles?", answer: 6, expression: "2 × 3" },
        { question: "Together?", answer: 21, expression: "15 + 6" },
      ],
      tie: "It's like counting the wheels on 7 tricycles.",
      working: ["7 × 3 = 21.", "7 triangles take 21 cones."],
    },
  ],
  example: null,
  handoff: "Ask Mom or Dad to set out a shape in the yard with you, something on each corner, and count them together.",
};
