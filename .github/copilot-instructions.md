# Agents Instructions for shendao.poznan.pl project

Static marketing website for **ShenDao Acupuncture clinic in Poznan, Poland**, built with Ruby Middleman. Bilingual: Polish (primary) and English.

## Project Overview
- This is a Ruby Middleman static site project.
- Source files are in the `source/` directory (HTML, ERB, CSS, JS, images, layouts, partials).
- Built static files are output to the `build/` directory.
- Deployment is handled by `deploy.sh` and a GitHub Actions workflow.

## Conventions
- **Do not edit files in `build/` or `sitemap.xml` directly.**
- All content and code changes should be made in `source/` or configuration files.
- Use ERB templates for dynamic/static HTML generation.
- CSS and JS are managed in their respective folders under `source/`.

## Automation
### CI/CD Workflow
- **Build:**
  - On pull requests, GitHub Actions runs Middleman to build the site and commits changes in `build/` back to the PR.
- **Deploy:**
  - On push to `master` or manual trigger, GitHub Actions runs `deploy.sh` to deploy the site using rsync over SSH.
  - SSH configuration is handled in the workflow using secrets and `.ssh/config`.
- **Post deployment:**
  - Ask to verify the deployed site at https://shendao.poznan.pl/ and report any issues.

### Commands
```bash
bundle install              # Install dependencies
middleman server            # Dev server at http://localhost:4567
./build.sh                  # Build + HTML validation (htmlproofer) — always use this, not middleman build directly
./deploy.sh                 # Deploy via rsync over SSH to production
```

## Best Practices
- Always update `source/` files, not `build/`.
- Always build with `./build.sh` (not `bundle exec middleman build` directly) — it includes htmlproofer validation.
- Always deploy with `./deploy.sh`.
- Keep deployment logic in `deploy.sh` for consistency.
- Sensitive data (SSH keys, etc.) must be managed via GitHub Secrets.

## Directory Reference
- `source/` — All source content and templates, source of truth for edits
- `build/` — Generated static site, do not edit manually, CI updates this, read to verify changes and look of page after build
- `.github/workflows/` — CI/CD workflows
- `config.rb` — Middleman configuration
- `source/layouts/` — ERB templates for page layouts, for now only `blog.erb` for blog entries and `root.erb` for everything else
- `source/partials/` — Reusable components (contact buttons, icons, etc.)
- `AGENTS.md` - it is symlink to `.github/copilot-instructions.md`, read and write only AGENTS.md to save tokens
- `scripts/` — Standalone utility scripts unrelated to the website build; see `scripts/AGENTS.md` for details

## Page Editing Instructions
### Main page
- `index.html.erb` is the main homepage template in Polish, there is also an English version `en/index.html`
- if "na stronie" or "na stronie głównej" is mentioned then check instruction with both files
- never change title, scripts, structure unless explicitly instructed
- always check both files when making changes
- ensure if instruction can be applied to both languages, apply it to both files with respective translations
- when adding new item to training section on home page put each new entry on top of the list

### Blog posts
- blog content is Polish only, blog posts are in `source/blog/`
- when adding new blog posts, add them to `source/blog/index.html.erb` as well
- also check if Polish homepage `source/blog/index.html.erb` can link to new blog post using existing keywords
- multiple keywords on the homepage can link to the same post
- use existing post formatting as reference
- if text for blog is provided raw, properly format it using existing posts as reference
- keyword "akupunktura" should be used in every blog post at least once, in URL, title and body
- whenever any Schema.org structured data is added or modified (in blog posts or layouts), first run `./build.sh && ./deploy.sh`, and then validate using Playwright:
  1. Navigate to https://www.google.com and accept the privacy/cookie consent prompt if present
  2. Navigate to https://search.google.com/test/rich-results and test the live URL
  (the test crawls the live site, so changes must be deployed first)

## User instructions
- instructions to edit content will be provided in Polish
- fix small typos, orthographic errors, but do not change the meaning of the text

---
For automation or code generation, always follow these conventions and directory structures.
If any instruction prohibits certain actions, explicitly mention it in your response.

