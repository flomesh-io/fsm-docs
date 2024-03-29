# Contributing Guidelines

The FSM website accepts contributions via GitHub pull requests. This document outlines the requirements for contributing to this project.

This is the contribution guide for the [flomesh.io](https://flomesh.io) website. Go to [flomesh-io/fsm](https://github.com/flomesh-io/fsm/blob/main/CONTRIBUTING.md) for the core project.

## Pull Request Workflow

The following sections describe how to contribute code by opening a pull request.

### 1. Fork the [FSM Docs](https://github.com/flomesh-io/fsm-docs) repository

1. Visit `https://github.com/flomesh-io/fsm-docs`.
1. Click the `Fork` button.

### 2. Clone the new fork to your workstation

Set `GITHUB_USERNAME` to match your Github username:

```sh
export GITHUB_USERNAME=<github username>
```

Clone and set up your fork:

```sh
git clone git@github.com:$GITHUB_USERNAME/fsm-docs.git

cd osm
git remote add upstream git@github.com:flomesh-io/fsm-docs.git

# Block accidental pushes to upstream's main branch
git remote set-url --push upstream no_push

# Verify your remote
git remote -v
```

### 3. Git branch

Get your local `main` branch up to date with upstream's `main` branch:

```sh
git fetch upstream
git checkout main
git rebase upstream/main
```

Create a local branch from `main` for your development:

```sh
# While on the main branch
git checkout -b <branch name>
# ex: git checkout -b feature
```

Keep your branch up to date during development:

```sh
git fetch upstream
git rebase upstream/main

# or: git pull --rebase upstream main
```

### 4. Commit

Make code changes on the `feature` branch and commit them with your signature

```sh
git commit -s
```

Follow the [commit style guidelines](#commit-style-guideline).

Make sure to squash your commits before opening a pull request. This is preferred so that your pull request can be merged as is without requesting to be squashed before merge if possible.

### 5. Push

Push your branch to your remote fork:

```sh
git push -f <remote name> <branch name>
```

### 6. Open a pull request

1. Visit your fork at `https://github.com/$GITHUB_USERNAME/fsm-docs`.
1. Open a pull request from your `feature` branch using the `Compare & Pull Request` button.
1. Fill the pull request template and provide enough description so that it can be reviewed.

If your pull request is not ready to be reviewed, open it as a draft.

#### Get code reviewed

Your pull request will be reviewed by the maintainers to ensure correctness. Reviewers might approve the pull request or suggest improvements to make before the changes can be committed.

When addressing review comments, refrain from rewriting the Git history of your branch (e.g. with `git commit --amend` or `git rebase`) where possible to make those changes easy to review. Instead, prefer creating new commits without `--amend` and using `git merge` to resolve conflicts with the upstream branch. The commit style guidelines below will not be enforced for follow-up commits. When the PR is merged, all commits in the PR will automatically be squashed into one commit added to the upstream branch.

### Merging pull requests

Pull requests by default must be merged by a core maintainer.
Maintainers can add the `automerge` or `autorebase` label to a pull request, additional details [here](docs/automerge.md).

Pull requests will be merged based on the following criteria:

- Has at least two LGTM from a core maintainer.
- Commits follow the [commit style guidelines](#commit-style-guideline).
- Does not have the `do-not-merge/hold` label.
- Does not have the `wip` label.
- All status checks have succeeded.
- Commits in the pull request are squashed and have a valid [signature](#sign-your-work). If the commits in the PR are not squashed, maintainers must use the `squash and merge` option to squash the commits before merging. Maintainers may choose to update the commit message to meet the commit message guidelines without altering the signatures of the authors of the pull request. In certain situations, it is okay to have multiple related but independent commits in the same pull request. In such cases, a pull request may be merged as a `merge commit`.
- If the person who opened the pull request is a core maintainer, then only that person is expected to merge once it has the necessary LGTMs/reviews. Another maintainer can merge the pull request at their discretion if they feel the pull request must be merged urgently.

Maintainers may edit the commit message for `Squash and merge`d PRs to remove messages from follow-up commits.

### Commit Style Guideline

We follow a rough convention for commit messages borrowed from [Deis](https://github.com/deis/deis/blob/master/CONTRIBUTING.md#commit-style-guideline). This is an example of a commit:

```vim
feat(scripts/test-cluster): add a cluster test command

Adds test experience where there was none before
and resolves #1213243.
```

This is a more formal template:

```vim
{type}({scope}): {subject}
<BLANK LINE>
{body}
```

The `{scope}` can be anything specifying the place of the commit change. Use `*` to denote multiple areas (i.e. `scripts/*: refactored lots of stuff`).

The `{subject}` needs to use imperative, present tense: `change` not `changed` nor `changes`. The first letter should not be capitalized, and there is no dot (`.`) at the end.

Just like the `{subject}`, the message `{body}` needs to be in the present tense and includes the motivation for the change as well as a contrast with the previous behavior. The first letter in the paragraph must be capitalized. If there is an issue number associate with the chunk of work that should be mentioned in this section as well so that it may be closed once the PR with this commit is merged.

Any line of the commit message cannot be longer than 72 characters, with the subject line limited to 50 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

The allowed types for `{type}` are as follows:

```text
feat -> feature
fix -> bug fix
docs -> documentation
style -> formatting
ref -> refactoring code
test -> adding missing tests
chore -> maintenance
```

### Sign Your Work

The sign-off is a simple line at the end of the explanation for a commit. All commits needs to be
signed. Your signature certifies that you wrote the patch or otherwise have the right to contribute
the material. The rules are pretty simple, if you can certify the below (from
[developercertificate.org](https://developercertificate.org/)):

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

Then you just add a line to every git commit message:

    Signed-off-by: Joe Smith <joe.smith@example.com>

Use your real name (sorry, no pseudonyms or anonymous contributions.)

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically
with `git commit -s`.

Note: If your git config information is set properly then viewing the `git log` information for your
 commit will look something like this:

```
Author: Joe Smith <joe.smith@example.com>
Date:   Thu Feb 2 11:41:15 2018 -0800

    Update README

    Signed-off-by: Joe Smith <joe.smith@example.com>
```

Notice the `Author` and `Signed-off-by` lines match. If they don't your PR will be rejected by the
automated DCO check.


## Roadmap

We use [GitHub Project Boards](https://github.com/flomesh-io/fsm/projects) to help give a high level overview and track what work is going on and what stage it is in.

## Issues

If a bug is found, need clarification, or want to propose a feature, submit an issue using [GitHub issues](https://github.com/oflomesh-io/fsm-docs/issues).

## Semantic Versioning

FSM and the FSM documentation releases will follow [semantic versioning](https://semver.org/) for labeling releases to maintain backwards compatibility. FSM features and functionality may be added in major (x.0.0) and minor (0.x.0) releases. FSM bug fixes may be added in patch releases (0.0.x). We will follow semantic versioning to guarantee features, flags, functionality, public APIs will be backwards compatible as the versioning scheme suggests. FSM documentation will be released as part of an FSM release.

## Attribution

Please properly attribute any code that is copied or inspired by another project to the author(s) of the work. Read the license of the original project to understand how to properly attribute work from that project and include this in your pull request.
