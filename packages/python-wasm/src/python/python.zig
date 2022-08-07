const std = @import("std");
const py = @import("./pyapi.zig");

pub const General = error{ OverflowError, RuntimeError };
const PyObject = py.PyObject;

var didInit = false;
var globals: *PyObject = undefined;
pub fn init(libpython_so: [*:0]const u8) !void {
    if (didInit) return;
    didInit = true;
    try py.init(libpython_so);
    // std.debug.print("calling Py_Initialize()...\n", .{});
    py.Py_Initialize();
    // std.debug.print("success!\n", .{});
    globals = py.PyDict_New();
}

pub fn assertInit() !void {
    if (!didInit) {
        std.debug.print("call init() first\n", .{});
        return General.RuntimeError;
    }
}


// If there was an error, there is no way to get the exception information *yet*.
pub fn exec(s: [*:0]const u8) !void {
    try assertInit();
    std.debug.print("exec '{s}'\n", .{s});
    var pstr = py.PyRun_String(s, py.Py_file_input, globals, globals) orelse {
        py.PyErr_Clear();
        // failed - some sort of exception got raised.
        std.debug.print("failed to run '{s}'\n", .{s});
        return General.RuntimeError;
    };
    // it worked.  We don't use the return value for anything.
    py.Py_DECREF(pstr);
}

pub fn eval(allocator: std.mem.Allocator, s: [*:0]const u8) ![]u8 {
    try assertInit();
    // std.debug.print("eval '{s}'\n", .{s});

    var pstr = py.PyRun_String(s, py.Py_eval_input, globals, globals) orelse {
        py.PyErr_Clear();
        std.debug.print("eval -- PyRun_String failed\n", .{});
        return General.RuntimeError;
    };
    defer py.Py_DECREF(pstr);

    var rep = py.PyObject_Repr(pstr) orelse {
        py.PyErr_Clear();
        std.debug.print("eval -- PyObject_Repr failed\n", .{});
        return General.RuntimeError;
    };
    defer py.Py_DECREF(rep);
    // std.debug.print("rep ptr = {*}\n", .{rep});
    const str_rep = py.PyUnicode_AsUTF8(rep);

    // std.debug.print("str_rep = {s}\n", .{str_rep});
    return try std.fmt.allocPrint(
        allocator,
        "{s}",
        .{str_rep},
    );
}

pub fn terminal(argc: i32, argv: [*c][*c]u8) !i32 {
    try assertInit();
    // std.debug.print("calling Py_BytesMain()... with argc={}, argv[0]={s} argv[1]={s} inputs\n", .{argc, argv[0], argv[1]});
    // std.debug.print("calling Py_BytesMain()... with argc={}, argv[0]={s}\n", .{argc, argv[0]});
    const r = py.Py_BytesMain(argc, argv);
    // std.debug.print("Py_Main exited with code {}\n", .{r});
    return r;
}

// TODO: Zig unit testing requires writing a js command line loader that supports shared libraries properly.
// Also we need to specify the path to libpython.so somehow...

// test "init" {
//     init();
// }

// const eql = std.mem.eql;
// const expect = std.testing.expect;
// const test_allocator = std.testing.allocator;

// test "exec" {
//     init();
//     try exec("a = 2 + 3");
//     const a = try eval(test_allocator, "a");
//     defer test_allocator.free(a);
//     try expect(eql(u8, a, "5"));
// }

// test "exec of longer multi-statement code" {
//     init();
//     try exec("def f(n):\n    return n*2\n\na=f(1010)");
//     const a = try eval(test_allocator, "a");
//     defer test_allocator.free(a);
//     try expect(eql(u8, a, "2020"));
// }

// test "eval" {
//     init();
//     const a = try eval(test_allocator, "sum(range(101))");
//     defer test_allocator.free(a);
//     try expect(eql(u8, a, "5050"));
// }

// test "exec and eval" {
//     init();
//     try exec("w = 10; v = range(101)");
//     const a = try eval(test_allocator, "sum(v)");
//     defer test_allocator.free(a);
//     try expect(eql(u8, a, "5050"));
//     const b = try eval(test_allocator, "w+1");
//     defer test_allocator.free(b);
//     try expect(eql(u8, b, "11"));
// }

