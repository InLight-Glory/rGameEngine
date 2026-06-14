import { copyFileSync, existsSync } from 'fs';

const built = 'app/dev.html';
const entry = 'app/index.html';

if (!existsSync(built)) {
  console.error('Build output missing:', built);
  process.exit(1);
}

copyFileSync(built, entry);
console.log('Created', entry, 'for hub and static hosting');
