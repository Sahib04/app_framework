console.log("➡️ test.js starting");

const dotenv = require("dotenv");
const result = dotenv.config({ path: "C:\\Users\\master\\Desktop\\project3\\.env" });

if (result.error) {
  console.error("❌ dotenv failed to load:", result.error);
} else {
  console.log("✅ dotenv loaded:", result.parsed);
}

console.log("DATABASE_URL:", process.env.DATABASE_URL);