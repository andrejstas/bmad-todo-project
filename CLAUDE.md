# Environment

You are running inside an isolated Linux VM (Lima). Only this directory is mounted and writable:

    /Users/andrejstas/Projects/Nearform/bmad

Do not attempt to create, read, or modify files outside this directory — they do not exist.
Any tools, packages, or configuration installed outside this directory (e.g. in /usr, ~/.config)
will be lost if the VM is recreated.

## Available tools

- **Node.js 22** and **npm**
- **yarn** (via corepack)
- **git** (no credentials configured — no SSH keys or git user/email are available)
- **build-essential** (gcc, g++, make)
- **curl**

You can use these freely. If you need additional packages, install them with `sudo apt-get install <package>`,
but note they will be lost if the VM is recreated.
