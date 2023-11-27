/*

This project is based from the Node implementation made by Gus Caplan
https://github.com/devsnek/node-wasi
However, JavaScript WASI is focused on:
 * Bringing WASI to the Browsers
 * Make easy to plug different filesystems
 * Provide a type-safe api using Typescript


Copyright 2019 Gus Caplan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

 */
const WASI_ESUCCESS = 0;
const WASI_E2BIG = 1;
const WASI_EACCES = 2;
const WASI_EADDRINUSE = 3;
const WASI_EADDRNOTAVAIL = 4;
const WASI_EAFNOSUPPORT = 5;
const WASI_EAGAIN = 6;
const WASI_EALREADY = 7;
const WASI_EBADF = 8;
const WASI_EBADMSG = 9;
const WASI_EBUSY = 10;
const WASI_ECANCELED = 11;
const WASI_ECHILD = 12;
const WASI_ECONNABORTED = 13;
const WASI_ECONNREFUSED = 14;
const WASI_ECONNRESET = 15;
const WASI_EDEADLK = 16;
const WASI_EDESTADDRREQ = 17;
const WASI_EDOM = 18;
const WASI_EDQUOT = 19;
const WASI_EEXIST = 20;
const WASI_EFAULT = 21;
const WASI_EFBIG = 22;
const WASI_EHOSTUNREACH = 23;
const WASI_EIDRM = 24;
const WASI_EILSEQ = 25;
const WASI_EINPROGRESS = 26;
const WASI_EINTR = 27;
const WASI_EINVAL = 28;
const WASI_EIO = 29;
const WASI_EISCONN = 30;
const WASI_EISDIR = 31;
const WASI_ELOOP = 32;
const WASI_EMFILE = 33;
const WASI_EMLINK = 34;
const WASI_EMSGSIZE = 35;
const WASI_EMULTIHOP = 36;
const WASI_ENAMETOOLONG = 37;
const WASI_ENETDOWN = 38;
const WASI_ENETRESET = 39;
const WASI_ENETUNREACH = 40;
const WASI_ENFILE = 41;
const WASI_ENOBUFS = 42;
const WASI_ENODEV = 43;
const WASI_ENOENT = 44;
const WASI_ENOEXEC = 45;
const WASI_ENOLCK = 46;
const WASI_ENOLINK = 47;
const WASI_ENOMEM = 48;
const WASI_ENOMSG = 49;
const WASI_ENOPROTOOPT = 50;
const WASI_ENOSPC = 51;
const WASI_ENOSYS = 52;
const WASI_ENOTCONN = 53;
const WASI_ENOTDIR = 54;
const WASI_ENOTEMPTY = 55;
const WASI_ENOTRECOVERABLE = 56;
const WASI_ENOTSOCK = 57;
const WASI_ENOTSUP = 58;
const WASI_ENOTTY = 59;
const WASI_ENXIO = 60;
const WASI_EOVERFLOW = 61;
const WASI_EOWNERDEAD = 62;
const WASI_EPERM = 63;
const WASI_EPIPE = 64;
const WASI_EPROTO = 65;
const WASI_EPROTONOSUPPORT = 66;
const WASI_EPROTOTYPE = 67;
const WASI_ERANGE = 68;
const WASI_EROFS = 69;
const WASI_ESPIPE = 70;
const WASI_ESRCH = 71;
const WASI_ESTALE = 72;
const WASI_ETIMEDOUT = 73;
const WASI_ETXTBSY = 74;
const WASI_EXDEV = 75;
const WASI_ENOTCAPABLE = 76;
const WASI_SIGABRT = 0;
const WASI_SIGALRM = 1;
const WASI_SIGBUS = 2;
const WASI_SIGCHLD = 3;
const WASI_SIGCONT = 4;
const WASI_SIGFPE = 5;
const WASI_SIGHUP = 6;
const WASI_SIGILL = 7;
const WASI_SIGINT = 8;
const WASI_SIGKILL = 9;
const WASI_SIGPIPE = 10;
const WASI_SIGQUIT = 11;
const WASI_SIGSEGV = 12;
const WASI_SIGSTOP = 13;
const WASI_SIGTERM = 14;
const WASI_SIGTRAP = 15;
const WASI_SIGTSTP = 16;
const WASI_SIGTTIN = 17;
const WASI_SIGTTOU = 18;
const WASI_SIGURG = 19;
const WASI_SIGUSR1 = 20;
const WASI_SIGUSR2 = 21;
const WASI_SIGVTALRM = 22;
const WASI_SIGXCPU = 23;
const WASI_SIGXFSZ = 24;
const WASI_FILETYPE_UNKNOWN = 0;
const WASI_FILETYPE_BLOCK_DEVICE = 1;
const WASI_FILETYPE_CHARACTER_DEVICE = 2;
const WASI_FILETYPE_DIRECTORY = 3;
const WASI_FILETYPE_REGULAR_FILE = 4;
const WASI_FILETYPE_SOCKET_DGRAM = 5;
const WASI_FILETYPE_SOCKET_STREAM = 6;
const WASI_FILETYPE_SYMBOLIC_LINK = 7;
const WASI_FDFLAG_APPEND = 0x0001;
const WASI_FDFLAG_DSYNC = 0x0002;
const WASI_FDFLAG_NONBLOCK = 0x0004;
const WASI_FDFLAG_RSYNC = 0x0008;
const WASI_FDFLAG_SYNC = 0x0010;
const WASI_RIGHT_FD_DATASYNC = BigInt(0x0000000000000001);
const WASI_RIGHT_FD_READ = BigInt(0x0000000000000002);
const WASI_RIGHT_FD_SEEK = BigInt(0x0000000000000004);
const WASI_RIGHT_FD_FDSTAT_SET_FLAGS = BigInt(0x0000000000000008);
const WASI_RIGHT_FD_SYNC = BigInt(0x0000000000000010);
const WASI_RIGHT_FD_TELL = BigInt(0x0000000000000020);
const WASI_RIGHT_FD_WRITE = BigInt(0x0000000000000040);
const WASI_RIGHT_FD_ADVISE = BigInt(0x0000000000000080);
const WASI_RIGHT_FD_ALLOCATE = BigInt(0x0000000000000100);
const WASI_RIGHT_PATH_CREATE_DIRECTORY = BigInt(0x0000000000000200);
const WASI_RIGHT_PATH_CREATE_FILE = BigInt(0x0000000000000400);
const WASI_RIGHT_PATH_LINK_SOURCE = BigInt(0x0000000000000800);
const WASI_RIGHT_PATH_LINK_TARGET = BigInt(0x0000000000001000);
const WASI_RIGHT_PATH_OPEN = BigInt(0x0000000000002000);
const WASI_RIGHT_FD_READDIR = BigInt(0x0000000000004000);
const WASI_RIGHT_PATH_READLINK = BigInt(0x0000000000008000);
const WASI_RIGHT_PATH_RENAME_SOURCE = BigInt(0x0000000000010000);
const WASI_RIGHT_PATH_RENAME_TARGET = BigInt(0x0000000000020000);
const WASI_RIGHT_PATH_FILESTAT_GET = BigInt(0x0000000000040000);
const WASI_RIGHT_PATH_FILESTAT_SET_SIZE = BigInt(0x0000000000080000);
const WASI_RIGHT_PATH_FILESTAT_SET_TIMES = BigInt(0x0000000000100000);
const WASI_RIGHT_FD_FILESTAT_GET = BigInt(0x0000000000200000);
const WASI_RIGHT_FD_FILESTAT_SET_SIZE = BigInt(0x0000000000400000);
const WASI_RIGHT_FD_FILESTAT_SET_TIMES = BigInt(0x0000000000800000);
const WASI_RIGHT_PATH_SYMLINK = BigInt(0x0000000001000000);
const WASI_RIGHT_PATH_REMOVE_DIRECTORY = BigInt(0x0000000002000000);
const WASI_RIGHT_PATH_UNLINK_FILE = BigInt(0x0000000004000000);
const WASI_RIGHT_POLL_FD_READWRITE = BigInt(0x0000000008000000);
const WASI_RIGHT_SOCK_SHUTDOWN = BigInt(0x0000000010000000);
const RIGHTS_ALL = WASI_RIGHT_FD_DATASYNC |
    WASI_RIGHT_FD_READ |
    WASI_RIGHT_FD_SEEK |
    WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    WASI_RIGHT_FD_SYNC |
    WASI_RIGHT_FD_TELL |
    WASI_RIGHT_FD_WRITE |
    WASI_RIGHT_FD_ADVISE |
    WASI_RIGHT_FD_ALLOCATE |
    WASI_RIGHT_PATH_CREATE_DIRECTORY |
    WASI_RIGHT_PATH_CREATE_FILE |
    WASI_RIGHT_PATH_LINK_SOURCE |
    WASI_RIGHT_PATH_LINK_TARGET |
    WASI_RIGHT_PATH_OPEN |
    WASI_RIGHT_FD_READDIR |
    WASI_RIGHT_PATH_READLINK |
    WASI_RIGHT_PATH_RENAME_SOURCE |
    WASI_RIGHT_PATH_RENAME_TARGET |
    WASI_RIGHT_PATH_FILESTAT_GET |
    WASI_RIGHT_PATH_FILESTAT_SET_SIZE |
    WASI_RIGHT_PATH_FILESTAT_SET_TIMES |
    WASI_RIGHT_FD_FILESTAT_GET |
    WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    WASI_RIGHT_FD_FILESTAT_SET_SIZE |
    WASI_RIGHT_PATH_SYMLINK |
    WASI_RIGHT_PATH_UNLINK_FILE |
    WASI_RIGHT_PATH_REMOVE_DIRECTORY |
    WASI_RIGHT_POLL_FD_READWRITE |
    WASI_RIGHT_SOCK_SHUTDOWN;
