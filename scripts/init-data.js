const fs = require("fs");
const path = require("path");

const seedDir = path.join(__dirname, "../data-seed");
const dataDir = path.join(__dirname, "../data");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const files = ["items.json", "photos.json", "settings.json", "requests.json"];

let copied = 0;
for (const file of files) {
  const dest = path.join(dataDir, file);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(path.join(seedDir, file), dest);
    console.log(`Seeded: ${file}`);
    copied++;
  }
}

if (copied === 0) {
  console.log("Data already exists, skipping seed.");
} else {
  console.log(`Seeded ${copied} file(s) from data-seed/.`);
}
