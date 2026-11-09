"""One-shot deploy of seller-panel changes to MixPlus Linux production.

Reads password from MIXPLUS_SSH_PASSWORD env var.
"""
from __future__ import annotations

import os
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "45.149.78.183"
USER = "root"
PASSWORD = os.environ.get("MIXPLUS_SSH_PASSWORD")
REPO = Path(r"C:\Users\Maryam\frontendmixplus")
REMOTE_ROOT = "/var/www/mixplus"
REMOTE_UPLOAD = "/tmp/mixplus-seller-deploy"

REMOTE_SH = r"""#!/bin/bash
set -euo pipefail
UPLOAD=/tmp/mixplus-seller-deploy
ROOT=/var/www/mixplus
cd "$UPLOAD"
rm -rf frontend-extract backend-extract
mkdir frontend-extract backend-extract
tar -xzf frontend.tgz -C frontend-extract
tar -xzf backend.tgz -C backend-extract

mkdir -p "$UPLOAD/backup"
cp -a "$ROOT/frontend-src/.env.local" "$UPLOAD/backup/frontend.env.local" 2>/dev/null || true
cp -a "$ROOT/api-publish/appsettings.Production.json" "$UPLOAD/backup/appsettings.Production.json"
cp -a "$ROOT/api-publish/appsettings.json" "$UPLOAD/backup/appsettings.json" 2>/dev/null || true

rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .env.local \
  "$UPLOAD/frontend-extract/frontend/" "$ROOT/frontend-src/"
rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .env.local \
  "$UPLOAD/frontend-extract/frontend/" "$ROOT/frontend/"

if [ -f "$UPLOAD/backup/frontend.env.local" ]; then
  cp -a "$UPLOAD/backup/frontend.env.local" "$ROOT/frontend-src/.env.local"
  cp -a "$UPLOAD/backup/frontend.env.local" "$ROOT/frontend/.env.local"
fi

rsync -a --delete \
  --exclude bin --exclude obj \
  "$UPLOAD/backend-extract/backend/" "$ROOT/backend-src/"

echo "Building frontend..."
cd "$ROOT/frontend-src"
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build
rsync -a --delete "$ROOT/frontend-src/.next/" "$ROOT/frontend/.next/"

echo "Publishing API..."
cd "$ROOT/backend-src"
dotnet publish src/Host/MixPlus.Api/MixPlus.Api.csproj -c Release -o "$ROOT/api-publish-new"
cp -a "$UPLOAD/backup/appsettings.Production.json" "$ROOT/api-publish-new/appsettings.Production.json"
cp -a "$UPLOAD/backup/appsettings.json" "$ROOT/api-publish-new/appsettings.json" 2>/dev/null || true

systemctl stop mixplus-api
rm -rf "$ROOT/api-publish-old"
mv "$ROOT/api-publish" "$ROOT/api-publish-old"
mv "$ROOT/api-publish-new" "$ROOT/api-publish"
systemctl start mixplus-api

echo "Restarting frontend..."
cd "$ROOT/frontend-src"
pm2 restart mixplus-web --update-env || pm2 start npm --name mixplus-web --cwd "$ROOT/frontend-src" -- start
pm2 save

printf 'seller-panel\n%s\n' "$(date -u)" > "$ROOT/DEPLOYED_BRANCH.txt"

sleep 4
systemctl is-active mixplus-api
curl -fsS -o /dev/null -w "api_health:%{http_code}\n" http://127.0.0.1:5080/health || \
  curl -fsS -o /dev/null -w "api_home:%{http_code}\n" http://127.0.0.1:5080/api/home || true
curl -fsS -o /dev/null -w "frontend:%{http_code}\n" http://127.0.0.1:3000/seller/login || true
curl -fsS -o /dev/null -w "nginx:%{http_code}\n" http://127.0.0.1/seller/login || true
echo DEPLOY_OK
"""


def die(msg: str) -> None:
    print("ERROR:", msg)
    sys.exit(1)


def make_tarball(src: Path, dest: Path, excludes: set[str]) -> None:
    def filter_tar(ti: tarfile.TarInfo):
        parts = Path(ti.name).parts
        for ex in excludes:
            if ex in parts:
                return None
        return ti

    with tarfile.open(dest, "w:gz") as tar:
        tar.add(src, arcname=src.name, filter=filter_tar)


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 3600) -> str:
    print("\n$ " + cmd[:200])
    _i, out, err = client.exec_command(cmd, timeout=timeout, get_pty=True)
    # Stream output
    chunks: list[str] = []
    while True:
        line = out.readline()
        if not line:
            break
        chunks.append(line)
        print(line, end="")
    code = out.channel.recv_exit_status()
    etext = err.read().decode("utf-8", errors="replace")
    if etext.strip():
        print(etext[-2000:])
    if code != 0:
        die(f"remote command failed ({code}): {cmd}")
    return "".join(chunks)


def main() -> None:
    if not PASSWORD:
        die("Set MIXPLUS_SSH_PASSWORD")

    tmp = Path(tempfile.mkdtemp(prefix="mixplus-deploy-"))
    fe_tar = tmp / "frontend.tgz"
    be_tar = tmp / "backend.tgz"
    print("Packaging frontend...")
    make_tarball(
        REPO / "frontend",
        fe_tar,
        excludes={"node_modules", ".next", ".git", "logs", ".turbo", "coverage"},
    )
    print("Packaging backend...")
    make_tarball(
        REPO / "backend",
        be_tar,
        excludes={"bin", "obj", ".git", "logs", "TestResults"},
    )
    print(f"sizes fe={fe_tar.stat().st_size} be={be_tar.stat().st_size}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()
    run(client, f"rm -rf {REMOTE_UPLOAD} && mkdir -p {REMOTE_UPLOAD}", timeout=60)
    print("Uploading...")
    sftp.put(str(fe_tar), f"{REMOTE_UPLOAD}/frontend.tgz")
    sftp.put(str(be_tar), f"{REMOTE_UPLOAD}/backend.tgz")
    with sftp.file(f"{REMOTE_UPLOAD}/deploy.sh", "w") as f:
        f.write(REMOTE_SH)
    sftp.chmod(f"{REMOTE_UPLOAD}/deploy.sh", 0o755)
    sftp.close()

    run(client, f"bash {REMOTE_UPLOAD}/deploy.sh", timeout=3600)
    client.close()
    print("\nDone. Seller login: http://45.149.78.183/seller/login")
    print("Seller dashboard: http://45.149.78.183/seller/dashboard")


if __name__ == "__main__":
    main()