const RIGHTS_BLOCK_DEVICE_BASE = RIGHTS_ALL;
const RIGHTS_BLOCK_DEVICE_INHERITING = RIGHTS_ALL;
const RIGHTS_CHARACTER_DEVICE_BASE = RIGHTS_ALL;
const RIGHTS_CHARACTER_DEVICE_INHERITING = RIGHTS_ALL;
const RIGHTS_REGULAR_FILE_BASE = WASI_RIGHT_FD_DATASYNC |
    WASI_RIGHT_FD_READ |
    WASI_RIGHT_FD_SEEK |
    WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    WASI_RIGHT_FD_SYNC |
    WASI_RIGHT_FD_TELL |
    WASI_RIGHT_FD_WRITE |
    WASI_RIGHT_FD_ADVISE |
    WASI_RIGHT_FD_ALLOCATE |
    WASI_RIGHT_FD_FILESTAT_GET |
    WASI_RIGHT_FD_FILESTAT_SET_SIZE |
    WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    WASI_RIGHT_POLL_FD_READWRITE;
const RIGHTS_REGULAR_FILE_INHERITING = BigInt(0);
const RIGHTS_DIRECTORY_BASE = WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    WASI_RIGHT_FD_SYNC |
    WASI_RIGHT_FD_ADVISE |
    WASI_RIGHT_PATH_CREATE_DIRECTORY |
    WASI_RIGHT_PATH_CREATE_FILE |
    WASI_RIGHT_PATH_LINK_SOURCE |
    WASI_RIGHT_PATH_LINK_TARGET |
    WASI_RIGHT_PATH_OPEN |
    WASI_RIGHT_FD_READDIR |
    WASI_RIGHT_PATH_READLINK |
    WASI_RIGHT_PATH_RENAME_SOURCE |
    WASI_RIGHT_PATH_RENAME_TARGET |
    WASI_RIGHT_PATH_FILESTAT_GET |
    WASI_RIGHT_PATH_FILESTAT_SET_SIZE |
    WASI_RIGHT_PATH_FILESTAT_SET_TIMES |
    WASI_RIGHT_FD_FILESTAT_GET |
    WASI_RIGHT_FD_FILESTAT_SET_TIMES |
    WASI_RIGHT_PATH_SYMLINK |
    WASI_RIGHT_PATH_UNLINK_FILE |
    WASI_RIGHT_PATH_REMOVE_DIRECTORY |
    WASI_RIGHT_POLL_FD_READWRITE;
