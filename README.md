# Git Package Manager

The Git Package Manager (or _gpm_ to his closest friends) is a command line interface (CLI) tool for working with multiple interdependent Git repositories (named _packages_), running Git commands on multiple packages at once, and automatically creating symlinks between them.

- [Concepts](#concepts)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Commands](#commands)
- [Converting an existing project to _gpm_](#converting-an-existing-project-to-gpm)
- [Uninstalling the .pkg](#uninstalling-the-pkg)

# Concepts

## Package

A _package_ is a reusable module of source code corresponding to a single Git repository. It can have other packages as dependencies and/or it can itself be the dependency of another package.

## Manifest

A _manifest_ is a [YAML](https://en.wikipedia.org/wiki/YAML) metadata file that describes a package, its dependencies and symlinks to create between them. Each package must have a manifest in its repository's root.

# Getting started

## Install _git_

```bash
brew install git
```

## Install _git-flow_

```bash
brew install git-flow
```

_git-flow_ is only required for the `feature:start` and `feature:finish` commands.

## Configure your SSH key

Follow your Git server's instructions for setting up your SSH key properly (ie: [GitHub](https://help.github.com/articles/connecting-to-github-with-ssh/), [GitLab](https://docs.gitlab.com/ee/ssh/) or [BitBucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html)).

**Note:** I personally recommend not using any passphrase on your private key to keep things simple. I consider files on my computer to be safe enough, but that's up to you. If you want to remove the password from an existing private key, use the following [instructions](https://serverfault.com/a/50778).

## Install _gpm_

```bash
npm i -g @silphid/gpm
```

## Initialize your root working directory

Create an empty directory on disk where you want all your packages to be cloned, run the following command to initialize it, and sit back while the magic sparkles before your eyes:

```bash
gpm init URL -b BRANCH
```

Where `URL` is your main package's Git URL in the form `git@HOST:ACCOUNT/PACKAGE.git`

**Note**: The optional `-b BRANCH` flag allows to specify which branch to checkout (defaults to `master`).

## Enabling NerdFonts (optional)

_gpm_ displays more beautifully with _NerdFonts_, but that is totally optional. It has special symbols for things such as branches, uncommitted or staged changes and unpushed commits.

1. Download and install [NerdFonts](https://nerdfonts.com/) on your machine.
2. Configure your terminal to use _NerdFonts_.
3. Tell _gpm_ to use _NerdFonts_ for your project:

```bash
gpm nerd
```

# Usage

<!-- usage -->
```sh-session
$ npm install -g @silphid/gpm
$ gpm COMMAND
running command...
$ gpm (-v|--version|version)
@silphid/gpm/1.4.6 darwin-x64 node-v14.16.0
$ gpm --help [COMMAND]
USAGE
  $ gpm COMMAND
...
```
<!-- usagestop -->

## Listing packages

```
gpm l
```

This displays a tree of packages starting from your main package and down into its dependencies recursively. It also shows currently selected packages (see below), currently checked out branches, pending changes and commits to be pushed. It will also display a warning when currently checked out branch does not match the one its parent package depends on (as specified in its manifest).

**Note**: Most commands display the list automatically after running. To prevent this, use their `--no-list` flag.

## Selecting packages to work with

By default, all commands apply to _selected_ packages. To change that selection:

```bash
gpm s
```

_Shorthand for:_ `gpm select`

## Starting a feature branch

```
gpm start FEATURE
```

## Committing changes

1. Make sure to first review and stage your changes using your regular Git client;
2. Then commit your staged changes with:

```bash
gpm commit 'My commit message'
```

### Committing everything

_Warning: This is not the recommended approach._

If you are totally confident you want to stage and commit _all_ changes, including new files and deletions, just:

```bash
gpm commit -A 'My commit message'
```

_Shorthand for:_ `gpm add && gpm commit 'My commit message'`

## Finishing your feature branch

```bash
gpm finish
```

## Checking out an existing branch

```
gpm co BRANCH
```

_Shorthand for:_ `gpm checkout BRANCH`

## Creating and checking out a new branch

```
gpm co -b BRANCH
```

## Checking out branch specified in dependent manifests

```
gpm co -B
```

## Checking out commit specified in dependent manifests

```
gpm co -C
```

**Note**: This results in a detached HEAD. In order to make modification, create a new branch from there.

## Deleting a branch

```bash
gpm del BRANCH
```

_Shorthand for:_ `gpm delete BRANCH`

To also remove the _remote_ counterpart:

```bash
gpm del -r BRANCH
```

## Publishing manifests to registry

The following command copies a simplified version of selected manifests to the registry and then commits and pushes registry to origin:

```bash
gpm publish
```

## Applying a command only to current or to all packages

By default all commands apply to all _selected_ packages, but you may use the `-a` flag to apply them to all packages or the `-c` flag to apply them to the current package only.

For example, to pull all packages, regardless of selection, use:

```bash
gpm pull -a
```

Or to pull only current package:

```bash
gpm pull -c
```

**Note:** A package is considered current if your current working directory is set to that package's directory or any of its sub-directories.

# Commands

<!-- commands -->
* [`gpm add`](#gpm-add)
* [`gpm adjust`](#gpm-adjust)
* [`gpm checkout [BRANCH]`](#gpm-checkout-branch)
* [`gpm clean`](#gpm-clean)
* [`gpm commit MESSAGE`](#gpm-commit-message)
* [`gpm config:delete KEY`](#gpm-configdelete-key)
* [`gpm config:get KEY`](#gpm-configget-key)
* [`gpm config:ls`](#gpm-configls)
* [`gpm config:set KEY VALUE`](#gpm-configset-key-value)
* [`gpm convert [REPO]`](#gpm-convert-repo)
* [`gpm delete BRANCH`](#gpm-delete-branch)
* [`gpm dematerialize`](#gpm-dematerialize)
* [`gpm discard`](#gpm-discard)
* [`gpm finish [NAME]`](#gpm-finish-name)
* [`gpm flow`](#gpm-flow)
* [`gpm git [ARG1] [ARG2] [...]`](#gpm-git-arg-1-arg-2)
* [`gpm help [COMMAND]`](#gpm-help-command)
* [`gpm import [NAME] [BRANCH]`](#gpm-import-name-branch)
* [`gpm init [REPO]`](#gpm-init-repo)
* [`gpm link`](#gpm-link)
* [`gpm list`](#gpm-list)
* [`gpm materialize`](#gpm-materialize)
* [`gpm merge [BRANCH]`](#gpm-merge-branch)
* [`gpm nerd`](#gpm-nerd)
* [`gpm pkg:update`](#gpm-pkgupdate)
* [`gpm print`](#gpm-print)
* [`gpm pull`](#gpm-pull)
* [`gpm push`](#gpm-push)
* [`gpm resolve`](#gpm-resolve)
* [`gpm select`](#gpm-select)
* [`gpm start NAME`](#gpm-start-name)
* [`gpm tag NAME`](#gpm-tag-name)
* [`gpm unlink`](#gpm-unlink)
* [`gpm update`](#gpm-update)

## `gpm add`

Stage all changes in selected packages.

```
USAGE
  $ gpm add

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/add.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/add.ts)_

## `gpm adjust`

Adjust selected packages' dependencies to current branches and commits.

```
USAGE
  $ gpm adjust

OPTIONS
  -a, --all         include all packages
  -c, --current     include only package of current directory
  -d, --dependants  adjust manifests of dependant packages instead of selected packages themselves
  -l, --[no-]list   whether to display list after command
  -p, --prompt      prompt for packages to include for this command only
```

_See code: [src/commands/adjust.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/adjust.ts)_

## `gpm checkout [BRANCH]`

Checkout given branch in selected packages (or appropriate branch, if none specified).

```
USAGE
  $ gpm checkout [BRANCH]

ARGUMENTS
  BRANCH  branch/tag/commit to checkout in current package

OPTIONS
  -B, --branch     checkout dependency branch specified in dependent manifests
  -C, --commit     checkout dependency commit specified in dependent manifests
  -a, --all        include all packages
  -b, --create     create a new branch if it does not already exist
  -c, --current    include only package of current directory
  -d, --discard    discard all local changes
  -f, --feature    use feature branch
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only

ALIASES
  $ gpm co
```

_See code: [src/commands/checkout.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/checkout.ts)_

## `gpm clean`

Remove redundant dependencies.

```
USAGE
  $ gpm clean

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/clean.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/clean.ts)_

## `gpm commit MESSAGE`

Commit all staged changes in selected packages.

```
USAGE
  $ gpm commit MESSAGE

ARGUMENTS
  MESSAGE  commit message

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
  -s, --staged     only commit staged changes
```

_See code: [src/commands/commit.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/commit.ts)_

## `gpm config:delete KEY`

Delete given config property.

```
USAGE
  $ gpm config:delete KEY

ARGUMENTS
  KEY  key of property
```

_See code: [src/commands/config/delete.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/config/delete.ts)_

## `gpm config:get KEY`

Get value of given configuration property.

```
USAGE
  $ gpm config:get KEY

ARGUMENTS
  KEY  key of property
```

_See code: [src/commands/config/get.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/config/get.ts)_

## `gpm config:ls`

List all configuration properties.

```
USAGE
  $ gpm config:ls
```

_See code: [src/commands/config/ls.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/config/ls.ts)_

## `gpm config:set KEY VALUE`

Set configuration property to given value.

```
USAGE
  $ gpm config:set KEY VALUE

ARGUMENTS
  KEY    key of property
  VALUE  value of property
```

_See code: [src/commands/config/set.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/config/set.ts)_

## `gpm convert [REPO]`

Convert existing Git repository to GPM package.

```
USAGE
  $ gpm convert [REPO]

ARGUMENTS
  REPO  URL of Git repository to convert to package

OPTIONS
  -l, --[no-]list  whether to display list after command
```

_See code: [src/commands/convert.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/convert.ts)_

## `gpm delete BRANCH`

Delete local (and optionally remote) branch in selected packages.

```
USAGE
  $ gpm delete BRANCH

ARGUMENTS
  BRANCH  name of branch to delete

OPTIONS
  -a, --all          include all packages
  -c, --current      include only package of current directory
  -f, --feature      use feature branch
  -l, --[no-]list    whether to display list after command
  -p, --prompt       prompt for packages to include for this command only
  -r, --[no-]remote  also delete remote branch

ALIASES
  $ gpm del
```

_See code: [src/commands/delete.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/delete.ts)_

## `gpm dematerialize`

Reverse materialize command by copying files back to their original dependency locations and recreating symlinks pointing to them.

```
USAGE
  $ gpm dematerialize

OPTIONS
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command

ALIASES
  $ gpm demat
```

_See code: [src/commands/dematerialize.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/dematerialize.ts)_

## `gpm discard`

Discard all local changes in selected packages.

```
USAGE
  $ gpm discard

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/discard.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/discard.ts)_

## `gpm finish [NAME]`

Finish feature branch in selected packages.

```
USAGE
  $ gpm finish [NAME]

ARGUMENTS
  NAME  name of feature (branch name will be 'feature/{username}/{feature}')

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/finish.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/finish.ts)_

## `gpm flow`

Configure git flow in selected packages.

```
USAGE
  $ gpm flow

OPTIONS
  -a, --all          include all packages
  -c, --current      include only package of current directory
  -l, --[no-]list    whether to display list after command
  -p, --prompt       prompt for packages to include for this command only
  --develop=develop  develop branch to use for git flow
  --master=master    master branch to use for git flow
  --user=user        user name to use for git flow feature branches
```

_See code: [src/commands/flow.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/flow.ts)_

## `gpm git [ARG1] [ARG2] [...]`

Execute arbitrary git command on selected packages.

```
USAGE
  $ gpm git [ARG1] [ARG2] [...]

ARGUMENTS
  ARG1  first argument
  ARG2  second argument
  ...   other arguments

OPTIONS
  -a, --all      include all packages
  -c, --current  include only package of current directory
  -p, --prompt   prompt for packages to include for this command only
```

_See code: [src/commands/git.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/git.ts)_

## `gpm help [COMMAND]`

display help for gpm

```
USAGE
  $ gpm help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `gpm import [NAME] [BRANCH]`

Add a dependency to selected packages.

```
USAGE
  $ gpm import [NAME] [BRANCH]

ARGUMENTS
  NAME    Name of dependency to add (defaults to prompting user)
  BRANCH  Branch of dependency (defaults to currently checked out branch)

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/import.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/import.ts)_

## `gpm init [REPO]`

Configure current directory as root, clone main package and its dependencies, and create symlinks between them.

```
USAGE
  $ gpm init [REPO]

ARGUMENTS
  REPO  main package Git URL in the form git@github.com:my_account/package_name.git[#branch]

OPTIONS
  -b, --branch=branch  [default: master] main package branch to checkout
  -l, --[no-]list      whether to display list after command
  --develop=develop    develop branch to use for git flow
  --master=master      master branch to use for git flow
  --user=user          user name to use for git flow feature branches
```

_See code: [src/commands/init.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/init.ts)_

## `gpm link`

Create symlinks in selected packages.

```
USAGE
  $ gpm link

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/link.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/link.ts)_

## `gpm list`

List all packages hierarchically, with their current branch.

```
USAGE
  $ gpm list

OPTIONS
  -a, --all       do not skip redundant sub-trees
  -b, --branches  list all local branches

DESCRIPTION
  If there is a mismatch between currently checked out branch and branch expected in dependency, it also displays a 
  warning.

ALIASES
  $ gpm ls
  $ gpm l
```

_See code: [src/commands/list.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/list.ts)_

## `gpm materialize`

Remove symlinks and replace them with copies of original files.

```
USAGE
  $ gpm materialize

OPTIONS
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command

DESCRIPTION
  To reverse this command, use the dematerialize command.

  Warning: Use at your own risk, as you will be working with copies of your dependencies and changes to those won't 
  appear in your actual dependency folders until you dematerialize your links. That command can be useful very 
  temporarily to work with tools (such as debuggers) that are unsettled by symlinks. You can only materialize links in a 
  single module at once, to avoid having multiple copies of the same files and to make sure changes to those files can 
  be copied back to the original files upon dematerialization.

ALIASES
  $ gpm mat
```

_See code: [src/commands/materialize.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/materialize.ts)_

## `gpm merge [BRANCH]`

Merge given branch of selected packages into current branch.

```
USAGE
  $ gpm merge [BRANCH]

ARGUMENTS
  BRANCH  name of branch to merge into current branch

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -f, --feature    use feature branch
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
  --abort          abort current merge operation
```

_See code: [src/commands/merge.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/merge.ts)_

## `gpm nerd`

Configure gpm to use NerdFonts for nicer display.

```
USAGE
  $ gpm nerd

OPTIONS
  --off  turn NerdFonts off

DESCRIPTION
  NerdFonts has special symbols for things like branches, uncommitted or staged changes and unpushed commits. First 
  download the font from https://nerdfonts.com, install it on your machine and configure it in your terminal. Then run 
  this command in your project to tell gpm to use it.
```

_See code: [src/commands/nerd.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/nerd.ts)_

## `gpm pkg:update`

[Deprecated: Use 'gpm adjust' instead] Adjust selected packages' dependencies to current branches and commits.

```
USAGE
  $ gpm pkg:update

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only

ALIASES
  $ gpm pkg:up
```

_See code: [src/commands/pkg/update.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/pkg/update.ts)_

## `gpm print`

Print manifest file of selected packages.

```
USAGE
  $ gpm print

OPTIONS
  -a, --all      include all packages
  -c, --current  include only package of current directory
  -p, --prompt   prompt for packages to include for this command only
```

_See code: [src/commands/print.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/print.ts)_

## `gpm pull`

Pull selected packages.

```
USAGE
  $ gpm pull

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/pull.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/pull.ts)_

## `gpm push`

Push selected packages.

```
USAGE
  $ gpm push

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/push.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/push.ts)_

## `gpm resolve`

Resolve conflicts in manifest files of selected packages.

```
USAGE
  $ gpm resolve

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -o, --ours       whether to resolve using ours (HEAD)
  -p, --prompt     prompt for packages to include for this command only
  -t, --theirs     whether to resolve using theirs (HEAD)
```

_See code: [src/commands/resolve.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/resolve.ts)_

## `gpm select`

Select which packages to include by default in all commands.

```
USAGE
  $ gpm select

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -n, --none       deselect all packages

ALIASES
  $ gpm s
```

_See code: [src/commands/select.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/select.ts)_

## `gpm start NAME`

Create feature branch in selected packages.

```
USAGE
  $ gpm start NAME

ARGUMENTS
  NAME  name of feature (branch name will be 'feature/{username}/{feature}')

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/start.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/start.ts)_

## `gpm tag NAME`

Create and push tag in selected packages.

```
USAGE
  $ gpm tag NAME

ARGUMENTS
  NAME  name of tag to create

OPTIONS
  -a, --all      include all packages
  -c, --current  include only package of current directory
  -p, --prompt   prompt for packages to include for this command only
```

_See code: [src/commands/tag.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/tag.ts)_

## `gpm unlink`

Delete symlinks in selected packages.

```
USAGE
  $ gpm unlink

OPTIONS
  -a, --all        include all packages
  -c, --current    include only package of current directory
  -l, --[no-]list  whether to display list after command
  -p, --prompt     prompt for packages to include for this command only
```

_See code: [src/commands/unlink.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/unlink.ts)_

## `gpm update`

Update dependencies of selected packages (pull registry, clone/pull packages, create symlinks).

```
USAGE
  $ gpm update

OPTIONS
  -a, --all         include all packages
  -c, --current     include only package of current directory
  -l, --[no-]links  whether to create symlinks
  -l, --[no-]list   whether to display list after command
  -p, --prompt      prompt for packages to include for this command only
  -p, --[no-]pull   whether to pull changes

ALIASES
  $ gpm up
```

_See code: [src/commands/update.ts](https://github.com/silphid/gpm/blob/v1.4.6/src/commands/update.ts)_
<!-- commandsstop -->

# Converting an existing project to _gpm_

## Create a _manifest_ for each package

Create a `package.yaml` manifest file (as described below, in the _Manifest file format_ section) in the root of each package's repository.

## Setup a _registry_ repository

Create an empty Git repository that will act as _registry_ for your manifests. Copy all your package manifests into the root folder of that repository, while taking care of renaming them to `<package-name>.yaml`.

## Manifest file format

A manifest file looks like this:

```yaml
repo: 'git@github.com:my-account/my-package.git'
links:
  exports: path/to/sources/to/be/exposed/to/dependents
  imports: path/where/dependencies/symlinks/will/be/created
  internals:
    - source: path/where/symlink1/points
      target: path/where/symlink1/will/be/created
    - source: path/where/symlink2/points
      target: path/where/symlink2/will/be/created
dependencies:
  - repo: 'git@github.com:my-account/sub-package1.git'
    branch: master
    commit: 8a30553c0f322bf776706aa88074aaebe48751d2
  - repo: 'git@github.com:my-account/sub-package2.git'
    branch: master
    commit: 2d1991446ab31e54e24230e08454414413c6a654
```

**Note**: Values containing any special YAML character (`:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `\`) must be enclosed within double-quotes (such as the `repository` property in above example).

### repository

URL of this package's Git repository, such as it would be provided to the `git clone` command.

Note: The name of the repository is determined by the last part of the URL without the `.git` extension.

### links.exports

Relative path within this package to expose to dependent packages as symlink.

Only useful if this package _is_ a dependency of some other package.

**Optional**: Defaults to root directory of package.

#### Exporting multiple sources directories as symlinks

To expose multiple directories as symlinks, specify an object instead of a string, where each key is the name of the link to create and the value is the directory to expose:

```yaml
links:
  exports:
    first: path/to/first/sources/dir
    second: path/to/second/sources/dir
    third: path/to/third/sources/dir
```

### links.imports

Relative path where to create all dependencies' symlinks.

Only useful if this package _has_ dependencies.

**Optional**: When omitted, not external symlinks are created.

### links.internals

List of symlinks to create internally (both source _and_ target are within this same package).

**Optional**: When omitted, not internal symlinks are created.

Each item in list must have the following properties:

#### source

Path to directory the symlink will be pointing to.

#### target

Path where to create symlink, including symlink name.

### dependencies

List of this package's dependencies URLs that will be automatically cloned/pull when executing the `gpm update` command. Each dependency can have the following properties:

#### repo

Required Git URL of dependency repository.

#### branch

Optional branch to use (defaults to `master`).

#### commit

Optional commit SHA1. That property is automatically set when dependency is checked out to a different branch or commit. It is used to allow switching branch or going back to a specific point in time in a coherent fashion across multiple packages. For example, if you checkout an arbitrary old commit in your main branch, you can then use the following command to also checkout all dependency packages to the exact commits that were referenced at that time:

```bash
gpm co -aC
```

You would then be on detached HEADs. If you want to create new branches starting from those commits, in order to make modifications, use:

```bash
gpm co -ab BRANCH
```

Or, to switch back to branches specified in manifests:

```bash
gpm co -aB
```

# Uninstalling the .pkg

**Warning**: Make sure you know what you are doing! You could potentially harm your system badly!

Run this command to find the tool's install location:

```bash
pkgutil --pkg-info com.silphid.gpm
```

In front of `location:` you should see something like `usr/local/lib/gpm`.

Then run the following command with your own location value (notice the extra leading `/`):

```bash
sudo rm -rf /usr/local/lib/gpm
```

To clean-up even further, you can remove the receipt with:

```bash
sudo pkgutil --forget com.silphid.gpm
```

For more information, refer to this article: [Uninstalling packages (.pkg files) on Mac OS X](<https://wincent.com/wiki/Uninstalling_packages_(.pkg_files)_on_Mac_OS_X>)

# Release notes

## v1.4.5

- Add `gpm materialize/mat` and `gpm dematerialize/demat` commands to convert symlinks into physical copies of the folders they point to and back into symlinks. That command can be useful very temporarily to work with tools (such as debuggers) that are unsettled by symlinks.
- Fix `gpm unlink` to actually delete symlinks.

## v1.4.4

- `gpm finish` now is performed in bottom-up order to ensure manifests are updated correctly with latest branch/commit (to avoid needing a `gpm adjust` + `gpm commit` afterwards).
- Add `--prompt` / `-p` flag to most commands, to prompt for which packages to apply current command to (previous selection is maintained for future commands).
- Add `--feature / -f` flag to `gpm merge` (automatically prefix branch name with `feature/USERNAME/`, just like other branch-related commands).
- `gpm commit` now defaults to committing _all_ changes (instead of only staged ones). Use `--staged / -s` to commit only staged changes.
- `gpm finish`, `gpm merge` and `gpm pull` should no longer prompt for commit messages.

## v1.4.3

- `gpm resolve` now automatically stages resolved manifest files.
- Fix `gpm commit` to not skip repositories in merging state, even if they have no changes.

## v1.4.2

- Add `gpm unlink` to delete symlinks in selected packages' imports folder.
- All commands that create symlinks will delete existing symlinks first.
- Fix `gpm discard` to also delete untracked files.

## v1.4.1

- Change `gpm pull` to use merge instead of rebase.
- Tolerate conflict markers in manifest files.
  - Automatically resolves conflicted manifest files in-memory to HEAD to allow gpm to load them and remain functional.
- Add to `gpm select` command the flags `--all/-a`, `--current/-c` and `--none/-n` to quickly select all/current/no packages.
- Add `gpm resolve` command to resolve conflicts in manifest files either to `--ours` or `--theirs` (defaults to ours).
- Add `gpm flow` command to configure git flow branches.
- Add `gpm git` command to invoke arbitrary git commands on all selected packages (ie: `gpm git status`).

## v1.4.0

- Add `gpm merge` command to merge a branch into selected packages.
- Remove `repo` property from manifests (was redundant and could become out-of-sync with reality).
