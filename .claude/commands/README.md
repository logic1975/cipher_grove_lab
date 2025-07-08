# Claude Commands

This directory contains markdown files with structured prompts and instructions for Claude to perform specific tasks on the cipher_grove_lab project.

## Available Commands

### prime.md
- **Purpose**: Initialize Claude's understanding of the project context
- **Usage**: Have Claude read this file when starting a new session
- **Actions**: Reads key project files and displays project structure

### update-docs.md
- **Purpose**: Update all project documentation to reflect current state
- **Usage**: Have Claude read and follow this file when documentation needs updating
- **Actions**: 
  - Analyzes current test counts and API endpoints
  - Updates multiple documentation files
  - Reports changes without auto-committing

## How to Use

1. Tell Claude to read the command file:
   ```
   "Please read and follow .claude/commands/update-docs.md"
   ```

2. Claude will execute the instructions in the file

3. Review the changes and commit when ready

## Philosophy

These command files provide reusable, structured instructions that ensure consistent execution of common tasks without hardcoding behaviors like automatic commits.