const RIGHTS_DIRECTORY_INHERITING = RIGHTS_DIRECTORY_BASE | RIGHTS_REGULAR_FILE_BASE;
const RIGHTS_SOCKET_BASE = WASI_RIGHT_FD_READ |
    WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    WASI_RIGHT_FD_WRITE |
    WASI_RIGHT_FD_FILESTAT_GET |
    WASI_RIGHT_POLL_FD_READWRITE |
    WASI_RIGHT_SOCK_SHUTDOWN;
const RIGHTS_SOCKET_INHERITING = RIGHTS_ALL;
const RIGHTS_TTY_BASE = WASI_RIGHT_FD_READ |
    WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
    WASI_RIGHT_FD_WRITE |
    WASI_RIGHT_FD_FILESTAT_GET |
    WASI_RIGHT_POLL_FD_READWRITE;
const RIGHTS_TTY_INHERITING = BigInt(0);
const WASI_CLOCK_REALTIME = 0;
const WASI_CLOCK_MONOTONIC = 1;
const WASI_CLOCK_PROCESS_CPUTIME_ID = 2;
const WASI_CLOCK_THREAD_CPUTIME_ID = 3;
const WASI_EVENTTYPE_CLOCK = 0;
const WASI_EVENTTYPE_FD_READ = 1;
const WASI_EVENTTYPE_FD_WRITE = 2;
const WASI_FILESTAT_SET_ATIM = 1 << 0;
const WASI_FILESTAT_SET_ATIM_NOW = 1 << 1;
const WASI_FILESTAT_SET_MTIM = 1 << 2;
const WASI_FILESTAT_SET_MTIM_NOW = 1 << 3;
const WASI_O_CREAT = 1 << 0;
const WASI_O_DIRECTORY = 1 << 1;
const WASI_O_EXCL = 1 << 2;
const WASI_O_TRUNC = 1 << 3;
const WASI_PREOPENTYPE_DIR = 0;
const WASI_DIRCOOKIE_START = 0;
const WASI_STDIN_FILENO = 0;
const WASI_STDOUT_FILENO = 1;
const WASI_STDERR_FILENO = 2;
const WASI_WHENCE_SET = 0;
const WASI_WHENCE_CUR = 1;
const WASI_WHENCE_END = 2;
// http://man7.org/linux/man-pages/man3/errno.3.html
const ERROR_MAP = {
    E2BIG: WASI_E2BIG,
    EACCES: WASI_EACCES,
    EADDRINUSE: WASI_EADDRINUSE,
    EADDRNOTAVAIL: WASI_EADDRNOTAVAIL,
    EAFNOSUPPORT: WASI_EAFNOSUPPORT,
    EALREADY: WASI_EALREADY,
    EAGAIN: WASI_EAGAIN,
    // EBADE: WASI_EBADE,
    EBADF: WASI_EBADF,
    // EBADFD: WASI_EBADFD,
    EBADMSG: WASI_EBADMSG,
    // EBADR: WASI_EBADR,
    // EBADRQC: WASI_EBADRQC,
    // EBADSLT: WASI_EBADSLT,
    EBUSY: WASI_EBUSY,
    ECANCELED: WASI_ECANCELED,
    ECHILD: WASI_ECHILD,
    // ECHRNG: WASI_ECHRNG,
    // ECOMM: WASI_ECOMM,
    ECONNABORTED: WASI_ECONNABORTED,
    ECONNREFUSED: WASI_ECONNREFUSED,
    ECONNRESET: WASI_ECONNRESET,
    EDEADLOCK: WASI_EDEADLK,
    EDESTADDRREQ: WASI_EDESTADDRREQ,
    EDOM: WASI_EDOM,
    EDQUOT: WASI_EDQUOT,
    EEXIST: WASI_EEXIST,
    EFAULT: WASI_EFAULT,
    EFBIG: WASI_EFBIG,
    EHOSTDOWN: WASI_EHOSTUNREACH,
    EHOSTUNREACH: WASI_EHOSTUNREACH,
    // EHWPOISON: WASI_EHWPOISON,
    EIDRM: WASI_EIDRM,
    EILSEQ: WASI_EILSEQ,
    EINPROGRESS: WASI_EINPROGRESS,
    EINTR: WASI_EINTR,
    EINVAL: WASI_EINVAL,
    EIO: WASI_EIO,
    EISCONN: WASI_EISCONN,
    EISDIR: WASI_EISDIR,
    ELOOP: WASI_ELOOP,
    EMFILE: WASI_EMFILE,
    EMLINK: WASI_EMLINK,
    EMSGSIZE: WASI_EMSGSIZE,
    EMULTIHOP: WASI_EMULTIHOP,
    ENAMETOOLONG: WASI_ENAMETOOLONG,
    ENETDOWN: WASI_ENETDOWN,
    ENETRESET: WASI_ENETRESET,
    ENETUNREACH: WASI_ENETUNREACH,
    ENFILE: WASI_ENFILE,
    ENOBUFS: WASI_ENOBUFS,
    ENODEV: WASI_ENODEV,
    ENOENT: WASI_ENOENT,
    ENOEXEC: WASI_ENOEXEC,
    ENOLCK: WASI_ENOLCK,
    ENOLINK: WASI_ENOLINK,
    ENOMEM: WASI_ENOMEM,
    ENOMSG: WASI_ENOMSG,
    ENOPROTOOPT: WASI_ENOPROTOOPT,
    ENOSPC: WASI_ENOSPC,
    ENOSYS: WASI_ENOSYS,
    ENOTCONN: WASI_ENOTCONN,
    ENOTDIR: WASI_ENOTDIR,
    ENOTEMPTY: WASI_ENOTEMPTY,
    ENOTRECOVERABLE: WASI_ENOTRECOVERABLE,
    ENOTSOCK: WASI_ENOTSOCK,
    ENOTTY: WASI_ENOTTY,
    ENXIO: WASI_ENXIO,
    EOVERFLOW: WASI_EOVERFLOW,
    EOWNERDEAD: WASI_EOWNERDEAD,
    EPERM: WASI_EPERM,
    EPIPE: WASI_EPIPE,
    EPROTO: WASI_EPROTO,
    EPROTONOSUPPORT: WASI_EPROTONOSUPPORT,
    EPROTOTYPE: WASI_EPROTOTYPE,
    ERANGE: WASI_ERANGE,
    EROFS: WASI_EROFS,
    ESPIPE: WASI_ESPIPE,
    ESRCH: WASI_ESRCH,
    ESTALE: WASI_ESTALE,
    ETIMEDOUT: WASI_ETIMEDOUT,
    ETXTBSY: WASI_ETXTBSY,
    EXDEV: WASI_EXDEV
};
const SIGNAL_MAP = {
    [WASI_SIGHUP]: "SIGHUP",
    [WASI_SIGINT]: "SIGINT",
    [WASI_SIGQUIT]: "SIGQUIT",
    [WASI_SIGILL]: "SIGILL",
    [WASI_SIGTRAP]: "SIGTRAP",
    [WASI_SIGABRT]: "SIGABRT",
    [WASI_SIGBUS]: "SIGBUS",
    [WASI_SIGFPE]: "SIGFPE",
    [WASI_SIGKILL]: "SIGKILL",
    [WASI_SIGUSR1]: "SIGUSR1",
    [WASI_SIGSEGV]: "SIGSEGV",
    [WASI_SIGUSR2]: "SIGUSR2",
    [WASI_SIGPIPE]: "SIGPIPE",
    [WASI_SIGALRM]: "SIGALRM",
    [WASI_SIGTERM]: "SIGTERM",
    [WASI_SIGCHLD]: "SIGCHLD",
    [WASI_SIGCONT]: "SIGCONT",
    [WASI_SIGSTOP]: "SIGSTOP",
    [WASI_SIGTSTP]: "SIGTSTP",
    [WASI_SIGTTIN]: "SIGTTIN",
    [WASI_SIGTTOU]: "SIGTTOU",
    [WASI_SIGURG]: "SIGURG",
    [WASI_SIGXCPU]: "SIGXCPU",
    [WASI_SIGXFSZ]: "SIGXFSZ",
    [WASI_SIGVTALRM]: "SIGVTALRM"
};

