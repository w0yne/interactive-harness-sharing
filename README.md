# Interactive Harness Sharing

An interactive technical presentation about harness engineering:

- Shared project rules with SOUL.md
- Project knowledge, chronological records, and replay
- Voice input and terminal control
- Multi-agent collaboration and file-based dispatch

Built with Vue, Vite, and GSAP for desktop presentations.

## Development

```sh
npm ci
npm run dev
```

## Production Build

```sh
npm run build
npm run preview
```

The application uses the `/interactive-harness-sharing/` base path.
The generated static site is in `dist/`.

## Deployment

GitHub Actions builds the site on pushes to `main` and publishes only `dist/`
to GitHub Pages. The workflow can also be started manually.

This repository is a separate publication copy. Internal source notes,
working histories, credentials, and local development artifacts are excluded.
Illustrative commands in the presentation do not execute a shell or invoke
an agent.
