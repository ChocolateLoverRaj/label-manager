> [!WARNING]
> I no longer maintain this. I switched to Rust and don't code in JS anymore. Contact me (you can email me) if you want me to put a link to a maintained alternative here.

# label-manager

![Created with ](https://img.shields.io/badge/Created%20with-@programmerraj/create-3cb371?style=flat)
[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)

## What This Does
Adds and removes labels for GitHub issues and pull requests.

## Usage

### Pnpm
This project uses [Pnpm](https://pnpm.io/) to install dependencies. Use `pnpm/action-setup` before using this action.

### Environment Variables

#### `GITHUB_TOKEN`
This variable is needed for using the GitHub API.

### Inputs

#### `manage`
A json array of label names to remove. Example: `["a", "b", "c"]`.

#### `set`
A json array of label names to add. Example: `["a"]`. All labels included in this input should also be apart of the [`manage`](#manage) input.

## Examples
```yaml
# ...
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    # ...
    - name: Setup Pnpm
      uses: pnpm/action-setup@v2.0.1
      with:
        version: 6.4
        run_install: true
    - name: Get Increment
      uses: ChocolateLoverRaj/label-manager@v1.0
      with:
        manage: '["a", "b", "c"]'
        set: '["a"]'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
Let's say that the pull request had the labels `enhancement` and `b`. `enhancement` will be kept, because it is not managed by the label manager. `b` will be removed because it *is* managed and it isn't set. `a` will be added because it is set. The final labels will be `enhancement`, `a`.

Note that it says uses: `ChocolateLoverRaj/label-manager@v1.0`. `v1.0` is a tag that will be updated to have the latest patch release. By using this tag, you can get a version with bug fixes without having to change any files. 
