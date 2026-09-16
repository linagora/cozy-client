![npm-badge-cozy-client](https://badge.fury.io/js/cozy-client.svg)

# cozy-client

- **Describe** your data and their **relationships**
- **Fetch** data from your Cozy and put it in a normalized **store**
- **Refresh** your React components when your data changes
- Have your data available **offline**

`cozy-client` is a convenient yet powerful way to bind `cozy-stack` queries to your (p)React components — but you can still benefit of it if you're not using React!

## Getting started

To get started with cozy-client, follow [this tutorial](docs/getting-started.md).

## Architecture

If you want to better understand the cozy-client concepts, see the [architecture doc](docs/architecture.md). 

## Advanced

- API docs
  - [cozy-client](docs/api/cozy-client/README.md)
  - [cozy-pouch-link](docs/api/cozy-pouch-link.md)
  - [cozy-stack-client](docs/api/cozy-stack-client.md)

- [Relationships](docs/relationships.md)
- [Mobile guide](docs/mobile-guide.md)
- [Link authoring](docs/link-authoring.md)

> This is the documentation for the current version of cozy-client. If you want to check the old version, [go to the old version](http://github.com/cozy/cozy-client-js) 👵👴.

## Contributing

Use Node 24 and Yarn 4

```bash
yarn install
yarn build         # required before tests: packages resolve each other from dist/
yarn lint
yarn test
yarn docs          # regenerates docs/api/** (typedoc)
yarn types         # regenerates packages/*/types/** (tsc, from JSDoc)
yarn bench         # micro-benchmarks, see packages/cozy-client/benchmarks/README.md
```

ℹ `docs/api/**` and `packages/*/types/**` are committed. CI regenerates them and fails if they differ from what you pushed, so run `yarn docs` and `yarn types` before every push and commit the result.

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (checked by commitlint). Agent rules live in [AGENTS.md](AGENTS.md), publishing and linking in [docs/dev.md](docs/dev.md).
