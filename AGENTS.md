# Agent Instructions

These instructions apply to all agent-driven work in this repository.

## Mandatory Clean-Code Standards

When the user asks to create, refactor, or review code, use the language-specific standard below as the default authority:

- Python (`.py`): `a_docs/agents/clean_code/python/general_clean_coding_standards_skill.md`
- Node.js ESM (`.js`, `.mjs`): `a_docs/agents/clean_code/node_js/general_clean_coding_standards_skill_nodejs.md`

## Required Behavior

- Detect the target language before writing or reviewing code.
- For Python work, apply the Python standard unconditionally.
- For Node.js work, apply the Node.js standard unconditionally.
- For code generation or refactoring, follow the document's `[WRITE MODE]`.
- For code review, follow the document's `[REVIEW MODE]` checklist and cite the violated rule names when reporting issues.
- If a task spans both languages, apply each standard only to the matching files.
- Do not apply the Python standard to Node.js files.
- Do not apply the Node.js standard to Python files.
- For languages without a documented standard in `a_docs/agents/clean_code/`, follow existing repository conventions and state that no repository clean-code standard exists yet for that language.

## Change Scope

- When touching an existing file that does not fully comply yet, improve the touched code toward the relevant standard without creating unrelated churn.
- If the user explicitly asks for a review, review against the relevant clean-code standard in addition to normal correctness, regression, and test-risk checks.
