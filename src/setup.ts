import shared from "./shared";
import fs from "fs";

Object.keys(shared.paths).forEach(key => {
  if (!fs.existsSync(shared.paths[key])) {
    fs.mkdirSync(shared.paths[key], { recursive: true });
  }
});

import db from "./utils/database";

db.initialize();