const c = @import("c.zig");
const node = @import("node.zig");
const unistd = @cImport({
    @cInclude("unistd.h");
    @cInclude("fcntl.h"); // just needed for constants
    @cInclude("grp.h"); // getgrouplist on linux
});
const builtin = @import("builtin");
const util = @import("util.zig");
const std = @import("std");

pub fn register(env: c.napi_env, exports: c.napi_value) !void {
    try node.registerFunction(env, exports, "chroot", chroot);
    try node.registerFunction(env, exports, "getegid", getegid);
    try node.registerFunction(env, exports, "geteuid", geteuid);
    try node.registerFunction(env, exports, "gethostname", gethostname);
    try node.registerFunction(env, exports, "getpgid", getpgid);
    try node.registerFunction(env, exports, "getppid", getppid);
    try node.registerFunction(env, exports, "getpgrp", getpgrp);
    try node.registerFunction(env, exports, "setpgid", setpgid);
    try node.registerFunction(env, exports, "setegid", setegid);
    try node.registerFunction(env, exports, "seteuid", seteuid);
    try node.registerFunction(env, exports, "sethostname", sethostname);
    try node.registerFunction(env, exports, "setregid", setregid);
    try node.registerFunction(env, exports, "setreuid", setreuid);
    try node.registerFunction(env, exports, "setsid", setsid);
    try node.registerFunction(env, exports, "ttyname", ttyname);
    try node.registerFunction(env, exports, "alarm", alarm);

    try node.registerFunction(env, exports, "execv", execv);
    try node.registerFunction(env, exports, "_execve", execve);
    try node.registerFunction(env, exports, "_fexecve", fexecve);

    try node.registerFunction(env, exports, "fork", fork);
    try node.registerFunction(env, exports, "pipe", pipe);
    if (builtin.target.os.tag == .linux) {
        try node.registerFunction(env, exports, "pipe2", pipe2_impl);
    }

    try node.registerFunction(env, exports, "lockf", lockf);
    try node.registerFunction(env, exports, "pause", pause);
    try node.registerFunction(env, exports, "getgrouplist", getgrouplist);
}

pub const constants = .{
    .c_import = unistd,
    .names = [_][:0]const u8{ "O_CLOEXEC", "O_NONBLOCK", "F_ULOCK", "F_LOCK", "F_TLOCK", "F_TEST" },
};

// int chroot(const char *path);
fn chroot(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    var buf: [1024]u8 = undefined;
    node.stringFromValue(env, argv[0], "path", 1024, &buf) catch return null;
    if (unistd.chroot(&buf) == -1) {
        node.throwError(env, "chroot failed");
    }
    return null;
}

// uid_t getegid(void);
fn getegid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.getegid();
    return node.create_u32(env, pid, "pid") catch return null;
}

// uid_t geteuid(void);
fn geteuid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.geteuid();
    return node.create_u32(env, pid, "pid") catch return null;
}

// int gethostname(char *name, size_t namelen);
fn gethostname(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    var name: [1024]u8 = undefined;
    if (unistd.gethostname(&name, 1024) == -1) {
        node.throwError(env, "error in gethostname");
    }
    // cast because we know name is null terminated.
    return node.createStringFromPtr(env, @ptrCast([*:0]const u8, &name), "hostname") catch return null;
}

// pid_t getpgid(pid_t pid);
fn getpgid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const pid = node.i32FromValue(env, argv[0], "pid") catch return null;
    const pgid = unistd.getpgid(pid);
    if (pgid == -1) {
        node.throwError(env, "error in getpgid");
        return null;
    }
    return node.create_i32(env, pgid, "pgid") catch return null;
}

// pid_t getpgrp(void);
fn getpgrp(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.getppid();
    return node.create_i32(env, pid, "pid") catch return null;
}

// pid_t getppid(void);
fn getppid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.getppid();
    return node.create_i32(env, pid, "pid") catch return null;
}

