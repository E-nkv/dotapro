# [dotapro.org](https://dotapro.org)

> An open source, completely free-to-use platform for professional Dota 2 analytics.

## Quick Start

```bash
git clone https://github.com/E-nkv/dotapro.git
cd dotapro
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The app queries [OpenDota](https://www.opendota.com) directly — no database or API server required.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router/Query
- **Data**: OpenDota SQL explorer API (client-side)
- **Hosting**: Cloudflare Pages (static SPA, output in `dist/`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT
