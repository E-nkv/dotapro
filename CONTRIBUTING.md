# Contributing

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/dotapro.git
cd dotapro
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Making Changes

1. Create a branch: `git checkout -b feature/your-thing`
2. Make your changes
3. Run `pnpm lint` and `pnpm build`
4. Open a PR

## Regenerating Static Game Data

```bash
node src/scripts/generate-constants.js
```
