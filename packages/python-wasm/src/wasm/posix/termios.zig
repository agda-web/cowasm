pub fn keepalive() void {}
const termios = @cImport(@cInclude("termios.h"));
const std = @import("std");
const expect = std.testing.expect;
const errno = @cImport(@cInclude("errno.h"));

//int cfsetispeed(struct termios *termios_p, speed_t speed);
//int cfsetospeed(struct termios *termios_p, speed_t speed);

// ported from zig/lib/libc/wasi/libc-top-half/musl/src/termios/cfsetospeed.c
pub export fn cfsetospeed(tio: *termios.termios, speed: termios.speed_t) c_int {
    if ((speed & @bitCast(c_ulong, ~termios.CBAUD)) != 0) {
        errno.errno = errno.EINVAL;
        return -1;
    }
    tio.c_cflag &= @bitCast(c_ulong, ~termios.CBAUD);
    tio.c_cflag |= speed;
    return 0;
}

pub export fn cfsetispeed(tio: *termios.termios, speed: termios.speed_t) c_int {
    return if (speed != 0) cfsetospeed(tio, speed) else 0;
}

export fn cfgetispeed(tio: *const termios.termios) termios.speed_t {
    return tio.c_cflag & termios.CBAUD;
}

export fn cfgetospeed(tio: *const termios.termios) termios.speed_t {
    return cfgetispeed(tio);
}

// I can't tell if any of this terinal control stuff is even possible to implement
// for something like xterm.js.  See discussion at
//   https://stackoverflow.com/questions/68778496/how-to-get-stty-echo-mode-from-xterm-js
// Thus the following are minimal stub functions.  There are implementations below
// in terms of ioctl, but it just errors out immediately on WASM.
export fn tcgetattr(fd: std.c.fd_t, tio: *termios.termios) c_int {
    _ = fd;
    _ = tio;
    return 0; // success -- got no info into tio.
    //     const TCGETS = 0x5401;
    //     std.debug.print("tcgetattr, fd={}, tio={}\n", .{ fd, tio });
    //     std.debug.print("fd={}, ioctl.ioctl(fd, TCGETS, tio) = {}\n", .{ fd, ioctl.ioctl(fd, TCGETS, tio) });
    //     if (std.c.ioctl(fd, TCGETS, tio) != 0) {
    //         // error when calling icotl.
    //         return -1;
    //     }
    //     return 0;
}

export fn tcsetattr(fd: std.c.fd_t, act: c_int, tio: *termios.termios) c_int {
    _ = fd;
    _ = act;
    _ = tio;
    return 0;
    //     const TCSETS = 0x5402;
    //     std.debug.print("tcsetattr, fd={}, act={}, tio={}\n", .{ fd, act, tio });
    //     if (act < 0 or act > 2) {
    //         // errno = EINVAL; // TODO
    //         std.debug.print("tcsetattr - error EINVAL", .{});
    //         return -1;
    //     }
    //     return ioctl.ioctl(fd, TCSETS + act, tio);
}