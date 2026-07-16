import * as ts from 'typescript';

/**
 * Inserts `import <name> from '<module>';` after the last top-level import statement in `text`
 * (or at the very top of the file if there are no imports). No-op if a default import of `name`
 * from `module` is already present.
 */
export function addDefaultImport(text: string, name: string, module: string): string {
    const sourceFile = ts.createSourceFile('file.ts', text, ts.ScriptTarget.Latest, true);

    const alreadyImported = sourceFile.statements.some((statement) => ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === module && statement.importClause?.name?.text === name);
    if (alreadyImported) {
        return text;
    }

    const importStatement = `import ${name} from '${module}';`;

    let lastImportEnd = 0;
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement)) {
            lastImportEnd = statement.getEnd();
        }
    }

    if (lastImportEnd > 0) {
        return text.slice(0, lastImportEnd) + '\n' + importStatement + text.slice(lastImportEnd);
    }
    return importStatement + '\n' + text;
}
