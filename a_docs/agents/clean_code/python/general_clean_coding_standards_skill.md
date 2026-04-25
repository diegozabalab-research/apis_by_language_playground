---
name: general-clean-coding-python-skill
description: >
  Apply or review clean coding standards for Python projects. This skill is
  scoped exclusively to Python — it must not be applied to code in any other
  language. Use this skill whenever you are writing new Python code, reviewing
  existing Python code, or refactoring code to comply with current standards.
  Covers naming conventions, formatting rules, function design, file structure,
  exception handling, and pytest conventions. Trigger this skill for any task
  involving Python code generation, code review, or compliance checking against
  current standards. If the user says "write code", "review this", "check this
  file", or "refactor this", and a Python file is involved, this skill applies.
---

# Clean Coding Standards

A skill for writing and reviewing Python code compliant with Good Coding Practices.

> **Scope — Python only.** Every rule, example, and checklist item in this
> document applies **exclusively to Python source code (`.py` files) and
> Python-based tooling (e.g. pytest)**. Do not apply these standards to code
> written in any other language (JavaScript, TypeScript, Java, C#, SQL, shell,
> YAML, etc.). If you are reviewing or generating non-Python code, this skill
> does not apply and must not be used as the authority for that work.

---

## Modes

This skill operates in two modes. Select the appropriate one based on the user's intent:

- **[WRITE MODE]** — Used when generating new Python code or refactoring existing code.
- **[REVIEW MODE]** — Used when auditing existing Python code for standard violations.

---

## Note on examples in this document

The code snippets below are **illustrative** and exist to demonstrate a single rule at a time. To keep them readable, some examples contain literal strings (e.g. `'my_value'`) that would, in real code, be defined as constants per Section 6. Treat the examples as focused on the rule under discussion; do not flag the supporting scaffolding as a violation when applying the checklist to production code.

---

## [WRITE MODE] — Writing Compliant Code

When generating Python code, apply **all** of the following rules unconditionally. Do not wait for the user to ask.

### 1. Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Class names | `CamelCase`, **plural** | `class MyObjectTypes:` |
| Class file names | `snake_case` version of the class name | `my_object_types.py` |
| Class instance names | `snake_case`, **singular** version of the class name | `my_object_type = MyObjectTypes()` |
| Constants | `UPPER_CASE` with underscores between words | `IDS_COLUMN_NAME = 'ids'` |
| All other names (variables, functions, files, folders) | `snake_case` | `string_variable`, `get_my_function_result()` |
| Function names | **Action-oriented** verb phrases | `get_something()`, `export_data()`, `import_my_data()` |
| File names | **Actor-oriented** noun phrases aligned with the main public function inside | `data_exporter.py` → contains `export_data()`; `snapshot_reader.py` → contains `read_snapshot()` |
| Boolean-returning functions | Prefix with `is_` or `has_` | `is_snapshot_valid()`, `has_required_columns()` |
| Private methods | Prefix with double underscore `__` | `__validate_table_row()` |

> **Naming quality rules:**
> - Names must be **meaningful, specific, and domain-based**.
> - Avoid single-letter names. The only permitted single-letter name is the
>   throwaway `_` (e.g. `for _ in range(...)`).
> - The conventional Python identifiers `self` and `cls` are required by the
>   language and are not subject to the meaningful-name rule.
> - Avoid vague verbs and nouns such as `process`, `handle`, `do`, `data`,
>   `item`, `tmp`, `res`, and unclear abbreviations.
> - If the main public function in a file is renamed, the file must be renamed to match.

> **Note on `__` for module-level privacy.** This standard requires
> double-underscore prefixes for *all* private callables, including those at
> module level. This is a deliberate departure from PEP 8 (which uses a single
> underscore at module level). The choice is intentional: a uniform `__` prefix
> makes private callables visually unmistakable regardless of where they live.
> Be aware that, inside a class body, `__name` additionally triggers Python's
> name-mangling — this is the desired behaviour.

