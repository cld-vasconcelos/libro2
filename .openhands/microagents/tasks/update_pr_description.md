# Update Pull Request Description

Generates comprehensive PR descriptions based on code changes, ensuring consistent and informative pull requests.

## Trigger
"update pr description", "generate pr description", "improve pr description"

## Inputs
- PR branch name (optional)
- Base branch name (optional, defaults to 'main')
- Custom sections to include (optional)

## Steps

1. Gather PR Information
```bash
# Get current branch name if not provided
git rev-parse --abbrev-ref HEAD

# Get commits since branching from base
git log origin/main..HEAD --oneline
```

2. Analyze Changes
```bash
# Get detailed changes
git diff origin/main..HEAD --stat

# Get changed files by type
git diff origin/main..HEAD --name-only
```

3. Generate Description Sections

### Title
- Extract from branch name or commit messages
- Format: `type(scope): description`
- Example: `feat(auth): implement OAuth login flow`

### Summary
```markdown
## Summary
[Brief description of changes and their purpose]

## Impact
- 🎯 **Scope**: [frontend/backend/full-stack]
- 🔄 **Type**: [feature/bugfix/refactor/etc]
- 📊 **Risk Level**: [low/medium/high]
```

### Changes
```markdown
## Changes
### Added
- New features or files added
### Modified
- Changes to existing functionality
### Removed
- Removed features or files

## Implementation Details
[Technical details about the implementation]
```

### Testing
```markdown
## Testing
### Added Tests
- List of new tests
### Modified Tests
- Changes to existing tests
### Coverage Impact
- Coverage changes if any
```

### Dependencies
```markdown
## Dependencies
- New dependencies added
- Updated dependencies
- Removed dependencies
```

4. Format Final Description
```markdown
# [PR Title]

## Summary
[Generated summary]

## Changes
[Generated changes]

## Testing
[Generated testing section]

## Dependencies
[Generated dependencies section]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Migration scripts added (if needed)
- [ ] Breaking changes documented
```

5. Update PR Description
- Use GitHub API or GitHub CLI to update PR description
- Handle errors and provide feedback

## Validation

### Required Files
- Ensure .git directory exists
- Check GitHub CLI or API access

### Success Criteria
- Generated description includes all required sections
- Code changes accurately reflected
- Testing information complete
- Dependencies documented

### Error Handling
- Handle missing git repository
- Handle API/CLI access errors
- Handle invalid branch names

## Examples

### Basic Usage
```bash
# Generate description for current branch
claude update pr description

# Generate for specific branch
claude update pr description --branch feature/auth-flow
```

### Custom Sections
```bash
# Include specific sections
claude update pr description --sections "summary,changes,testing"
```

### With Base Branch
```bash
# Compare with different base branch
claude update pr description --base develop
```

## Notes
- Requires git repository
- GitHub CLI or API access needed
- Custom sections can be added
- Auto-detects common patterns
- Supports multiple PR description templates
