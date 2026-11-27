import games from "../src/data/allLanguageGames.js";

const expectedCount = 350;
const allowedEngines = new Set(["quiz", "match", "type", "fillblank", "scramble", "sort"]);
const counts = {};
const seenIds = new Set();

if (games.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} language activities, received ${games.length}.`);
}

for (const game of games) {
  if (!game.id || !game.title) throw new Error("A language activity is missing its id or title.");
  if (seenIds.has(game.id)) throw new Error(`Duplicate activity id: ${game.id}`);
  seenIds.add(game.id);
  if (!allowedEngines.has(game.engine)) {
    throw new Error(`Unsupported engine "${game.engine}" in ${game.id}.`);
  }
  counts[game.engine] = (counts[game.engine] || 0) + 1;
  const bank = game.questionBank || game.questions || game.cards || game.items || game.words || [];
  if (bank.length < 400) {
    throw new Error(`Activity bank must contain at least 400 items: ${game.id} has ${bank.length}.`);
  }
  if (game.engine === "quiz" && !(game.questions || []).length) {
    throw new Error(`Quiz activity has no questions: ${game.id}`);
  }
  if (game.engine === "match" && !(game.cards || []).length) {
    throw new Error(`Matching activity has no cards: ${game.id}`);
  }
  if (game.engine === "sort" && (!(game.items || []).length || !(game.categories || []).length)) {
    throw new Error(`Sorting activity is incomplete: ${game.id}`);
  }
  if (game.engine === "scramble" && !(game.words || []).length) {
    throw new Error(`Scramble activity has no words: ${game.id}`);
  }
  if ((game.engine === "type" || game.engine === "fillblank") && !(game.questions || []).length) {
    throw new Error(`Text activity has no questions: ${game.id}`);
  }
}

console.log(`PASS: ${games.length} language activities; every activity has at least 400 bank items.`);
console.log("Engine distribution:", JSON.stringify(counts));
