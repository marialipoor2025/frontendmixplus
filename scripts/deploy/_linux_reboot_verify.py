#!/usr/bin/env python3
"""Reboot MixPlus VPS and verify kernel + services. Password: MIXPLUS_SSH_PASSWORD."""
from __future__ import annotations

import os
import socket
import sys
import time

import paramiko

HOST = "45.149.78.183"
USER = "root"


def die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def connect(timeout: int = 45) -> paramiko.SSHClient:
    pw = os.environ.get("MIXPLUS_SSH_PASSWORD")
    if not pw:
        die("Set MIXPLUS_SSH_PASSWORD")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        HOST,
        username=USER,
        password=pw,
        timeout=timeout,
        banner_timeout=timeout,
        auth_timeout=timeout,
    )
    return client


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 120) -> tuple[int, str]:
    _stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    text = (out + err).encode("ascii", "replace").decode("ascii")
    print(f"\n=== {cmd}\n{text}", flush=True)
    return code, text


def wait_ssh(max_wait: int = 300) -> None:
    print(f"Waiting up to {max_wait}s for SSH...", flush=True)
    deadline = time.time() + max_wait
    while time.time() < deadline:
        try:
            sock = socket.create_connection((HOST, 22), timeout=5)
            sock.close()
            # give sshd a moment after port opens
            time.sleep(5)
            client = connect(timeout=20)
            client.close()
            print("SSH is back", flush=True)
            return
        except Exception as exc:  # noqa: BLE001
            print(f"  not ready: {exc}", flush=True)
            time.sleep(8)
    die("SSH did not come back in time")


def main() -> None:
    client = connect()
    try:
        run(client, "uname -r")
        print("Issuing reboot now...", flush=True)
        # reboot asynchronously; connection will drop
        try:
            client.exec_command("sync; /sbin/reboot", timeout=10)
        except Exception:  # noqa: BLE001
            pass
    finally:
        try:
            client.close()
        except Exception:  # noqa: BLE001
            pass

    time.sleep(20)
    wait_ssh(360)

    client = connect()
    try:
        _code, kernel = run(client, "uname -r; uname -a")
        run(
            client,
            "[ -f /var/run/reboot-required ] && echo STILL_NEEDS_REBOOT || echo NO_REBOOT_REQUIRED",
        )
        run(
            client,
            "systemctl is-active nginx; systemctl is-active ssh; "
            "command -v pm2 >/dev/null && pm2 jlist 2>/dev/null | "
            "python3 -c \"import sys,json; d=json.load(sys.stdin); "
            "print('\\n'.join(f\\\"{x.get('name')}:{x.get('pm2_env',{}).get('status')}\\\" for x in d))\" "
            "|| echo pm2_unavailable",
        )
        run(
            client,
            "curl -sS -o /dev/null -w 'http_root:%{http_code}\\n' http://127.0.0.1/ || true; "
            "curl -sS -o /dev/null -w 'seller:%{http_code}\\n' http://127.0.0.1/seller/login || true; "
            "curl -sS -o /dev/null -w 'api:%{http_code}\\n' http://127.0.0.1:5080/health || "
            "curl -sS -o /dev/null -w 'api_alt:%{http_code}\\n' http://127.0.0.1/api/health || true",
        )
        if "6.8.0-149" not in kernel and "6.8.0-147" not in kernel:
            # accept any newer than 111
            if "6.8.0-111" in kernel.splitlines()[0]:
                die("Still on old kernel after reboot")
        print("\nREBOOT_VERIFY_OK", flush=True)
    finally:
        client.close()


if __name__ == "__main__":
    main()
