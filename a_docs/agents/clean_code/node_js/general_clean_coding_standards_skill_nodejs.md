---
name: general-clean-coding-nodejs-skill
description: >
  Apply or review clean coding standards for Node.js projects. This skill is
  scoped exclusively to Node.js JavaScript (`.js` and `.mjs` files using ES
  Modules) — it must not be applied to code in any other language. Use this
  skill whenever you are writing new Node.js code, reviewing existing Node.js
  code, or refactoring code to comply with current standards. Covers naming
  conventions, formatting rules, function design, file structure, exception
  handling, and Jest testing conventions. Trigger this skill for any task
  involving Node.js code generation, code review, or compliance checking
  against current standards. If the user says "write code", "review this",
  "check this file", or "refactor this", and a Node.js / JavaScript file is
  involved, this skill applies.
---

# Clean Coding Standards — Node.js

A skill for writing and reviewing Node.js code compliant with Good Coding Practices.

> **Scope — Node.js only.** Every rule, example, and checklist item in this
> document applies **exclusively to Node.js JavaScript source code** (ECMAScript
> Modules running on Node.js, `.js` / `.mjs` files) and Node.js-based tooling
> (e.g. Jest). Do not apply these standards to TypeScript, browser-only
> JavaScript, Deno, or non-JavaScript code. If you are reviewing or generating
> code outside that scope, this skill does not apply and must not be used as
> the authority for that work.

> **Module system.** All examples assume **ES Modules** (`import` / `export`).
> CommonJS (`require` / `module.exports`) is out of scope; new Node.js code
> under this standard must use ESM.

---

## Modes

This skill operates in two modes. Select the appropriate one based on the user's intent:

- **[WRITE MODE]** — Used when generating new Node.js code or refactoring existing code.
- **[REVIEW MODE]** — Used when auditing existing Node.js code for standard violations.

---

## Note on examples in this document

The code snippets below are **illustrative** and exist to demonstrate a single rule at a time. To keep them readable, some examples contain literal strings (e.g. `'my_value'`) that would, in real code, be defined as constants per Section 6. Treat the examples as focused on the rule under discussion; do not flag the supporting scaffolding as a violation when applying the checklist to production code.

---

## [WRITE MODE] — Writing Compliant Code

When generating Node.js code, apply **all** of the following rules unconditionally. Do not wait for the user to ask.

### 1. Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Class names | `PascalCase`, **plural** | `class MyObjectTypes {}` |
| Class file names | `kebab-case` version of the class name | `my-object-types.js` |
| Class instance names | `camelCase`, **singular** version of the class name | `const myObjectType = new MyObjectTypes()` |
| Constants | `UPPER_CASE` with underscores between words | `const IDS_COLUMN_NAME = 'ids'` |
| Variables and functions | `camelCase` | `stringVariable`, `getMyFunctionResult()` |
| File and folder names | `kebab-case` | `data-exporter.js`, `snapshot-readers/` |
| Function names | **Action-oriented** verb phrases | `getSomething()`, `exportData()`, `importMyData()` |
| File names | **Actor-oriented** noun phrases aligned with the main public function inside | `data-exporter.js` → contains `exportData()`; `snapshot-reader.js` → contains `readSnapshot()` |
| Boolean-returning functions | Prefix with `is` or `has` | `isSnapshotValid()`, `hasRequiredColumns()` |
| Class private members | Prefix with `#` (ECMAScript private fields/methods) | `#parseSnapshotFile()`, `#cachedResult` |

> **Naming quality rules:**
> - Names must be **meaningful, specific, and domain-based**.
> - Avoid single-letter names. The only permitted single-letter name is the
>   throwaway `_` (e.g. `arr.map((_, index) => ...)`).
> - Avoid vague verbs and nouns such as `process`, `handle`, `do`, `data`,
>   `item`, `tmp`, `res`, and unclear abbreviations. (Note: `req` and `res`
>   are still acceptable as Express middleware parameter names because the
>   framework dictates them.)
> - If the main public function in a file is renamed, the file must be renamed to match.

> **Note on module-level "private" functions.** JavaScript has no syntactic
> private marker for module-scope items — privacy is enforced by **not
> exporting** them. A function that is not exported from its module is
> private to that module by definition. Do not add `_` or `#` prefixes to
> module-level private functions; the absence of `export` is the contract.
> The `#` prefix applies **only inside class bodies**, where it is enforced
> by the language.

---

### 2. Formatting Rules

