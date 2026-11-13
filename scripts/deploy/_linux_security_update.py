#!/usr/bin/env python3
"""Apply Ubuntu security updates on MixPlus VPS. Password: MIXPLUS_SSH_PASSWORD."""
from __future__ import annotations

import os
import sys
import time

import paramiko

HOST = "45.149.78.183"
USER = "root"


def die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def connect() -> paramiko.SSHClient:
    pw = os.environ.get("MIXPLUS_SSH_PASSWORD")
    if not pw:
        die("Set MIXPLUS_SSH_PASSWORD")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        HOST,
        username=USER,
        password=pw,
        timeout=45,
        banner_timeout=60,
        auth_timeout=45,
    )
    return client


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 1800) -> int:
    print(f"\n=== {cmd[:160]}", flush=True)
    _stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end="", flush=True)
    err = stderr.read().decode("utf-8", "replace")
    if err.strip():
        print(err, flush=True)
    code = stdout.channel.recv_exit_status()
    print(f"exit {code}", flush=True)
    return code


def main() -> None:
    client = connect()
    try:
        run(client, "uname -r; cat /etc/os-release | head -n 6")
        env = "DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a"
        if run(client, f"{env} apt-get update -y") != 0:
            die("apt-get update failed")
        up = (
            f"{env} apt-get -y "
            "-o Dpkg::Options::=--force-confdef "
            "-o Dpkg::Options::=--force-confold "
            "upgrade"
        )
        if run(client, up) != 0:
            die("apt-get upgrade failed")
        dist = (
            f"{env} apt-get -y "
            "-o Dpkg::Options::=--force-confdef "
            "-o Dpkg::Options::=--force-confold "
            "dist-upgrade"
        )
        if run(client, dist) != 0:
            die("apt-get dist-upgrade failed")
        run(
            client,
            "uname -r; ls -1 /boot/vmlinuz-* 2>/dev/null | tail -n 8; "
            "[ -f /var/run/reboot-required ] && echo REBOOT_REQUIRED || echo NO_REBOOT_REQUIRED; "
            "cat /var/run/reboot-required.pkgs 2>/dev/null | head -n 40 || true",
        )
        run(client, "pm2 list || true; systemctl is-active nginx || true")
        print("\nAPT_OK", flush=True)
    finally:
        client.close()


if __name__ == "__main__":
    main()