// int setegid(gid_t gid);
fn setegid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const gid = node.u32FromValue(env, argv[0], "gid") catch return null;
    if (unistd.setegid(gid) == -1) {
        node.throwError(env, "error in setegid");
    }
    return null;
}

// int seteuid(uid_t uid);
fn seteuid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const uid = node.u32FromValue(env, argv[0], "uid") catch return null;
    if (unistd.seteuid(uid) == -1) {
        node.throwError(env, "error in seteuid");
    }
    return null;
}

// int sethostname(const char *name, size_t len);
fn sethostname(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    var buf: [1024]u8 = undefined;
    node.stringFromValue(env, argv[0], "name", 1024, &buf) catch return null;
    const len = node.strlen(@ptrCast([*:0]const u8, &buf));
    // Interestingly the type of second argument sethostname depends on the operating system.
    if (builtin.target.os.tag == .linux) {
        if (unistd.sethostname(&buf, len) == -1) {
            node.throwError(env, "error setting host name");
        }
    } else {
        if (unistd.sethostname(&buf, @intCast(c_int, len)) == -1) {
            node.throwError(env, "error setting host name");
        }
    }
    return null;
}

// int setpgid(pid_t pid, pid_t pgid);
fn setpgid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 2) catch return null;
    const pid = node.i32FromValue(env, argv[0], "pid") catch return null;
    const pgid = node.i32FromValue(env, argv[1], "pgid") catch return null;
    if (unistd.setpgid(pid, pgid) == -1) {
        node.throwError(env, "error in setpgid");
    }
    return null;
}

// int setregid(gid_t rgid, gid_t egid);
fn setregid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 2) catch return null;
    const rgid = node.u32FromValue(env, argv[0], "rgid") catch return null;
    const egid = node.u32FromValue(env, argv[1], "egid") catch return null;
    if (unistd.setregid(rgid, egid) == -1) {
        node.throwError(env, "error in setregid");
    }
    return null;
}

// int setreuid(uid_t ruid, uid_t euid);
fn setreuid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 2) catch return null;
    const ruid = node.u32FromValue(env, argv[0], "ruid") catch return null;
    const euid = node.u32FromValue(env, argv[1], "euid") catch return null;
    if (unistd.setreuid(ruid, euid) == -1) {
        node.throwError(env, "error in setreuid");
    }
    return null;
}

// pid_t setsid(void);
fn setsid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.setsid();
    if (pid == -1) {
        node.throwError(env, "error in setsid");
        return null;
    }
    return node.create_i32(env, pid, "pid") catch return null;
}

// char *ttyname(int fd);
fn ttyname(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const fd = node.i32FromValue(env, argv[0], "fd") catch return null;
    const name = unistd.ttyname(fd);
    if (name == null) {
        node.throwError(env, "invalid file descriptor");
        return null;
    }
    return node.createStringFromPtr(env, name, "ttyname") catch return null;
}

// unsigned alarm(unsigned seconds);
fn alarm(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const seconds = node.u32FromValue(env, argv[0], "seconds") catch return null;
    const ret = unistd.alarm(seconds); // doesn't return any error no matter what.
    return node.create_u32(env, ret, "ret") catch return null;
}

const UnistdError = error{Dup2Fail};

fn dupStream(env: c.napi_env, comptime name: [:0]const u8, number: i32) !void {
    const stream = try node.getStreamFd(env, name);
    if (unistd.dup2(stream, number) == -1) {
        node.throwError(env, "dup2 failed on " ++ name);
        return UnistdError.Dup2Fail;
    }
    if (unistd.close(stream) == -1) {
        node.throwError(env, "closing fd failed " ++ name);
        return UnistdError.Dup2Fail;
    }
}

fn dupStreams(env: c.napi_env) !void {
    try dupStream(env, "stdin", 0);
    try dupStream(env, "stdout", 1);
    try dupStream(env, "stderr", 2);
}

