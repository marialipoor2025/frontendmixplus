#!/usr/bin/env python3
import os
import sys

import paramiko

HOST = "45.149.78.183"


def main() -> None:
    pw = os.environ.get("MIXPLUS_SSH_PASSWORD")
    if not pw:
        raise SystemExit("Set MIXPLUS_SSH_PASSWORD")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username="root", password=pw, timeout=30)
    cmd = r"""
set -e
uname -r
systemctl is-active mixplus-api
systemctl is-active nginx
systemctl is-active pm2-root
curl -sS -o /dev/null -w 'root:%{http_code}\n' http://127.0.0.1/ || true
curl -sS -o /dev/null -w 'seller:%{http_code}\n' http://127.0.0.1/seller/login || true
curl -sS -o /dev/null -w 'api_health:%{http_code}\n' http://127.0.0.1:5080/health || true
curl -sS -o /dev/null -w 'api_root:%{http_code}\n' http://127.0.0.1:5080/ || true
if [ -f /var/run/reboot-required ]; then echo STILL_NEEDS_REBOOT; else echo KERNEL_ACTIVE_OK; fi
"""
    _i, o, e = client.exec_command(cmd, timeout=60)
    text = (o.read() + e.read()).decode("utf-8", "replace").encode("ascii", "replace").decode("ascii")
    print(text)
    client.close()


if __name__ == "__main__":
    main()