export { ERROR_MAP, RIGHTS_ALL, RIGHTS_BLOCK_DEVICE_BASE, RIGHTS_BLOCK_DEVICE_INHERITING, RIGHTS_CHARACTER_DEVICE_BASE, RIGHTS_CHARACTER_DEVICE_INHERITING, RIGHTS_DIRECTORY_BASE, RIGHTS_DIRECTORY_INHERITING, RIGHTS_REGULAR_FILE_BASE, RIGHTS_REGULAR_FILE_INHERITING, RIGHTS_SOCKET_BASE, RIGHTS_SOCKET_INHERITING, RIGHTS_TTY_BASE, RIGHTS_TTY_INHERITING, SIGNAL_MAP, WASI_CLOCK_MONOTONIC, WASI_CLOCK_PROCESS_CPUTIME_ID, WASI_CLOCK_REALTIME, WASI_CLOCK_THREAD_CPUTIME_ID, WASI_DIRCOOKIE_START, WASI_E2BIG, WASI_EACCES, WASI_EADDRINUSE, WASI_EADDRNOTAVAIL, WASI_EAFNOSUPPORT, WASI_EAGAIN, WASI_EALREADY, WASI_EBADF, WASI_EBADMSG, WASI_EBUSY, WASI_ECANCELED, WASI_ECHILD, WASI_ECONNABORTED, WASI_ECONNREFUSED, WASI_ECONNRESET, WASI_EDEADLK, WASI_EDESTADDRREQ, WASI_EDOM, WASI_EDQUOT, WASI_EEXIST, WASI_EFAULT, WASI_EFBIG, WASI_EHOSTUNREACH, WASI_EIDRM, WASI_EILSEQ, WASI_EINPROGRESS, WASI_EINTR, WASI_EINVAL, WASI_EIO, WASI_EISCONN, WASI_EISDIR, WASI_ELOOP, WASI_EMFILE, WASI_EMLINK, WASI_EMSGSIZE, WASI_EMULTIHOP, WASI_ENAMETOOLONG, WASI_ENETDOWN, WASI_ENETRESET, WASI_ENETUNREACH, WASI_ENFILE, WASI_ENOBUFS, WASI_ENODEV, WASI_ENOENT, WASI_ENOEXEC, WASI_ENOLCK, WASI_ENOLINK, WASI_ENOMEM, WASI_ENOMSG, WASI_ENOPROTOOPT, WASI_ENOSPC, WASI_ENOSYS, WASI_ENOTCAPABLE, WASI_ENOTCONN, WASI_ENOTDIR, WASI_ENOTEMPTY, WASI_ENOTRECOVERABLE, WASI_ENOTSOCK, WASI_ENOTSUP, WASI_ENOTTY, WASI_ENXIO, WASI_EOVERFLOW, WASI_EOWNERDEAD, WASI_EPERM, WASI_EPIPE, WASI_EPROTO, WASI_EPROTONOSUPPORT, WASI_EPROTOTYPE, WASI_ERANGE, WASI_EROFS, WASI_ESPIPE, WASI_ESRCH, WASI_ESTALE, WASI_ESUCCESS, WASI_ETIMEDOUT, WASI_ETXTBSY, WASI_EVENTTYPE_CLOCK, WASI_EVENTTYPE_FD_READ, WASI_EVENTTYPE_FD_WRITE, WASI_EXDEV, WASI_FDFLAG_APPEND, WASI_FDFLAG_DSYNC, WASI_FDFLAG_NONBLOCK, WASI_FDFLAG_RSYNC, WASI_FDFLAG_SYNC, WASI_FILESTAT_SET_ATIM, WASI_FILESTAT_SET_ATIM_NOW, WASI_FILESTAT_SET_MTIM, WASI_FILESTAT_SET_MTIM_NOW, WASI_FILETYPE_BLOCK_DEVICE, WASI_FILETYPE_CHARACTER_DEVICE, WASI_FILETYPE_DIRECTORY, WASI_FILETYPE_REGULAR_FILE, WASI_FILETYPE_SOCKET_DGRAM, WASI_FILETYPE_SOCKET_STREAM, WASI_FILETYPE_SYMBOLIC_LINK, WASI_FILETYPE_UNKNOWN, WASI_O_CREAT, WASI_O_DIRECTORY, WASI_O_EXCL, WASI_O_TRUNC, WASI_PREOPENTYPE_DIR, WASI_RIGHT_FD_ADVISE, WASI_RIGHT_FD_ALLOCATE, WASI_RIGHT_FD_DATASYNC, WASI_RIGHT_FD_FDSTAT_SET_FLAGS, WASI_RIGHT_FD_FILESTAT_GET, WASI_RIGHT_FD_FILESTAT_SET_SIZE, WASI_RIGHT_FD_FILESTAT_SET_TIMES, WASI_RIGHT_FD_READ, WASI_RIGHT_FD_READDIR, WASI_RIGHT_FD_SEEK, WASI_RIGHT_FD_SYNC, WASI_RIGHT_FD_TELL, WASI_RIGHT_FD_WRITE, WASI_RIGHT_PATH_CREATE_DIRECTORY, WASI_RIGHT_PATH_CREATE_FILE, WASI_RIGHT_PATH_FILESTAT_GET, WASI_RIGHT_PATH_FILESTAT_SET_SIZE, WASI_RIGHT_PATH_FILESTAT_SET_TIMES, WASI_RIGHT_PATH_LINK_SOURCE, WASI_RIGHT_PATH_LINK_TARGET, WASI_RIGHT_PATH_OPEN, WASI_RIGHT_PATH_READLINK, WASI_RIGHT_PATH_REMOVE_DIRECTORY, WASI_RIGHT_PATH_RENAME_SOURCE, WASI_RIGHT_PATH_RENAME_TARGET, WASI_RIGHT_PATH_SYMLINK, WASI_RIGHT_PATH_UNLINK_FILE, WASI_RIGHT_POLL_FD_READWRITE, WASI_RIGHT_SOCK_SHUTDOWN, WASI_SIGABRT, WASI_SIGALRM, WASI_SIGBUS, WASI_SIGCHLD, WASI_SIGCONT, WASI_SIGFPE, WASI_SIGHUP, WASI_SIGILL, WASI_SIGINT, WASI_SIGKILL, WASI_SIGPIPE, WASI_SIGQUIT, WASI_SIGSEGV, WASI_SIGSTOP, WASI_SIGTERM, WASI_SIGTRAP, WASI_SIGTSTP, WASI_SIGTTIN, WASI_SIGTTOU, WASI_SIGURG, WASI_SIGUSR1, WASI_SIGUSR2, WASI_SIGVTALRM, WASI_SIGXCPU, WASI_SIGXFSZ, WASI_STDERR_FILENO, WASI_STDIN_FILENO, WASI_STDOUT_FILENO, WASI_WHENCE_CUR, WASI_WHENCE_END, WASI_WHENCE_SET };