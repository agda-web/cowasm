# CoWasm: Collaborative WebAssembly for Servers and Browsers

## Some Quick Notes about the overall plan

- **The overall project is still NOT stable or usable for any purpose YET.**

- We are in the process of renaming this project CoWasm, which means "collaborative Web Assembly", since it's foundational for CoCalc, and goes far beyond just Python.  It will support various technologies \(such as git and realtime sync\) that are important foundations for collaboration.

- The underlying software components we are building on \(i.e., that we didn't write\) are mostly extremely stable and mature.  The only component that isn't is zig.  However, most of what we use Zig for is a convenient packaging of clang/llvm and musl\-libc, which are themselves both very mature.  Many other components, such as Python, Dash, Numpy, etc., are extremely mature.

- The goal of CoWasm is overall similar to all of emscripten, [WebAssembly.sh](http://WebAssembly.sh), [wapm.io](http://wapm.io), and Pyodide in various ways.
  - Unlike [WebAssembly.sh](http://WebAssembly.sh) and [wapm.io](http://wapm.io) \(but similar to Pyodide\), we make heavy use of dynamic libraries \(e.g., \-fPIC code\), which is only possible because of a plugin contributed by emscripten to LLVM.
  - We use actual editline \(similar to readline\) instead of a Javascript terminal.  Moreover, unlike other webassembly shells, we just use a real command line shell \(dash = Debian Almquest Shell\).  We also have a userspace including ports of many coreutils, e.g., ls, head, tail, etc.
  - Unlike emscripten, we use modern Typescript, our code is more modular, and we make use of existing components when possible \(e.g., the nodejs memfs project\), instead of using our own.
  - A core design constraint is to efficiently run on a wide range of platforms, not mainly in the browser like emscripten, and not mainly on servers like wasmer.  CoWasm should run on servers, desktops \(e.g., as an electron app\), an iPad/iOS app, and in web browsers.
  - CoWasm is extremely liberally licensed \(mostly 3\-clause BSD\).  CoCalc will extend CoWasm to provide a graphical interface and realtime collaboration, and that will be a commercial product.

## More

> WebAssembly Python for servers and browsers. Built using Zig. Supports extension modules such as numpy and posix subprocesses. Does not use Emscripten.

URL: https://github.com/sagemathinc/cowasm

**The overall project was called "Zython", which is meant to indicate that we use Zig heavily to make Python available.** The most important package in the project is called `python-wasm`, which is a build of Python for WebAssembly.

DEMOS:

- https://zython.org (uses Service Workers)
- https://zython.cocalc.com (uses Atomics and SharedArrayBuffers)

<!--
[<img src="https://github.com/sagemathinc/zython/actions/workflows/docker-image.yml/badge.svg"  alt="Docker Image CI"  width="172px"  height="20px"  style="object-fit:cover"/>](https://github.com/sagemathinc/zython/actions/workflows/docker-image.yml)
-->

## Try the python-wasm REPL under node.js

```py
wstein@max x4 % npx python-wasm
Welcome to Node.js v16.13.0.
Type ".help" for more information.
> Python 3.11.0b4 (main, Jul 27 2022, 04:39:08) [Clang 14.0.6 (git@github.com:ziglang/zig-bootstrap.git dbc902054739800b8c1656dc on wasi
Type "help", "copyright", "credits" or "license" for more information.
>>> 2 + 3
5
>>> import sys; sys.version
'3.11.0b4 (main, Jul 27 2022, 04:39:08) [Clang 14.0.6 (git@github.com:ziglang/zig-bootstrap.git dbc902054739800b8c1656dc'
>>> sys.platform
'wasi'
```

## Install python\-wasm into your project, and try it via the library interface and the node.js terminal

```sh
npm install python-wasm
```

Then from the nodejs REPL:

```js
> python = require('python-wasm')
> await python.init();
> await python.exec('import sys')
undefined
> await python.repr('sys.version')
"'3.11.0b3 (main, Jul 14 2022, 22:22:40) [Clang 13.0.1 (git@github.com:ziglang/zig-bootstrap.git 623481199fe17f4311cbdbbf'"
> await python.repr('sys.platform')
'wasi'
```

There is also a readline\-based REPL that is part of python\-wasm:

```py
> python.terminal()
Python 3.11.0b3 (main, Jul 14 2022, 22:22:40) [Clang 13.0.1 (git@github.com:ziglang/zig-bootstrap.git 623481199fe17f4311cbdbbf on wasi
Type "help", "copyright", "credits" or "license" for more information.
>>> 2 + 3   # you can edit using readline
5
>>> input('name? ')
name? william  <-- I just typed "william"
'william'
>>> quit()  # or ctrl+d
>
```

You can also use python\-wasm in your [web application via webpack](https://github.com/sagemathinc/zython/tree/main/packages/webpack), but your webserver must set certain headers which [github pages does not set](https://github.com/github-community/community/discussions/13309).

## Build python\-wasm from source on Linux or MacOS

### Prerequisites

To build everything from source, make sure that you have standard command line dev tools installed. Then build, which [takes 15\-20 minutes](https://github.com/sagemathinc/wapython/actions), and around 1GB of disk space:

```sh
wstein@max % make
```

This installs a specific version of Zig and Nodejs, then builds native and WebAssembly versions of CPython and many dependencies, and also builds all the Typescript code. Building from source is _**tested on Linux and MacOS with both x86_64 and ARM \(M1\) processors**_:

- Linux: tested on both x86_64 and aarch64 Ubuntu with standard dev tools installed; see [Dockerfile](./Dockerfile) where we install `apt-get install -y git make cmake curl dpkg-dev m4 yasm texinfo python-is-python3 autotools-dev automake libtool tcl vim zip`
- MacOS: tested on both x86_64 and M1 mac with standard XCode command live dev tools installed.

If you're using Windows, you'll have to use Linux via a virtual machine \(or maybe WSL\) to build python\-wasm from source.

NOTE: Sometimes the build will randomly crash due to some sort of caching issue.  This is due to a bug in Zig, and just typing `make` to restart the build almost always works around it. It'll also likely just go away as zig improves (they are constantly fixing bugs, and I'm constantly upgrading).

### Try out your build

Run some tests, which won't take too long:

```sh
make test
```

Note that running `make test` at the top level of `python-wasm` does NOT run the full cpython test suite yet, since it takes quite a while and there are **still numerous failures**. Instead, it runs unit tests of individual packages in `python-wasm`.

You can also use the WebAssembly repl directly on the command line. The script to start it is called `zython`:

```sh
wstein@max % ./bin/zython
Python 3.11.0b3 (main, Jul  8 2022, 23:21:07) [Clang 13.0.1 (git@github.com:ziglang/zig-bootstrap.git 81f0e6c5b902ead84753490d on wasi
Type "help", "copyright", "credits" or "license" for more information.
>>> 2+3
5
>>> import sys; sys.platform
'wasi'
```

Next use python\-wasm as a library in node.js:

```sh
wstein@max % . bin/env.sh
wstein@max % cd packages/python-wasm
# Now actually use the module:
wstein@max % node
Welcome to Node.js v18.7.0.
> python = require('.')
> await python.init();
> await python.repr('31**37')
'15148954872646847105498509334067131813327318808179940511'
> await python.exec('import time; t=time.time(); print(sum(range(10**7)), time.time()-t)')
49999995000000 0.8420002460479736
```

## What's the goal?

Our **primary goal** is to create a WebAssembly build of the core Python and dependent packages, which runs both on the command line with Node.js and in the major web browsers \(via npm modules that you can include via webpack\). It should also be relatively easy to _build from source_ on both Linux and MacOS \(x86*64 and aarch64\) and to easily run the \_cpython test suite,* with a clearly defined supported list of passing tests. The build system is based on [Zig](https://ziglang.org/), which provides excellent caching and cross compilation.

This package is focused on _**the cpython core**_, not the entire Python package ecosystem. That will be the topic of another package later.

## How does this compare to Pyodide?

This particular package is just the core cpython, not a large Python ecosystem like Pyodide provides. However, we do plan to have other packages that depend on this one that do provide a wide range of precompiled packages.

Our main longterm application is to make [CoCalc](https://cocalc.com) more efficient. As such, we are building a foundation here on which to support a substantial part of the scientific Python ecosystem and the [SageMath packages](https://www.sagemath.org/) \(a pure math analogue of the scientific Python stack\). I'm the original founder of SageMath, hence this motivation. This will be part of a new GPL'd project that will have this BSD\-licensed project `python-wasm` at its core; some relevant work has been done [here](https://github.com/sagemathinc/jsage).

Some of our code will be written in the [Zig](https://ziglang.org/) language. However, we are mostly targeting just the parts that are used for Python, which is a small subset of the general problem. Our software license \-\- _**BSD 3\-clause**_ \-\- is compatible with their's and we hope to at least learn from their solutions to problems.

[More about how Pyodide and python\-wasm differ...](./docs/differences-from-pyodide.md)

## More about building from source

### How to build

Just type make. \(Do **NOT** type `make -j8;` it might not work...\)

```sh
...$ make
```

This runs a single top level makefile to build all the packages. The build process for all individual packages is _also_ accomplished using a Makefile. We don't use shell scripts or Python code to orchestrate building anything, since `make` is much cleaner and easier to read, maintain and debug.

### What happens

In most subdirectories `foo` of packages, this will create some subdirectories:

- `packages/foo/dist/[native|wasm]` -- a native or WebAssembly build of the package; this has binaries, headers, and libs. These get used by other packages.
- `packages/build/[native|wasm]` - build artifacts for the native or WebAssembly build; can be safely deleted

### No common prefix directory

Unlike some systems, where everything is built and installed into a single `prefix` directory, here we build everything in its own self\-contained package. When a package like `cpython` depends on another package like `lzma` , our Makefile for `cpython` explicitly references `packages/lzma/dist`. This makes it easier to uninstall packages, update them, etc., without having to track what files are in any package, whereas using a common directory for everything can be a mess with possibly conflicting versions of files, and makes versioning and dependencies very explicit. Of course, it makes the environment variables and build commands potentially much longer.

### Native and Wasm

The build typically create directories `dist/native`and `dist/wasm.` The `dist/native` artifacts are only of value on the computer where you ran the build, since they are architecture dependent and can easily depend on libraries on your system. In contrast, the `dist/wasm` artifacts are platform independent. They can be used nearly everywhere: on servers via WASM, on ARM computers \(e.g., aarch64 linux, Apple Silicon, etc.\), and in any modern web browser \(though many details remain, obviously\).

### Standalone WASM executables

The bin directory has scripts `zcc` and `z++` that are C and C\+\+ compiler wrappers around Zig \+ Node. They create binaries that you can run on the command line as normal. Under the hood there's a wrapper script that calls node.js and the wasi runtime.

```sh
$ . bin/env.sh
$ echo 'int main() { printf("hello from Web Assembly: %d\n", 2+2); }' > a.c
$ zcc a.c
$ ls -l
a.c  a.out  a.out.wasm  ...
$ ./a.out   # this actually runs nodejs + python-wasm
hello from Web Assembly: 4
```

This isn't currently used here for building python-wasm, but it's an extremely powerful tool. \(For example, I used it with JSage to cross compile the NTL library to Web Assembly...\)

### Run a script from the terminal:

```sh
~/python-wasm$ echo "import sys; print(f'hi from {sys.platform}')" > a.py
~/python-wasm$ bin/zython a.py
hi from wasi
```

## Benchmarks

There is a collection of cpu\-intensive benchmarks in [packages/bench/src](./packages/bench/src), which you can run under various Python interpreters by running

```sh
your-python-interpreter src/all.py
```

Here are some grand total times. The timings are pretty stable, and the parameters of the benchmarks are chosen so a single benchmark doesn't unduly impact the results \(e.g., it is trivial to game any such benchmark by adjusting parameters\).

| Python                                                                  | x86_64 Linux | MacOS M1 max | aarch64 Linux (docker on M1 max) |
| :---------------------------------------------------------------------- | :----------: | :----------: | :------------------------------: |
| PyPy 3.9.x (Python reimplemented with a JIT)                            |   2997 ms    |   2127 ms    |       1514 ms (ver 3.6.9)        |
| pylang (Javascript Python -- see https://github.com/sagemathinc/pylang) |   6909 ms    |   2876 ms    |             4424 ms              |
| Native CPython 3.11                                                     |   9284 ms    |   4491 ms    |             4607 ms              |
| WebAssembly CPython (python-wasm)                                       |   23109 ms   |   12171 ms   |             12909 ms             |

<br/>

The quick summary is that in each case pypy is twice as fast as pylang \(basically node.js\), python\-lang is twice as fast as cpython, and _**native cpython is about 2.5x\-2.8x as fast as python\-wasm**_. However, when you study the individual benchmarks, there are some significant differences. E.g., in `brython.py` there is a benchmark "create instance of simple class" and it typically takes 4x\-5x longer in WebAssembly versus native CPython.

---

## Contact

Email [wstein@cocalc.com](mailto:wstein@cocalc.com) if you find this interesting and want to help out. **This is an open source 3\-clause BSD licensed project.**

