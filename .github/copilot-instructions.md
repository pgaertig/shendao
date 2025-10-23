# Copilot Instructions for shendao.poznan.pl

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
- **Build:**
  - On pull requests, GitHub Actions runs Middleman to build the site and commits changes in `build/` back to the PR.
- **Deploy:**
  - On push to `master` or manual trigger, GitHub Actions runs `deploy.sh` to deploy the site using rsync over SSH.
  - SSH configuration is handled in the workflow using secrets and `.ssh/config`.

## Best Practices
- Always update `source/` files, not `build/`.
- Test locally with `bundle exec middleman build` before pushing.
- Keep deployment logic in `deploy.sh` for consistency.
- Sensitive data (SSH keys, etc.) must be managed via GitHub Secrets.

## Directory Reference
- `source/` — All source content and templates
- `build/` — Generated static site (do not edit manually)
- `.github/workflows/` — CI/CD workflows
- `deploy.sh` — Deployment script
- `config.rb` — Middleman configuration

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

## User instructions
- instructions to edit content will be provided in Polish
- fix small typos, orthographic errors, but do not change the meaning of the text

---
For automation or code generation, always follow these conventions and directory structures.
If any instruction prohibits certain actions, explicitly mention it in your response.