fn execv(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const args = node.getArgv(env, info, 2) catch return null;

    var pathname = node.valueToString(env, args[0], "pathname") catch return null;
    defer std.c.free(pathname);

    var argv = node.valueToArrayOfStrings(env, args[1], "argv") catch return null;
    defer util.freeArrayOfStrings(argv);

    dupStreams(env) catch return null;

    const ret = unistd.execv(pathname, argv);
    if (ret == -1) {
        node.throwError(env, "error in execv");
        return null;
    }
    // This can't ever happen, of course.
    return node.create_i32(env, ret, "ret") catch return null;
}

// int execve(const char *pathname, char *const argv[], char *const envp[]);
//  execve: (pathname: string, argv: string[], envp: string[]) => number;
// TODO: we should change last arg to be a map, like with python.
fn execve(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const args = node.getArgv(env, info, 3) catch return null;

    var pathname = node.valueToString(env, args[0], "pathname") catch return null;
    defer std.c.free(pathname);

    var argv = node.valueToArrayOfStrings(env, args[1], "argv") catch return null;
    defer util.freeArrayOfStrings(argv);

    var envp = node.valueToArrayOfStrings(env, args[2], "envp") catch return null;
    defer util.freeArrayOfStrings(envp);

    // Critical to dup2 these are we'll see nothing after running execve:
    dupStreams(env) catch return null;

    // NOTE: On success, execve() does not return (!), on error -1 is returned,
    // and errno is set to indicate the error.
    // **TODO: this is working but is very annoying because node isn't surrendering stdout/stdout/etc., so
    // it silently appears to die.**  But a simple example writing to a file shows this works.
    const ret = unistd.execve(pathname, argv, envp);
    if (ret == -1) {
        node.throwError(env, "error in execve");
        return null;
    }
    // This can't ever happen, of course.
    return node.create_i32(env, ret, "ret") catch return null;
}

//   int fexecve(int fd, char *const argv[], char *const envp[]);
fn fexecve(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    if (builtin.target.os.tag != .linux) {
        node.throwError(env, "fexecve is only supported on linux");
        return null;
    }

    const args = node.getArgv(env, info, 3) catch return null;

    var fd = node.i32FromValue(env, args[0], "fd") catch return null;

    var argv = node.valueToArrayOfStrings(env, args[1], "argv") catch return null;
    defer util.freeArrayOfStrings(argv);

    var envp = node.valueToArrayOfStrings(env, args[2], "envp") catch return null;
    defer util.freeArrayOfStrings(envp);

    // Critical to dup2 these are we'll see nothing after running execve:
    dupStreams(env) catch return null;

    const ret = unistd.fexecve(fd, argv, envp);
    if (ret == -1) {
        node.throwError(env, "error in fexecve");
        return null;
    }
    // This can't ever happen, of course.
    return node.create_i32(env, ret, "ret") catch return null;
}

// pid_t fork(void);
fn fork(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const pid = unistd.fork();
    if (pid == -1) {
        node.throwError(env, "error in fork");
        return null;
    }
    return node.create_i32(env, pid, "pid") catch return null;
}

// int pipe(int pipefd[2]);
fn pipe(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    var pipefd: [2]c_int = undefined;
    if (unistd.pipe(&pipefd) == -1) {
        node.throwError(env, "error in pipe");
    }
    return pipefdToObject(env, pipefd) catch return null;
}

// pipe2 is linux only
extern fn pipe2(pipefd: [*]c_int, flags: c_int) c_int;
fn pipe2_impl(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    if (builtin.target.os.tag != .linux) {
        node.throwError(env, "pipe2 is only supported on linux");
        return null;
    }
    const argv = node.getArgv(env, info, 1) catch return null;
    const flags = node.i32FromValue(env, argv[0], "flags") catch return null;
    var pipefd: [2]c_int = undefined;
    if (pipe2(&pipefd, flags) == -1) {
        node.throwError(env, "error in pipe2");
    }
    return pipefdToObject(env, pipefd) catch return null;
}

