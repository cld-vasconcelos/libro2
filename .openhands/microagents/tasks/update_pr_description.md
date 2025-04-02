---
name: Update PR Description
description: Generates comprehensive pull request descriptions from code changes
type: task
triggers: [update pr description, generate pr description, improve pr description]
author: OpenHands
version: 1.0.0
---

# PR Description Generator

Generates detailed, standardized pull request descriptions based on code changes.

## Usage

```bash
claude update pr description
claude update pr description --branch feature/auth-flow
claude update pr description --sections "summary,changes,testing"
```

## Process

1. Analyze Branch Changes
```bash
git rev-parse --abbrev-ref HEAD  # Get current branch
git log origin/main..HEAD --oneline  # Get commits
git diff origin/main..HEAD --stat  # Get changes
```

2. Generate Description Sections

### Title
Format: `type(scope): description`
Example: `feat(auth): implement OAuth login flow`

### Summary
```markdown
## Summary
[Brief description of changes]

## Impact
🎯 **Scope**: frontend
🔄 **Type**: feature
📊 **Risk**: medium
```

### Changes
```markdown
## Changes

### Added
- New features/files added

### Modified
- Changes to existing code

### Removed
- Removed features/files
```

### Testing
```markdown
## Testing

### Added Tests
- List new tests

### Modified Tests
- Changes to existing tests

### Coverage Impact
- Coverage changes
```

3. Update PR

Use GitHub CLI:
```bash
gh pr edit [number] --body "$(cat description.md)"
```

## Validation

### Required
- Git repository
- GitHub CLI access
- Branch with changes
- Commit history

### Optional
- Custom sections
- Base branch override
- Description template

## Examples

### Basic Update
```bash
# Current branch
claude update pr description

# Specific branch
claude update pr description --branch feature/auth
```

### Custom Sections
```bash
# Selected sections
claude update pr description --sections "summary,testing"

# Custom template
claude update pr description --template template.md
```

## Best Practices

- Include relevant changes
- Keep sections focused
- List affected areas
- Document testing
- Note dependencies
- Highlight risks