#### Empty Lines
- Leave **one empty line** between consecutive instructions (logical separation between statements or blocks).
- Do **not** leave an empty line immediately after the opening brace `{` of a function, method, loop, or block.

```js
// ✅ Correct
function getMyValue() {
    const myVariable = MY_FIRST_VALUE;

    const mySecondVariable = MY_SECOND_VALUE;

    return mySecondVariable;
}

// ❌ Wrong — empty line after opening brace
function getMyValue() {

    const myVariable = MY_FIRST_VALUE;
}
```

#### Variable Declarations
- Use `const` by default. Use `let` only when reassignment is genuinely required. **Never** use `var`.
- For declarations whose right-hand side is a **function call or a non-trivial expression**, write the value on a **new line** for visual separation.
- For **short literal declarations** (e.g. `const count = 3;`, `const name = 'Alice';`), keep the right-hand side on the same line.
- Always leave **one space** before and after the equals sign (`=`).

```js
// ✅ Correct — function call result on a new line
const myVariable =
    getMyData();

// ✅ Correct — short literal declaration, single line
const retryLimit = 3;

// ❌ Wrong — long expression collapsed onto the declaration line
const myVariable = getMyData({ firstParameter: ALPHA, secondParameter: BETA });

// ❌ Wrong — `var` is forbidden
var counter = 0;
```

#### Function Parameters — Declaration and Calls
- Functions with two or more parameters must accept a **single options object** with destructured named properties.
- Each property in the options object must be on its **own line** in both the declaration and the call.
- Trailing commas are required on multi-line argument and parameter lists.

```js
// ✅ Correct
function getMyData({
    firstParameter,
    secondParameter,
}) {
    // ...
}

getMyData({
    firstParameter: 'firstArgumentValue',
    secondParameter: [element1, element2, element3],
});

// ❌ Wrong — positional parameters
function getMyData(firstParameter, secondParameter) { /* ... */ }

// ❌ Wrong — properties collapsed onto one line
getMyData({ firstParameter: 'firstArgumentValue', secondParameter: [/* ... */] });
```

> **Single-parameter exception.** A function with exactly one parameter may
> accept it positionally (e.g. `function readSnapshot(path) { ... }`).
> The options-object pattern becomes mandatory once a second parameter is
> introduced — at which point all parameters move into the object.

#### Strict Equality
- Use `===` and `!==` exclusively. Never use `==` or `!=`.
- Use `Number.isNaN()` rather than `=== NaN` (which never matches).
- Use explicit checks (`x === null`, `x === undefined`, `x == null` is forbidden even though it is a common idiom).

#### Statement Termination
- Every statement must end with an **explicit semicolon**. Do not rely on Automatic Semicolon Insertion (ASI).

---

### 3. Function Design Rules

- A function must **do exactly one thing** (separation of concerns).
- A function must **return exactly one item**. If multiple values are needed, return a named object literal with descriptive keys — not a bare array used as a tuple.
- Break down complex logic into **private sub-functions** (non-exported module functions, or `#`-prefixed class methods) to enforce modularisation.
- If a function requires too many parameters, consider **creating a class** to encapsulate and pass them.
- When a function manages a sequence of different processes, name it an **orchestrator** and follow the orchestrator pattern.
- Prefer **`async` / `await`** over raw Promise chains (`.then()` / `.catch()`). Async functions read top-to-bottom and integrate cleanly with `try` / `catch`.
- An `async` function must `await` every Promise it produces internally — never return an un-awaited Promise from inside a `try` block, since the rejection will escape the `try`.

```js
// ✅ Correct — orchestrator pattern with async/await
export async function orchestrateStandardAnalysisProcess({
    inputData,
}) {
    const validatedData =
        await validateInput({ inputData });

    const transformedData =
        await transformData({ data: validatedData });

    return formatResult({ data: transformedData });
}
```

---

### 4. Private Members and Encapsulation

- **Inside a class:** members used only internally must be prefixed with `#` (ECMAScript private). The `#` prefix is enforced by the JavaScript runtime — calls to `#name` from outside the class throw a `SyntaxError`.
- **At module level:** functions used only inside the module must **not** be exported. The absence of `export` is the privacy contract; do not add cosmetic `_` or `#` prefixes to module-level functions.
- If external code needs the behaviour of a private member, expose it through a **new public method or exported function**.

