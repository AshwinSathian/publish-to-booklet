# Publish to Booklet

[![CI](https://img.shields.io/github/actions/workflow/status/AshwinSathian/publish-to-booklet/ci.yml?branch=main&label=CI)](https://github.com/AshwinSathian/publish-to-booklet/actions/workflows/ci.yml)

A GitHub Action that publishes a Markdown file to [Booklet](https://booklet.ashwinsathian.com) and returns a shareable URL.

## Usage

```yaml
- uses: AshwinSathian/publish-to-booklet@v2
  id: publish
  with:
    file: CHANGELOG.md
    api-key: ${{ secrets.BOOKLET_API_KEY }}
    visibility: public

- run: echo "Published at ${{ steps.publish.outputs.url }}"
```

### Updating an existing page

Pass `page-id` to update the same page in place instead of creating a new one each run:

```yaml
- uses: AshwinSathian/publish-to-booklet@v2
  with:
    file: CHANGELOG.md
    api-key: ${{ secrets.BOOKLET_API_KEY }}
    page-id: ${{ vars.BOOKLET_PAGE_ID }}
```

### Re-running a job

A new page is published with an `Idempotency-Key` made from the workflow run ID and the file path. If you re-run a failed job, Booklet returns the page the first attempt created and does not publish a second one. A new workflow run publishes a new page; pass `page-id` to keep updating one page.

## Inputs

| Name | Required | Default | Description |
|---|---|---|---|
| `file` | Yes | — | Path to the Markdown file to publish |
| `api-key` | Yes | — | Booklet API key (store as a repo secret) |
| `page-id` | No | — | Existing page ID to update in-place |
| `visibility` | No | `unlisted` | `public` or `unlisted` |
| `base-url` | No | `https://booklet-api.ashwinsathian.com` | Booklet API base URL |

## Outputs

| Name | Description |
|---|---|
| `url` | URL of the published page |
| `id` | Page ID |

## Upgrading from v1

- v1 ignored `visibility` when it created a page, so a new page was public before Booklet 1.1.0 and unlisted after it. v2 applies the input. The default is still `unlisted`.
- v2 needs a Booklet server at 2.0 or later for the re-run behaviour. Older servers ignore the header.

## Setup

1. Create an API key at [booklet.ashwinsathian.com](https://booklet.ashwinsathian.com) → My Pages → Settings → API Keys.
2. Add it as a repo secret: **Settings → Secrets and variables → Actions → New repository secret**, named `BOOKLET_API_KEY`.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run build   # rebuilds dist/main.js; commit the result, CI's check-dist job fails PRs that forget to
```

## License

MIT. See [LICENSE](LICENSE).
