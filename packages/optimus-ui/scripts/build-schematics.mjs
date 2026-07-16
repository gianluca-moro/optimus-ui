import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schematicsDir = path.resolve(__dirname, '../schematics');
const outDir = path.join(schematicsDir, 'dist');

fs.removeSync(outDir);
execSync('npx tsc -p tsconfig.json', { cwd: schematicsDir, stdio: 'inherit' });

fs.copySync(path.join(schematicsDir, 'collection.json'), path.join(outDir, 'collection.json'));
for (const name of ['ng-add', 'migrate-from-primeng']) {
    fs.copySync(path.join(schematicsDir, name, 'schema.json'), path.join(outDir, name, 'schema.json'));
}
