# CI/CD Workflow Procedures

This document outlines the continuous integration and continuous deployment (CI/CD) procedures for the Libro project.

## GitHub Actions CI Workflow

The project uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/ci.yml`.

### What the CI Workflow Does

When a pull request is opened, synchronized, or reopened against the `main` branch, the CI workflow automatically:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Runs ESLint to check code quality
5. Runs all tests with Vitest and generates a coverage report
6. Uploads the coverage report as an artifact

### Branch Protection Rules

To ensure code quality, the repository is configured with branch protection rules that:

- Require all CI checks to pass before a pull request can be merged
- Require branches to be up to date with the base branch before merging

These rules are enforced through GitHub's branch protection settings.

## Setting Up Branch Protection

To set up or modify branch protection rules:

1. Go to the repository on GitHub
2. Navigate to Settings > Branches
3. Under "Branch protection rules", click "Add rule" or edit an existing rule
4. Set "Branch name pattern" to `main`
5. Enable "Require status checks to pass before merging"
6. Enable "Require branches to be up to date before merging"
7. Search for and select "Run Tests" in the status checks list
8. Save the changes

## Troubleshooting Failed CI Checks

If a CI check fails:

1. Go to the Actions tab in the repository
2. Find the failed workflow run
3. Examine the logs to identify the issue
4. Make the necessary fixes in your branch
5. Push the changes to update the pull request
6. The CI workflow will run again automatically

## Adding or Modifying CI Workflows

To modify the CI workflow:

1. Edit the `.github/workflows/ci.yml` file
2. Commit and push the changes to a branch
3. Create a pull request to test the updated workflow
4. Once approved and merged, the new workflow will be active for all future pull requests

## Related Documentation

For more detailed information, see:

- [GitHub CI/CD Configuration](.github/README.md)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
