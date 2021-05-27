const path = require("path");
const fs = require("fs");
const knownHooks = [
  "applypatch-msg",
  "pre-applypatch",
  "post-applypatch",
  "pre-commit",
  "prepare-commit-msg",
  "commit-msg",
  "post-commit",
  "pre-rebase",
  "post-checkout",
  "post-merge",
  "pre-receive",
  "update",
  "post-receive",
  "post-update",
  "pre-auto-gc",
  "post-rewrite",
  "pre-push",
];
const rootDir = path.resolve(__dirname, "..");
const basename = (n) => path.basename(n, ".sh");
const isHook = (n) => knownHooks.indexOf(basename(n)) !== -1;
const newHooks = (n) => path.join(rootDir, `hooks/${n || ""}`);
const hooks = (n) => path.join(rootDir, `.git/hooks/${n || ""}`);
const isGHook = (hook) =>
  isHook(hook) &&
  fs.readFileSync(hook, "utf-8").indexOf("#!/usr/bin/env node") === 0;

const toDisable = fs.readdirSync(hooks()).map(hooks).filter(isGHook);
const disableHook = (hook) => {
  fs.renameSync(hook, `${hook}.old-ghook`);
  process.stdout.write(` ${basename(hook)} `);
};
if (toDisable.length > 0) {
  process.stdout.write(`${toDisable.length} old ghooks to disable...`);
  toDisable.forEach(disableHook);
  process.stdout.write("Done!\n");
}

const toAdd = fs.readdirSync(newHooks()).filter(isHook);
const addHook = (name) => {
  const newHook = newHooks(name);
  const hookName = basename(name);
  const hook = hooks(hookName);
  fs.writeFileSync(hook, fs.readFileSync(newHook));
  fs.chmodSync(hook, "744");
  process.stdout.write(` ${hookName} `);
};

if (toAdd.length > 0) {
  process.stdout.write(`${toAdd.length} hooks to install...`);
  toAdd.forEach(addHook);
  process.stdout.write("Done!\nHooks installed. Write good codes, errbody!\n");
}
