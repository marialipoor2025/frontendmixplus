"""Quick health check against MixPlus Linux production."""
from __future__ import annotations

import os
import sys

import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "45.149.78.183"
PASSWORD = os.environ.get("MIXPLUS_SSH_PASSWORD")
if not PASSWORD:
    raise SystemExit("MIXPLUS_SSH_PASSWORD not set")

CMD = r"""
set -e
systemctl is-active mixplus-api || true
ss -ltnp | grep -E ':5080|:3000' || true
curl -sS -o /dev/null -w 'api=%{http_code}\n' http://127.0.0.1:5080/health || echo api_fail
curl -sS -o /dev/null -w 'fe=%{http_code}\n' http://127.0.0.1:3000/ || echo fe_fail
curl -sS -o /dev/null -w 'nginx=%{http_code}\n' http://127.0.0.1/ || echo nginx_fail
journalctl -u mixplus-api -n 40 --no-pager || true
pm2 status || true
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username="root", password=PASSWORD, timeout=30)
_stdin, stdout, stderr = client.exec_command(CMD, timeout=90, get_pty=True)
print(stdout.read().decode("utf-8", errors="replace"))
err = stderr.read().decode("utf-8", errors="replace")
if err.strip():
    print(err)
client.close()
