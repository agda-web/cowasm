const c = @import("c.zig");
const node = @import("node.zig");
const std = @import("std");
const wait = @cImport({
    @cDefine("struct__OSUnalignedU16", "uint16_t");
    @cDefine("struct__OSUnalignedU32", "uint32_t");
    @cDefine("struct__OSUnalignedU64", "uint64_t");
    @cInclude("sys/wait.h");
});

pub const constants = .{
    .c_import = wait,
    .names = [_][:0]const u8{ "WNOHANG", "WUNTRACED", "WCONTINUED" },
};

pub fn register(env: c.napi_env, exports: c.napi_value) !void {
    try node.registerFunction(env, exports, "wait", wait_impl);
    try node.registerFunction(env, exports, "wait3", wait3_impl);
    try node.registerFunction(env, exports, "waitpid", waitpid);
}

fn wait_impl(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    var wstatus: c_int = undefined;
    const ret = wait.wait(&wstatus);
    if (ret == -1) {
        node.throwErrno(env, "error calling wait.wait");
        return null;
    }
    var object = node.createObject(env, "return status and value") catch return null;
    node.setNamedProperty(env, object, "wstatus", node.create_i32(env, wstatus, "wstatus") catch return null, "wstatus") catch return null;
    node.setNamedProperty(env, object, "ret", node.create_i32(env, ret, "return value") catch return null, "return value") catch return null;
    return object;
}

// wait3: (options: number) => {ret:number; wstatus: number; /* rusage not implemented yet */ }
// pid_t wait3(int *stat_loc, int options, struct rusage *rusage);
fn wait3_impl(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 1) catch return null;
    const options = node.i32FromValue(env, argv[0], "options") catch return null;
    var wstatus: c_int = undefined;
    const ret = wait.wait3(&wstatus, options, null);
    if (ret == -1) {
        node.throwErrno(env, "error calling wait.wait3");
        return null;
    }
    var object = node.createObject(env, "return pid and wstatus") catch return null;
    node.setNamedProperty(env, object, "wstatus", node.create_i32(env, wstatus, "wstatus") catch return null, "wstatus") catch return null;
    node.setNamedProperty(env, object, "ret", node.create_i32(env, ret, "return value") catch return null, "return value") catch return null;
    return object;
}

//  pid_t waitpid(pid_t pid, int *wstatus, int options);

// waitpid(pid: number, options : number) => {wstatus: number, ret:number}

fn waitpid(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    const argv = node.getArgv(env, info, 2) catch return null;
    const pid = node.i32FromValue(env, argv[0], "pid") catch return null;
    const options = node.i32FromValue(env, argv[1], "options") catch return null;

    var wstatus: c_int = undefined;
    const ret = wait.waitpid(pid, &wstatus, options);
    if (ret == -1) {
        node.throwErrno(env, "error calling wait.waitpid");
        return null;
    }
    var object = node.createObject(env, "return status and value") catch return null;
    node.setNamedProperty(env, object, "wstatus", node.create_i32(env, wstatus, "wstatus") catch return null, "wstatus") catch return null;
    node.setNamedProperty(env, object, "ret", node.create_i32(env, ret, "return value") catch return null, "return value") catch return null;
    return object;
}