---

### 2. Formatting Rules

#### Empty Lines
- Leave **one empty line** between consecutive instructions (logical separation between statements or blocks).
- Do **not** leave an empty line immediately after a colon (`:`) in function declarations or loop headers.

```python
# ✅ Correct
def get_my_value() -> None:
    my_variable = MY_FIRST_VALUE

    my_second_variable = MY_SECOND_VALUE

# ❌ Wrong — empty line after colon
def get_my_value() -> None:

    my_variable = MY_FIRST_VALUE
```

#### Variable Assignments
- For assignments whose right-hand side is a **function call or a non-trivial expression**, write the assigned value on a **new line**, using a backslash (`\`) for line continuation.
- For **short literal assignments** (e.g. `count = 5`, `name = 'Alice'`, `enabled = True`), the right-hand side stays on the same line.
- Always leave **one space** before and after the equals sign (`=`) in assignments.

```python
# ✅ Correct — function call result on a new line
my_variable = \
    get_my_data()

# ✅ Correct — short literal assignment, single line
retry_limit = 3

# ❌ Wrong — long expression collapsed onto the assignment line
my_variable = get_my_data(first_parameter=ALPHA, second_parameter=BETA)
```

#### Function Arguments — Declaration and Calls
- Each argument must be on its **own line**.
- In function calls, always use the `parameter_name=value` form (no spaces around `=`).
- Do **not** break the line between the parameter name and its value.

```python
# ✅ Correct
def get_my_data(
    *,
    first_parameter: str,
    second_parameter: list,
) -> None:
    ...

get_my_data(
    first_parameter=FIRST_ARGUMENT_VALUE,
    second_parameter=[element_1, element_2, element_3],
)

# ❌ Wrong — arguments on the same line
get_my_data(first_parameter=FIRST_ARGUMENT_VALUE, second_parameter=[...])

# ❌ Wrong — line broken after equals
get_my_data(
    first_parameter=
        FIRST_ARGUMENT_VALUE,
)
```

#### Enforcing Named Arguments
- Always pass arguments **by name** in function calls.
- To enforce named-only arguments at the call site, use a bare asterisk `*` as the first parameter in the function signature.

```python
# ✅ Correct — enforced named arguments
def get_my_data(
    *,
    first_argument: str,
    second_argument: list,
) -> None:
    ...
```

---

### 3. Function Design Rules

- A function must **do exactly one thing** (separation of concerns).
- A function must **return exactly one item**. If multiple values are needed, return a named dataclass or a typed object — not a bare tuple.
- Break down complex logic into **private sub-functions** to enforce modularisation.
- If a function requires too many arguments, consider **creating a class** to encapsulate and pass them.
- When a function manages a sequence of different processes, name it an **orchestrator** and follow the orchestrator pattern.

```python
# ✅ Correct — orchestrator pattern
def orchestrate_standard_analysis_process(
    *,
    input_data: MyInputType,
) -> MyResultType:
    validated_data = \
        __validate_input(input_data=input_data)

    transformed_data = \
        __transform_data(data=validated_data)

    return \
        __format_result(data=transformed_data)
```

---

### 4. Private Methods and Encapsulation

- Methods used **only internally** within a file must be prefixed with `__` (double underscore), making them private.
- Private methods must **never be called from external code**.
- If external code needs the behaviour of a private method, expose it through a **new public method**.

```python
# ✅ Correct — public wrapper exposes the behaviour
def read_snapshot() -> Snapshot:
    return \
        __read_snapshot()

# ❌ Wrong — calling private method externally
snapshot = my_module.__read_snapshot()
```

---

### 5. `for` and `if` Loop Design

- If a `for` or `if` block contains **more than one statement**, extract all of its content into a **private function**.
- **Nested** `for`/`if` loops must not be visible at the outer level — group the inner loop into a private function.
- In `for` loops, the `in` clause must go on a **new line**.

```python
# ✅ Correct — `in` clause on new line, body delegated to a private function
for index, row \
        in table.iterrows():
    __validate_table_row(row=row)

# ❌ Wrong — nested loops visible and multi-statement body inline
for row in table:
    for cell in row:
        if cell.is_valid():
            transform(cell)
```

---

### 6. Hardcoded Strings

- Strings must **never be hardcoded** inline in production code.
- Define them as **constants** in a dedicated constants file, or as **enumerations** in a separate `Enum` class.

```python
# ✅ Correct — as a constant
IDS_COLUMN_NAME = 'ids'

# ✅ Correct — as an Enum
from enum import Enum

class ExcelCellCheckTypes(Enum):
    EMPTY = 'empty'
    INVALID_FORMAT = 'invalid_format'
```

---

### 7. Comments

- Clean code must be **self-explanatory** — comments should generally not be necessary.
- Comments are permitted only for **development notes** such as `# TODO:` markers.
- Do **not** write explanatory inline comments that describe what the code is doing — rename functions and variables to make the intent clear instead.

```python
# ✅ Permitted
# TODO: extract snapshot validation into a private function

# ❌ Avoid — the code should speak for itself
# Loop through all rows and validate each one
for index, row \
        in table.iterrows():
    __validate_table_row(row=row)
```

---

### 8. File and Folder Structure

- Each Python file must contain **exactly one public entry point**, which is either:
  - one public function (plus its private sub-functions), or
  - one public class (plus its private sub-functions).
  - Exception: files that are an explicit **suite of related functions** (e.g. a facade module like `hash_creators.py`).
- **A Python file must contain no more than one class-like definition.** Files are limited to **at most one class** — no second class, no helper class, no nested sibling class, no auxiliary dataclass, no co-located exception class. If a class needs a helper class, the helper goes in its **own file** and is imported.
  - "Class-like definition" covers: regular `class` blocks, `@dataclass` classes, `Enum` subclasses, `NamedTuple`/`TypedDict` definitions, `Protocol` definitions, and custom exception classes.
  - Private helpers within a class file must be **functions**, not classes. Use `__` prefix for these private functions per Section 4.
  - Module-level **instances** (e.g. `default_logger = Logger()`, singleton registrations, constants assigned from a class call) are not class definitions and are not restricted by this rule.
  - This rule combines with Section 6: each `Enum` lives in its own file, each constants set lives in its own file. It also combines with Section 9: even small helper classes count toward the 100-line cap of the file they live in — but in practice they should not live there at all.
- `__init__.py` files must be **empty** — imports must rely on folder structure, not on `__init__.py` content.
- Folders that contain no Python files or code must **not** have an `__init__.py` file; they are plain directories.
- Test folders that contain Python test modules follow the same rule: an empty `__init__.py` is permitted (and may be required for pytest discovery in some configurations); folders that contain only fixture files, generated outputs, or non-Python assets must not have an `__init__.py`.

```python
# ✅ Correct — one class per file (snapshot_readers.py)
class SnapshotReaders:
    def read_snapshot(
        self,
        *,
        path: Path,
    ) -> Snapshot:
        return \
            self.__parse_snapshot_file(path=path)

    def __parse_snapshot_file(
        self,
        *,
        path: Path,
    ) -> Snapshot:
        ...

# ❌ Wrong — helper class co-located with the public class
class SnapshotReaders:
    ...

class __SnapshotParsers:  # must live in its own file
    ...

# ❌ Wrong — return-type dataclass co-located
@dataclass
class SnapshotResults:  # must live in its own file
    rows: int
    columns: int

class SnapshotReaders:
    def read_snapshot(self, *, path: Path) -> SnapshotResults:
        ...
```

---

### 9. File Size Limit

- A Python file must contain **no more than 100 physical lines in total**. This is a **hard cap** with no exceptions.
- The 100-line count includes **everything in the file**: imports, blank lines, comments, docstrings, decorators, class and function definitions, and executable code. Counting every physical line keeps the rule unambiguous and trivially measurable (`wc -l file.py`).
- The cap is intentionally tight given the verbose formatting required elsewhere in this standard (one argument per line, blank line between instructions, backslash continuation for non-trivial assignments). When a file approaches the limit, the correct response is **always to extract**, never to compress by violating the formatting rules.

> **Rationale.** The limit is a forcing function for decomposition. Combined with the "one public entry point per file" rule (Section 8), it pushes the codebase toward many small, single-purpose modules rather than a few large ones.

#### How to comply when a file grows past 100 lines

| Situation | Required action |
|---|---|
| The file contains one public function with several private sub-functions, and the privates have grown | Extract one or more private sub-functions into their **own files** as new public functions, and import them back. |
| The file contains a class with many methods | Split the class along a clear responsibility boundary into multiple smaller classes — each in its **own file** (per Section 8's one-class-per-file rule). Extract pure helpers into separate utility files of public functions. |
| The file is a constants file that has outgrown the limit | Split it into multiple thematic constants files (e.g. `column_names_constants.py`, `error_messages_constants.py`). |
| The file is a facade / suite-of-functions module | Split the suite by sub-theme into multiple facade files; each facade still must fit within 100 lines. |
| The file is a pytest test module that has grown past 100 lines | Split the tests by behaviour-under-test into multiple test files; use `@pytest.mark.parametrize` and shared fixture files to keep individual test files small. |

#### What does **not** justify exceeding the limit

- "It's just data" — long literal lists, dictionaries, or `Enum` blocks must still respect the cap; split them across multiple files by theme.
- "The formatting rules forced the line count up" — the formatting rules are non-negotiable; the file must be split instead.
- "It's a generated file" — generated Python files are still subject to the cap; adjust the generator to produce multiple files.

---

### 10. File and Folder Path Handling

- Never manipulate file paths with string concatenation.
- Always use `os.path.join()` and the `os.sep` separator to ensure cross-platform compatibility.
- Prefer `pathlib.Path` combined with `os.sep` for root-level path construction.

```python
# ✅ Correct
from pathlib import Path
import os

PARENT_FOLDER_PATH = Path('C:', os.sep, 'RootDirectory', 'Subdirectory', 'Storage')
```

---

### 11. Exception Handling

- Always catch **specific** exception types. Never use bare `except:` or `except Exception:`.
- Use a bare `raise` inside an `except` block to **re-raise** and preserve the full traceback.
- `raise NotImplementedError` is permitted for unimplemented interface methods.

```python
# ✅ Correct
try:
    load_file(path=file_path)
except FileNotFoundError:
    raise

# ❌ Wrong — swallows all exceptions and loses traceback
try:
    load_file(path=file_path)
except Exception:
    pass
```

## [REVIEW MODE] — Reviewing Code for Compliance

When reviewing Python code, check every item in the checklist below. For each violation found:

1. **Identify** the exact line or block.
2. **State** which standard is violated (reference the rule name from this skill).
3. **Provide** a corrected version of the code.

Group findings by category. Use the following checklist:

### Review Checklist

#### Naming
- [ ] Class names are `CamelCase` and plural
- [ ] Class file names match the `snake_case` of the class name
- [ ] Class instance names are `snake_case` singular
- [ ] Constants are `UPPER_CASE_WITH_UNDERSCORES`
- [ ] All other names are `snake_case`
- [ ] Function names are action-oriented (verb phrases)
- [ ] File names are actor-oriented and match the main public function name
- [ ] Boolean functions are prefixed with `is_` or `has_`
- [ ] Private methods are prefixed with `__`
- [ ] No single-letter names (except `_`, plus the language-required `self` and `cls`)
- [ ] No vague names (`process`, `handle`, `do`, `data`, `item`, `tmp`, `res`, etc.)

#### Formatting
- [ ] One empty line between instructions
- [ ] No empty line immediately after `:` in declarations or loops
- [ ] Assignments whose right-hand side is a function call or non-trivial expression use `\` continuation onto a new line
- [ ] Function arguments each on their own line
- [ ] Named argument form used in all function calls (`param=value`, no spaces around `=`)
- [ ] No line break between parameter name and its value
- [ ] `*` used as first parameter to enforce keyword-only arguments

#### Function Design
- [ ] Each function does exactly one thing
- [ ] Each function returns exactly one item (no bare tuples)
- [ ] Long or complex functions are broken into private sub-functions
- [ ] Functions with many arguments use a class for parameter passing
- [ ] Multi-process functions follow the orchestrator pattern

#### Loops and Conditionals
- [ ] `for`/`if` bodies with more than one statement are extracted to private functions
- [ ] Nested loops are hidden inside private functions
- [ ] `for` loop `in` clause is on a new line

#### Strings and Constants
- [ ] No hardcoded string literals inline in production code
- [ ] Strings defined as constants or `Enum` values in dedicated files

#### Comments
- [ ] No explanatory inline comments (code is self-explanatory)
- [ ] Only `# TODO:` or development-note comments present

#### File and Folder Structure
- [ ] Each file has one public entry point — either one public function (plus privates) or one public class (plus privates), unless it is an explicit facade
- [ ] No more than one class-like definition (class, dataclass, Enum, NamedTuple, TypedDict, Protocol, exception class) per file
- [ ] Private helpers inside a class file are functions, not classes
- [ ] `__init__.py` files are empty
- [ ] Directories with no Python code have no `__init__.py`

#### File Size
- [ ] File contains no more than 100 physical lines in total (including imports, blank lines, comments, and docstrings)
- [ ] Files approaching the limit have been decomposed by extraction, not by violating formatting rules

#### Path Handling
- [ ] No string concatenation for paths
- [ ] `os.path.join()` and `os.sep` used for all path construction

#### Exception Handling
- [ ] No bare `except:` or `except Exception:`
- [ ] Bare `raise` used inside `except` blocks to preserve traceback

---

### Review Output Format

Structure your review output as follows:

```
## Code Review — Clean Coding Standards

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

## Pytest-Specific Standards

Apply these rules whenever writing or reviewing test code. Pytest standards extend — and in two specific cases override — the general Python standards above.

### Pytest exceptions to the general rules

The following two carve-outs apply **only** to pytest test modules:

1. **Test method names are descriptive, not action-oriented.** Pytest discovery requires the `test_` prefix, after which the name describes the behaviour under test (e.g. `test_multiple_apis_runner`). This overrides the general "verb phrase" rule for function names.
2. **Test class names follow pytest discovery, not the plural-class rule.** Test classes must start with `Test` and describe the behaviour or unit under test. Pluralisation is not required (e.g. `TestUserLogin` is acceptable). This overrides the general "class names must be plural" rule.

All other rules — named arguments, no hardcoded strings, no vague names, exception handling, etc. — apply to test code unchanged.

### Structure
- Tests live in a `tests/` folder at the **repository root**, marked as the test sources root.
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
- Test **classes** must start with `Test`: e.g. `class TestAPICallServices` or `class TestUserLogin`.
- Test **methods** must start with `test_`: e.g. `def test_multiple_apis_runner(...)`.

### Design Principles
- Tests must be **small and focused** — one behaviour per test.
- Use **proper assertions** — not `assert result` but `assert result == expected_value`.
- Extract reusable test setup into **external fixture files** (avoid duplicating setup logic).
- Test **edge cases** and **negative cases**; mark expected failures with `@pytest.mark.xfail`.
- Use `@pytest.mark.parametrize` to avoid duplicating test logic for multiple inputs.
- Skip tests that depend on external causes (e.g. platform) using `@pytest.mark.skipif`.

```python
# ✅ Example — platform-conditional skip
@pytest.mark.skipif(
    condition=not is_platform_windows(),
    reason=WINDOWS_ONLY_SKIP_REASON,
)
def test_windows_specific_behaviour(...):
    ...
```
