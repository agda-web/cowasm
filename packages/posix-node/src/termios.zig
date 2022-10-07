// Inspired by https://viewsourcecode.org/snaptoken/kilo/02.enteringRawMode.html

const c = @import("c.zig");
const node = @import("node.zig");
const std = @import("std");
const clib = @cImport({
    @cInclude("termios.h");
    @cInclude("stdlib.h");
    @cInclude("unistd.h");
    @cInclude("wchar.h");
    @cInclude("locale.h");
    @cInclude("fcntl.h");
});

pub fn register(env: c.napi_env, exports: c.napi_value) !void {
    try node.registerFunction(env, exports, "getChar", getChar);
    try node.registerFunction(env, exports, "enableRawInput", enableRawInput);
    try node.registerFunction(env, exports, "makeStdinBlocking", makeStdinBlocking);
}

const Errors = error{ GetAttr, GetFlags, SetFlags, SetAttr, SetLocale };

fn _makeStdinBlocking() Errors!void {
    var flags = clib.fcntl(clib.STDIN_FILENO, clib.F_GETFL, @intCast(c_int, 0));
    if (flags < 0) {
        return Errors.GetFlags;
    }
    if (clib.fcntl(clib.STDIN_FILENO, clib.F_SETFL, flags & ~(clib.O_NONBLOCK)) < 0) {
        return Errors.SetFlags;
    }
}


fn makeStdinBlocking(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    _makeStdinBlocking() catch {
        node.throwErrno(env, "makeStdinBlocking - failed");
    };
    return null;
}


fn enableRawInput(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _ = info;
    _enableRawInput() catch {
        node.throwErrno(env, "enableRawInput - failed");
    };
    return null;
}

// disables echo and icanon for the terminal and enables the locale so
// we can read a single wide character using getChar below.
var enabled = false;
fn _enableRawInput() Errors!void {
    if (enabled) return;

    try _makeStdinBlocking();

    var raw: clib.termios = undefined;
    if (clib.tcgetattr(clib.STDIN_FILENO, &raw) != 0) {
        return Errors.GetAttr;
    }
    raw.c_lflag &= ~(@intCast(@TypeOf(raw.c_lflag), clib.ECHO | clib.ICANON));
    if (clib.tcsetattr(clib.STDIN_FILENO, clib.TCSAFLUSH, &raw) != 0) {
        return Errors.SetAttr;
    }

    // On Linux we need C.UTF-8 but it isn't available on MacOS.  On MacOS the
    // default "" is fine, but that doesn't work for me on Linux...
    // This concerns me.
    if (clib.setlocale(clib.LC_ALL, "C.UTF-8") == null) {
        if (clib.setlocale(clib.LC_ALL, "") == null) {
            return Errors.SetLocale;
        }
    }

    enabled = true;
}

// Use getChar to do a blocking read of a character.  This supports wide characters
// (reading utf-8) in your locale.  This changes properties of stdin to
// different values than what Node.js supports!
fn getChar(env: c.napi_env, info: c.napi_callback_info) callconv(.C) c.napi_value {
    _enableRawInput() catch {
        node.throwErrno(env, "getChar - failed to enable raw mode");
        return null;
    };
    _ = info;
    var buf: [10]u8 = undefined;
    const w: clib.wint_t = clib.getwchar();
    if (w == clib.WEOF) {
        node.throwErrno(env, "EOF");
        return null;
    }

    var w2: [2]clib.wchar_t = undefined;
    w2[0] = @intCast(@TypeOf(w2[0]), w);
    w2[1] = 0;

    const bytes = clib.wcstombs(&buf, &w2, buf.len);
    if (bytes == -1) {
        node.throwErrno(env, "failed to convert wide string to bytes");
        return null;
    }
    var result: c.napi_value = undefined;
    if (c.napi_create_string_utf8(env, @ptrCast([*c]const u8, &buf), bytes, &result) != c.napi_ok) {
        node.throwErrno(env, "error creating string in getChar");
        return null;
    }
    return result;
}
