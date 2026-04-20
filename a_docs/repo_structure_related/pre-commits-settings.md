# Pre-Commit, Branching, and Local Tooling Settings

This document defines the minimum local workflow expectations for contributors working in this repository. It covers:

- the branching model
- pre-commit expectations
- MCP setup currently used by the team
- the local process for Codex skills

## Branching Model

### Protected Branches

The following branches are protected and must only be updated through pull requests:

- `main`
- `staging`
- `first_review`

Direct pushes to these branches are not part of the expected workflow.

### Where New Work Starts

All new work branches must be created from `first_review`.

Expected promotion flow:

`feature branch -> first_review -> staging -> main`

### Branch Naming Rules

Branch names must follow this pattern:

`first_review_<user_credentials>_<feature_name>`

Rules:

- use underscores only
- do not use dashes
- keep names short and readable
- prefer lowercase names

Example:

`first_review_jdoe_api_client_cleanup`

## Pre-Commit Expectations

This repository currently contains Python package and test structure, so the initial pre-commit baseline should be Python-first. If other languages are added later, this document should be extended with language-specific checks before those changes are merged.

### Goals

Pre-commit checks should catch problems before code reaches pull request review. At minimum, they should help enforce:

- consistent formatting
- linting and basic static checks
- simple repository hygiene checks
- fast-running test coverage for changed code

### Recommended Local Setup

Install and enable `pre-commit` locally:

```bash
python -m pip install pre-commit
pre-commit install
pre-commit run --all-files
```

### Minimum Python Baseline

Until the repository standard is finalized, the expected Python pre-commit coverage should include:

- whitespace and end-of-file normalization
- basic YAML, JSON, and TOML validation when those files are added
- Python formatting
- Python linting
- a fast unit-test pass

Suggested first implementation:

- `ruff format`
- `ruff check`
- `pytest c_tests/universal/unit`

If the team chooses different tools, this document and the repository configuration should be updated together.

### Required Follow-Up Decisions

The following items still need to be finalized in the repository itself:

- add a root `.pre-commit-config.yaml`
- pin the formatter, linter, and hook versions
- decide whether hooks may auto-fix issues before commit
- define which test subset is allowed in pre-commit and which tests remain CI-only
- document language-specific hooks if non-Python code is introduced

## MCP Configuration

### Atlassian MCP

Add the Atlassian MCP with:

```bash
codex mcp add atlassian --url https://mcp.atlassian.com/v1/mcp
```

If additional MCPs become part of the team workflow, add them here with:

- the install command
- the purpose of the MCP
- any authentication or access prerequisites

## Agentic AI Skills

The team should maintain a clear local process for creating and installing Codex skills.

### Recommended Local Skill Process

1. Create a new skill directory under `$CODEX_HOME/skills/<skill_name>/`.
2. Add a `SKILL.md` file that explains when the skill should be used and the workflow it follows.
3. Add any supporting scripts, templates, or assets inside the same skill directory.
4. Test the skill locally by invoking it in Codex.
5. Update team documentation if the skill becomes part of the shared workflow.

### What Should Be Documented for Each Skill

Each shared skill should document:

- its purpose
- trigger conditions
- required tools or external services
- expected inputs and outputs
- any setup or installation steps

## Summary

Current mandatory rules already defined for this repository are:

- `main`, `staging`, and `first_review` are PR-only branches
- all new branches start from `first_review`
- branch names must use the `first_review_<user_credentials>_<feature_name>` pattern
- underscores are allowed, dashes are not

The remaining pre-commit and skill details should now be implemented in repository configuration so this document matches the real workflow.
