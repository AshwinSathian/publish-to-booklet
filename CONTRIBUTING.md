# Contributing to publish-to-booklet

Solo-maintained, no formal process. A few things that make a PR easy to merge:

## Local setup

```bash
npm ci
npm run typecheck
npm test
```

## Before opening a PR

`dist/main.js` is committed (this action runs `using: node24` directly against it, not through a build step at execution time), so if you change `src/main.ts`:

```bash
npm run build
```

and commit the resulting `dist/main.js`. CI's `check-dist` job fails PRs that forget this.

## Scope

This action wraps a single Booklet API call (publish or update a page). Feature requests that belong in Booklet itself (auth, page management, the editor) should go to the [main Booklet repo](https://github.com/AshwinSathian/booklet) instead — open a [Discussion](https://github.com/AshwinSathian/booklet/discussions) there first for anything non-trivial.

## License

By contributing, you agree your changes are licensed under the project's [MIT license](LICENSE).