```js
// ✅ Correct — class with #-private helper
export class SnapshotReaders {
    readSnapshot({ path }) {
        return this.#parseSnapshotFile({ path });
    }

    #parseSnapshotFile({ path }) {
        // ...
    }
}

// ✅ Correct — module-level: private = not exported
function buildInternalIndex({ rows }) {
    // not exported, therefore private to this module
}

export function readSnapshot({ path }) {
    const index =
        buildInternalIndex({ rows: loadRows({ path }) });

    return index;
}

// ❌ Wrong — calling #-private from outside the class
const reader = new SnapshotReaders();
reader.#parseSnapshotFile({ path });   // SyntaxError
```

---

### 5. Loop and Conditional Design

- If a `for`, `while`, or `if` block contains **more than one statement**, extract all of its content into a private function.
- **Nested** loops or conditionals must not be visible at the outer level — group the inner block into a private function.
- Use `for...of` for iterating over arrays and iterables. Do **not** use `for...in` for arrays (it iterates over enumerable property names, not values).
- Prefer array methods (`.map`, `.filter`, `.reduce`, `.forEach`, `.some`, `.every`) when they express intent more clearly than an explicit loop. Do not chain more than three array methods in a single expression — extract to a private function instead.

```js
// ✅ Correct — body delegated to a private function
for (const row of table) {
    validateTableRow({ row });
}

// ✅ Correct — array method expressing intent
const validRows =
    table.filter((row) => isRowValid({ row }));

// ❌ Wrong — nested loops visible and multi-statement body inline
for (const row of table) {
    for (const cell of row) {
        if (cell.isValid()) {
            transform(cell);
        }
    }
}
```

---

### 6. Hardcoded Strings

- Strings must **never be hardcoded** inline in production code.
- Define them as **constants** in a dedicated constants file, or as a **frozen object** (the JavaScript equivalent of an enum) in its own file.

```js
// ✅ Correct — as a constant (column-name-constants.js)
export const IDS_COLUMN_NAME = 'ids';

// ✅ Correct — as a frozen-object enum (excel-cell-check-types.js)
export const ExcelCellCheckTypes = Object.freeze({
    EMPTY: 'empty',
    INVALID_FORMAT: 'invalid_format',
});
```

> **Why `Object.freeze`?** Plain JavaScript has no native `enum`. `Object.freeze`
> produces a value that behaves like an enum: properties cannot be reassigned,
> added, or deleted. Combined with the one-class-or-enum-per-file rule
> (Section 8), this gives the same guarantees a Python `Enum` class would.

---

### 7. Comments

- Clean code must be **self-explanatory** — comments should generally not be necessary.
- Comments are permitted only for **development notes** such as `// TODO:` markers, or for **JSDoc-style API documentation** on exported public functions.
- Do **not** write explanatory inline comments that describe what the code is doing — rename functions and variables to make the intent clear instead.

```js
// ✅ Permitted — TODO marker
// TODO: extract snapshot validation into a private function

// ✅ Permitted — JSDoc on a public export
/**
 * Reads a snapshot file from disk and returns the parsed result.
 * @param {{ path: string }} options
 * @returns {Promise<Snapshot>}
 */
export async function readSnapshot({ path }) {
    // ...
}

// ❌ Avoid — the code should speak for itself
// Loop through all rows and validate each one
for (const row of table) {
    validateTableRow({ row });
}
```

---

### 8. File and Folder Structure

- Each Node.js file must contain **exactly one public entry point**, which is either:
  - one exported function (plus its non-exported sub-functions), or
  - one exported class (plus its non-exported sub-functions).
  - Exception: files that are an explicit **suite of related functions** (e.g. a facade module like `hash-creators.js`).
- **A Node.js file must contain no more than one class-like definition.** Files are limited to **at most one class** — no second class, no helper class, no auxiliary type, no co-located error class. If a class needs a helper class, the helper goes in its **own file** and is imported.
  - "Class-like definition" covers: regular `class` blocks, frozen-object enums (`Object.freeze({...})` exported as a named constant), and custom error classes (`class FooError extends Error`).
  - Private helpers within a class file must be **`#`-prefixed methods** of that class, not separate classes.
  - Module-level **instances** (e.g. `export const defaultLogger = new Logger();`) are not class definitions and are not restricted by this rule.
  - This rule combines with Section 6: each frozen-object enum lives in its own file, each constants set lives in its own file. It also combines with Section 9: even small helper classes count toward the 100-line cap of the file they live in — but in practice they should not live there at all.
