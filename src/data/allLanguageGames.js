import englishGames from "./englishGames.js";
import { createProceduralGames } from "./gameContentGenerator.js";

// 50 curated activities plus 300 procedural practice activities.
const languageGames = [...englishGames, ...createProceduralGames()];

export default languageGames;