fn pipefdToObject(env: c.napi_env, pipefd: [2]c_int) !c.napi_value {
    const obj = node.createObject(env, "pipefd") catch return null;
    const readfd = node.create_i32(env, pipefd[0], "pipefd[0]") catch return null;
    node.setNamedProperty(env, obj, "readfd", readfd, "setting readfd") catch return null;
    const writefd = node.create_i32(env, pipefd[1], "pipefd[1]") catch return null;
    node.setNamedProperty(env, obj, "writefd", writefd, "setting writefd") catch return null;
    return obj;
}

// Record locking on files:
//   int lockf(int fd, int cmd, off_t size);
// NOTE: off_t is i64 on wasi and macos.
// cmd is one of the constants F_ULOCK, F_LOCK, F_TLOCK, or F_TEST.
fn lockf(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 3) catch return null;
    const fd = node.i32FromValue(env, argv[0], "fd") catch return null;
    const cmd = node.i32FromValue(env, argv[1], "cmd") catch return null;
    const size = node.i64FromBigIntValue(env, argv[2], "size") catch return null;
    if (unistd.lockf(fd, cmd, size) == -1) {
        node.throwError(env, "error in lockf");
    }
    return null;
}

//   int pause(void);
fn pause(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    const res = unistd.pause(); // this actually always returns -1, according to docs
    return node.create_i32(env, res, "res") catch return null;
}

//        int getgrouplist(const char *user, gid_t group,
//                         gid_t *groups, int *ngroups);
fn getgrouplist(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 2) catch return null;
    var user: [1024]u8 = undefined;
    node.stringFromValue(env, argv[0], "user", user.len, &user) catch return null;
    const group =
        if (builtin.target.os.tag == .linux)
        node.u32FromValue(env, argv[1], "group") catch return null
    else
        node.i32FromValue(env, argv[1], "group") catch return null;

    var ngroups: c_int = 50;
    const ptr0 = std.c.malloc(@sizeOf(c_int) * @intCast(usize, ngroups)) orelse {
        node.throwError(env, "error allocating memory");
        return null;
    };
    defer std.c.free(ptr0);
    var groups = if (builtin.target.os.tag == .linux)
        @ptrCast([*]c_uint, @alignCast(std.meta.alignment([*]c_uint), ptr0))
    else
        @ptrCast([*]c_int, @alignCast(std.meta.alignment([*]c_int), ptr0));

    const r = unistd.getgrouplist(@ptrCast([*:0]u8, &user), group, groups, &ngroups);
    if (r == -1) {
        const ptr = std.c.malloc(@sizeOf(c_int) * @intCast(usize, ngroups)) orelse {
            node.throwError(env, "error allocating memory");
            return null;
        };
        defer std.c.free(ptr);
        groups = if (builtin.target.os.tag == .linux)
            @ptrCast([*]c_uint, @alignCast(std.meta.alignment([*]c_uint), ptr))
        else
            @ptrCast([*]c_int, @alignCast(std.meta.alignment([*]c_int), ptr));

        if (unistd.getgrouplist(@ptrCast([*:0]u8, &user), group, groups, &ngroups) == -1) {
            node.throwError(env, "failed to get group list");
            return null;
        }
    }
    const array = node.createArray(env, @intCast(u32, ngroups), "getgrouplist output array") catch return null;
    var i: u32 = 0;
    while (i < ngroups) : (i += 1) {
        const gid = if (builtin.target.os.tag == .linux)
            node.create_u32(env, groups[i], "ith group") catch return null
        else
            node.create_i32(env, groups[i], "ith group") catch return null;

        node.setElement(env, array, i, gid, "setting ith group") catch return null;
    }
    return array;
}
