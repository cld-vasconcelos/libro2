# Memory Bank Maintenance Procedures

## When to Update

The memory bank should be updated whenever:

1. Database Changes
   - New migration files are added
   - Update `schemas/database.md` with new table/function information
   - Update relevant procedures if migration patterns change

2. Service Layer Changes
   - New services are added
   - Service responsibilities change
   - Update `facts/architecture_services.md`

3. Project Structure Changes
   - New directories or patterns emerge
   - Update main `README.md` for high-level changes
   - Update `rules/project_conventions.md` for new conventions

4. Component Changes
   - New reusable patterns emerge
   - Update relevant schema documents
   - Document new UI conventions in rules

## How to Update

### For Database Changes

1. When adding a new migration:
   ```sql
   -- In supabase/migrations/YYYYMMDDHHMMSS_name.sql
   -- Add migration SQL
   ```
   Then:
   - Add entry to `schemas/database.md`
   - Update any affected procedures
   - Document new tables/functions

### For Service Changes

1. When adding a new service:
   ```typescript
   // In src/services/newService.ts
   // Add service implementation
   ```
   Then:
   - Add service to `facts/architecture_services.md`
   - Document service responsibilities
   - Update any related procedures

### For Convention Changes

1. When new patterns emerge:
   - Update `rules/project_conventions.md`
   - Add examples of the new convention
   - Document any exceptions

## Maintenance Rules

1. Keep Documentation Current
   - Update relevant files immediately when changes occur
   - Remove outdated information
   - Add new sections as needed

2. Maintain Consistency
   - Follow existing documentation patterns
   - Use consistent formatting
   - Keep section organization similar across files

3. Cross-Reference
   - Link related information between files
   - Maintain relationship between facts, schemas, rules, and procedures

4. Version Control
   - Commit memory bank updates with related code changes
   - Include clear commit messages explaining updates

## Quality Checks

Periodically verify:
1. All recent project changes are reflected in memory bank
2. Documentation is accurate and up-to-date
3. No contradictions exist between documents
4. All links and references are valid
5. Examples match current codebase
