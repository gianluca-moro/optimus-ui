import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'path';
import { resolvePath } from '../../../scripts/build-helper.mjs';

const { __dirname, __workspace, OUTPUT_DIR } = resolvePath(import.meta.url);

fs.copySync(path.resolve(__dirname, '../README.md'), `${OUTPUT_DIR}/README.md`);
fs.copySync(path.resolve(__workspace, './LICENSE.md'), `${OUTPUT_DIR}/LICENSE.md`);

execSync('node ./scripts/build-schematics.mjs', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
fs.copySync(path.resolve(__dirname, '../schematics/dist'), `${OUTPUT_DIR}/schematics`);
