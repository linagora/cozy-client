This folder contains scripts to run cozy-client requests.

## How to run a script

First start the stack.

Example: to run the script file named `perfs`:

```
cd cozy-client/packages/cozy-client/examples
node perfs.js
```

And then accept permissions / login.

During the first login, it might crash with a `ERR_UNHANDLED_REJECTION`

In that case, just run again the `node perfs.js` command and login again.

It should work.