- **No `index.js` re-export aggregators inside source folders.** Imports must reference the file that actually defines the symbol. Re-export `index.js` files are permitted only at the root of a published npm package (i.e. the package's public entry point declared in `package.json` `"exports"`), and even then must contain only `export` statements — no logic.
- Folders that contain no JavaScript files must not contain an `index.js`; they are plain directories holding fixtures, generated outputs, or other assets.

```js
// ✅ Correct — one class per file (snapshot-readers.js)
export class SnapshotReaders {
    readSnapshot({ path }) {
        return this.#parseSnapshotFile({ path });
    }

    #parseSnapshotFile({ path }) {
        // ...
    }
}

// ❌ Wrong — helper class co-located with the public class
export class SnapshotReaders { /* ... */ }

class SnapshotParsers { /* must live in its own file */ }

// ❌ Wrong — return-type class co-located
export class SnapshotResults { /* must live in its own file */ }

export class SnapshotReaders {
    readSnapshot({ path }) { /* returns SnapshotResults */ }
}
```

---

### 9. File Size Limit

- A Node.js file must contain **no more than 100 physical lines in total**. This is a **hard cap** with no exceptions.
- The 100-line count includes **everything in the file**: imports, blank lines, comments, JSDoc blocks, decorators, class and function definitions, and executable code. Counting every physical line keeps the rule unambiguous and trivially measurable (`wc -l file.js`).
- The cap is intentionally tight given the verbose formatting required elsewhere in this standard (one property per line in options objects, blank line between instructions, multi-line declarations for non-trivial expressions). When a file approaches the limit, the correct response is **always to extract**, never to compress by violating the formatting rules.

> **Rationale.** The limit is a forcing function for decomposition. Combined
> with the "one public entry point per file" and "one class per file" rules
> (Section 8), it pushes the codebase toward many small, single-purpose
> modules rather than a few large ones.

#### How to comply when a file grows past 100 lines

| Situation | Required action |
|---|---|
| The file contains one exported function with several private sub-functions, and the privates have grown | Extract one or more private sub-functions into their **own files** as new exported functions, and import them back. |
| The file contains a class with many methods | Split the class along a clear responsibility boundary into multiple smaller classes — each in its **own file** (per Section 8's one-class-per-file rule). Extract pure helpers into separate utility files of exported functions. |
| The file is a constants file that has outgrown the limit | Split it into multiple thematic constants files (e.g. `column-name-constants.js`, `error-message-constants.js`). |
| The file is a facade / suite-of-functions module | Split the suite by sub-theme into multiple facade files; each facade still must fit within 100 lines. |
| The file is a Jest test module that has grown past 100 lines | Split the tests by behaviour-under-test into multiple test files; use `describe.each` / `test.each` and shared fixture files to keep individual test files small. |

#### What does **not** justify exceeding the limit

- "It's just data" — long literal arrays, objects, or frozen-object enums must still respect the cap; split them across multiple files by theme.
- "The formatting rules forced the line count up" — the formatting rules are non-negotiable; the file must be split instead.
- "It's a generated file" — generated JavaScript files are still subject to the cap; adjust the generator to produce multiple files.

---

### 10. File and Folder Path Handling

- Never manipulate file paths with string concatenation or template literals.
- Always use the built-in **`node:path`** module — `path.join()` for joining segments, `path.resolve()` for absolute paths, `path.sep` when an explicit separator is needed.
- Use the `node:` prefix on built-in module imports to make the source unambiguous and to avoid shadowing by a same-named npm package.
- For paths relative to the current module, use `import.meta.url` combined with `node:url`'s `fileURLToPath`, not `__dirname` (which is not available in ES Modules).

```js
// ✅ Correct
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_DIRECTORY =
    path.dirname(fileURLToPath(import.meta.url));

const PARENT_FOLDER_PATH =
    path.join(CURRENT_DIRECTORY, '..', 'storage');

// ❌ Wrong — string concatenation
const badPath = rootDirectory + '/' + subdirectory + '/storage';

// ❌ Wrong — template-literal path construction
const alsoBadPath = `${rootDirectory}/${subdirectory}/storage`;
```

---

### 11. Exception Handling

- Always catch **specific** error types — check `error instanceof SomeError` (or `error.code === 'ENOENT'` for Node.js system errors) before handling, and re-throw anything else.
- Never use a bare `catch (error) { /* swallow */ }` — silent catches lose information and hide bugs.
- To re-throw and preserve the stack, use `throw error;` (a bare `throw` is only valid inside a `catch` block and behaves the same as `throw error`).
- When wrapping a lower-level error in a domain-specific one, use the `cause` option (`new MyError('message', { cause: error })`) so the original stack is preserved in the error chain.
- Never throw non-Error values (`throw 'something went wrong'` or `throw { code: 1 }`). Always throw an `Error` (or a subclass), so stacks are captured.

```js
// ✅ Correct — specific error type, re-thrown
try {
    await loadFile({ path: filePath });
} catch (error) {
    if (error.code !== 'ENOENT') {
        throw error;
    }
    // handle the missing-file case
}

// ✅ Correct — wrapping with cause to preserve the chain
try {
    await loadFile({ path: filePath });
} catch (error) {
    throw new SnapshotLoadError('Failed to load snapshot', { cause: error });
}

// ❌ Wrong — swallows everything
try {
    await loadFile({ path: filePath });
} catch (error) {
    // nothing
}

// ❌ Wrong — throwing a non-Error value
throw 'snapshot is invalid';
```

---

### 12. Reusability

- Before writing a general-purpose utility function, check whether it already exists in:
  - the **Node.js standard library** (`node:fs`, `node:path`, `node:url`, `node:crypto`, `node:util`, etc.);
  - your project's existing **shared utility modules**;
  - well-established npm libraries already in `package.json` (e.g. `date-fns` for date math, `zod` for validation).
- If it exists, use it — do not write redundant code.
- For file and folder operations, prefer the `node:fs/promises` API over manual callback-based implementations or third-party wrappers.
- Do not introduce a new dependency for functionality already provided by the standard library or an existing project dependency.

---

## [REVIEW MODE] — Reviewing Code for Compliance

When reviewing Node.js code, check every item in the checklist below. For each violation found:

1. **Identify** the exact line or block.
2. **State** which standard is violated (reference the rule name from this skill).
3. **Provide** a corrected version of the code.

Group findings by category. Use the following checklist:

### Review Checklist

#### Naming
- [ ] Class names are `PascalCase` and plural
- [ ] Class file names match the `kebab-case` of the class name
- [ ] Class instance names are `camelCase` singular
- [ ] Constants are `UPPER_CASE_WITH_UNDERSCORES`
- [ ] Variables and functions are `camelCase`
- [ ] File and folder names are `kebab-case`
- [ ] Function names are action-oriented (verb phrases)
- [ ] File names are actor-oriented and match the main exported function name
- [ ] Boolean functions are prefixed with `is` or `has`
- [ ] Class private members are prefixed with `#`
- [ ] Module-level private functions are unexported (no cosmetic `_` or `#` prefix)
- [ ] No single-letter names (except `_` for throwaways)
- [ ] No vague names (`process`, `handle`, `do`, `data`, `item`, `tmp`, etc.)

#### Formatting
- [ ] One empty line between instructions
- [ ] No empty line immediately after `{` in function or block headers
- [ ] `const` used by default; `let` only when needed; no `var`
- [ ] Declarations whose right-hand side is a function call or non-trivial expression use a line break after `=`
- [ ] Functions with two or more parameters use a destructured options object
- [ ] Each property in a multi-line options object is on its own line
- [ ] Trailing commas present on multi-line argument and parameter lists
- [ ] Strict equality (`===`, `!==`) used everywhere; no `==` or `!=`
- [ ] Every statement terminated with an explicit semicolon

#### Function Design
- [ ] Each function does exactly one thing
- [ ] Each function returns exactly one item (no bare arrays used as tuples)
- [ ] Long or complex functions are broken into private sub-functions
- [ ] Functions with many parameters use a class to encapsulate them
- [ ] Multi-process functions follow the orchestrator pattern
- [ ] `async` / `await` used in preference to raw Promise chains

#### Loops and Conditionals
- [ ] `for` / `while` / `if` bodies with more than one statement are extracted to private functions
- [ ] Nested loops are hidden inside private functions
- [ ] `for...of` used for iterables; `for...in` not used for arrays
- [ ] No more than three chained array methods in a single expression

#### Strings and Constants
- [ ] No hardcoded string literals inline in production code
- [ ] Strings defined as constants or `Object.freeze`d enum objects in dedicated files

#### Comments
- [ ] No explanatory inline comments (code is self-explanatory)
- [ ] Only `// TODO:` notes or JSDoc on public exports present

#### File and Folder Structure
- [ ] Each file has one public entry point — either one exported function (plus privates) or one exported class (plus privates), unless it is an explicit facade
- [ ] No more than one class-like definition (class, frozen-object enum, custom error class) per file
- [ ] Private helpers inside a class file are `#`-methods of that class, not separate classes
- [ ] No `index.js` re-export aggregators inside source folders (root package entry only)

#### File Size
- [ ] File contains no more than 100 physical lines in total (including imports, blank lines, comments, and JSDoc)
- [ ] Files approaching the limit have been decomposed by extraction, not by violating formatting rules

#### Path Handling
- [ ] No string concatenation or template literals for paths
- [ ] `node:path` module used for all path construction
- [ ] `import.meta.url` + `fileURLToPath` used for module-relative paths (not `__dirname`)

#### Exception Handling
- [ ] Specific error types (`instanceof` or `error.code`) checked before handling
- [ ] No silent `catch` blocks
- [ ] Unhandled cases are re-thrown
- [ ] Wrapped errors use `{ cause }` to preserve the chain
- [ ] Only `Error` (or subclasses) are thrown — never strings, numbers, or plain objects

#### Reusability
- [ ] No custom utility functions duplicating Node.js standard library or existing project dependencies
- [ ] No new dependencies added for functionality already available

---

### Review Output Format

Structure your review output as follows:

```
## Code Review — Clean Coding Standards (Node.js)

### Summary
X violation(s) found across Y categories.

---

### [Category Name]

**Violation:** [Short description]
**Location:** Line X — `[offending code snippet]`
**Rule:** [Rule name from this skill]
**Fix:**
[corrected code block]

---
[repeat per violation]

### ✅ Compliant Items
[List what was done correctly, if notable]
```

---

## Jest-Specific Standards

Apply these rules whenever writing or reviewing test code. Jest standards extend — and in two specific cases override — the general Node.js standards above.

### Jest exceptions to the general rules

The following two carve-outs apply **only** to Jest test modules:

1. **Test names are descriptive natural-language strings, not action-oriented identifiers.** The first argument to `describe()`, `it()`, and `test()` is a string sentence describing the behaviour under test (e.g. `it('returns an empty result when the snapshot has no rows', ...)`). The general "verb phrase function name" rule does not apply to these strings — they are not identifiers.
2. **Test files use the `.test.js` suffix.** The file-naming rule (kebab-case, actor-oriented) still applies to the rest of the name; the `.test.js` suffix marks the file for Jest discovery (e.g. `snapshot-reader.test.js`).

All other rules — options-object parameters, no hardcoded strings, no vague names, exception handling, file size, etc. — apply to test code unchanged.

### Structure
- Tests live in a `tests/` folder at the **repository root**, marked as the test sources root in your tool configuration.
- Sub-folder structure:

```
tests/
├── common/
│   └── fixtures/
│       ├── inputs/
│       ├── personal/       ← not committed to git
│       └── universal/
├── e2e/
│   ├── fixtures/
│   └── outputs/            ← not committed to git
├── unit/
│   ├── fixtures/
│   └── outputs/            ← not committed to git
└── volume/
    ├── fixtures/
    └── outputs/            ← not committed to git
```

### Naming
- Test **files** end with `.test.js` (e.g. `snapshot-reader.test.js`).
- `describe` blocks group tests for a single unit or behaviour: `describe('SnapshotReaders', () => { ... })`.
- `it` / `test` blocks describe a single observable behaviour in plain English: `it('returns an empty result when the snapshot has no rows', () => { ... })`.

### Design Principles
- Tests must be **small and focused** — one behaviour per test.
- Use **proper assertions** — not `expect(result).toBeTruthy()` but `expect(result).toEqual(expectedValue)` or a more specific matcher.
- Extract reusable test setup into **external fixture files** (avoid duplicating setup logic). Use `beforeEach` / `beforeAll` for per-test or per-suite setup.
- Test **edge cases** and **negative cases**; mark known failures with `it.failing(...)` rather than commenting them out.
- Use `describe.each` or `test.each` to avoid duplicating test logic across multiple inputs.
- Skip tests that depend on external causes (e.g. platform) using a guarded `describe.skip` / `it.skip` based on a runtime check.

```js
// ✅ Example — platform-conditional skip
import { isPlatformWindows } from '../common/fixtures/platform-checks.js';

const describeWindowsOnly =
    isPlatformWindows() ? describe : describe.skip;

describeWindowsOnly('windows-specific behaviour', () => {
    it('handles drive-letter paths', () => {
        // ...
    });
});
```
