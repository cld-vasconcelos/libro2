# Memory Bank Integration Rules

## Core Requirements

1. Memory Bank Updates are **Mandatory**
   - All significant changes to the project MUST be reflected in the memory bank
   - Updates to the memory bank should be committed alongside code changes
   - No PR should be merged without corresponding memory bank updates if needed

2. Update Timing
   - Memory bank updates must happen in the same commit as the related code changes
   - Do not batch memory bank updates or postpone them for later

## What Must Be Documented

1. Database Changes
   - All new migrations
   - Schema changes
   - Policy changes
   - New functions or procedures

2. Service Layer Changes
   - New services
   - Modified service responsibilities
   - API changes
   - Integration changes

3. Code Patterns
   - New conventions
   - Architectural decisions
   - Component patterns
   - Type definitions

4. Project Structure
   - Directory organization changes
   - New file naming patterns
   - Resource location changes

## Documentation Standards

1. File Organization
   - Use appropriate directory (`facts/`, `procedures/`, `schemas/`, `rules/`)
   - Maintain clear, descriptive filenames
   - Group related information together

2. Content Quality
   - Be clear and concise
   - Include examples where helpful
   - Keep information accurate and current
   - Remove outdated information

3. Cross-Referencing
   - Link related documents where appropriate
   - Maintain consistent terminology
   - Update all affected documents

## Validation Steps

Before committing changes:

1. Review affected memory bank sections
2. Verify documentation accuracy
3. Check cross-references
4. Update timestamp or version info if used
5. Ensure commits include both code and documentation changes

## Exceptions

Memory bank updates may be skipped ONLY for:
1. Minor formatting changes
2. Documentation typo fixes
3. Development environment configuration changes
4. Temporary experimental changes

## Enforcement

1. Code Review Requirements
   - Reviewers must check for memory bank updates
   - Missing documentation should block PR approval
   - Updates must be accurate and complete

2. Maintenance
   - Regular audits of memory bank accuracy
   - Cleanup of outdated information
   - Verification of cross-references
