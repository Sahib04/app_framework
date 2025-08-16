const fs = require("fs");

const raw = fs.readFileSync("C:\\Users\\master\\Desktop\\project3\\.env", "utf8");
console.log("RAW FILE CONTENTS >>>");
console.log(JSON.stringify(raw, null, 2));