Publishing
----------

We use lerna for publishing, from the CI: each push to master versions the
packages from the commits (`lerna version`), then publishes them
(`lerna publish from-package`) in the `Publish` job of `.github/workflows/ci-cd.yml`.

The job authenticates to npm with
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC): there is
no npm token. It runs in the `npm` GitHub environment, on master only.

lerna pushes the version commit and the tags before it publishes. If the publish
then fails, run the `CI/CD` workflow by hand on master (`Run workflow`): it
publishes every version missing from the registry.

A new package must exist on npm and have a trusted publisher before its first
merge to master, or the publish of every package fails:

1. Publish a `0.0.0` placeholder by hand: set the version to `0.0.0` locally (do
   not commit it) and run `npm publish`.
2. On npmjs.com, add a trusted publisher to the package: `linagora` /
   `cozy-client` / `ci-cd.yml` / environment `npm`, with "Allow npm publish"
   checked. The configuration expires unless the package is released within 2 days.

### By hand

```
lerna publish
```

These options are useful

* `--scope` to only care about one package

```
lerna publish --scope cozy-client
```

* `--npm-tag` to change the default npm-tag (latest). Useful if you are testing
and don't want your users to end up with your changes.

```
$ lerna publish --scope cozy-client --npm-tag beta
$ npm install cozy-client@beta
```

⚠️ Even if you use an NPM tag, this creates a real version on NPM. If you want to create
a beta version, change the version in the package.json of the package you are publishing
and add for example `beta.0`. This way, you do not take the space of the next version.

* `--force-publish` to force publication even if there were no changes

```
lerna publish --scope cozy-client --force-publish cozy-client
```

Linking
-------

Use `yarn watch` to watch on cozy-client side and `yarn link` on the app side.

If you have a problem like "React is not found" from cozy-client files, it may be because node is resolving the dependencies in cozy-client's `node_modules`, you may want to `ln -s` your app node_modules inside cozy-client's.

```
$ ls code
cozy-banks
cozy-client

$ cd cozy-client/packages/cozy-client
$ rm -rf node_modules
$ ln -s ~/code/cozy-banks/node_modules .
```
