# Contributing to TalentHub

First off, thank you for considering contributing to TalentHub! It's people like you that make TalentHub such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript and React styleguides
* Include screenshots and animated GIFs in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Process

### Setup Development Environment

1. Fork the repo
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make your changes
6. Test your changes
7. Commit your changes: `git commit -m 'Add some feature'`
8. Push to the branch: `git push origin feature/my-feature`
9. Submit a pull request

### Coding Standards

#### TypeScript
* Use TypeScript for all new code
* Define proper types, avoid `any`
* Use interfaces for object shapes
* Export types from `lib/types.ts`

#### React
* Use functional components with hooks
* Follow the existing component structure
* Keep components focused and reusable
* Use proper prop types

#### Styling
* Use Tailwind CSS utility classes
* Follow the existing design system
* Ensure responsive design
* Test on multiple screen sizes

#### Database
* Always use parameterized queries
* Implement proper RLS policies
* Add indexes for performance
* Document schema changes

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

**Format:**
```
type(scope): subject

body

footer
```

**Types:**
* `feat`: New feature
* `fix`: Bug fix
* `docs`: Documentation changes
* `style`: Code style changes (formatting, etc)
* `refactor`: Code refactoring
* `test`: Adding tests
* `chore`: Maintenance tasks

**Examples:**
```
feat(submissions): add file upload support

- Implement Supabase Storage integration
- Add file type validation
- Update submission form UI

Closes #123
```

### Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Test on multiple browsers
* Test responsive design
* Test with different user roles

### Documentation

* Update README.md if needed
* Add JSDoc comments for functions
* Update type definitions
* Document new environment variables

## Project Structure

```
app/          - Next.js pages and routes
components/   - Reusable React components
lib/          - Utility functions and server actions
database/     - SQL migration scripts
utils/        - Helper utilities
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to TalentHub! 🚀
