"""Deploy seller-panel + Digikala scrape catalog to MixPlus Linux production.

1) Upload frontend/backend sources and publish/restart services
2) Upload data/digikala-scrape (including gitignored dumps)
3) Set Production Seed flags for Digi-only catalog (wipe mock, seed scraped products)
4) Restart API so migrations + Digi seeders run
5) Leave DigiCatalog enabled; set Overwrite=false after successful seed

Reads password from MIXPLUS_SSH_PASSWORD.
"""
from __future__ import annotations

import json
import os
import sys
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "45.149.78.183"
USER = "root"
PASSWORD = os.environ.get("MIXPLUS_SSH_PASSWORD")
REPO = Path(r"C:\Users\Maryam\frontendmixplus")
REMOTE_ROOT = "/var/www/mixplus"
REMOTE_UPLOAD = "/tmp/mixplus-digi-deploy"
REMOTE_SCRAPE = f"{REMOTE_ROOT}/data/digikala-scrape"

REMOTE_SH = r"""#!/bin/bash
set -euo pipefail
UPLOAD=/tmp/mixplus-digi-deploy
ROOT=/var/www/mixplus
SCRAPE=/var/www/mixplus/data/digikala-scrape
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

echo "Installing scrape data..."
mkdir -p "$SCRAPE"
if [ -f "$UPLOAD/scrape.tgz" ]; then
  tar -xzf "$UPLOAD/scrape.tgz" -C "$SCRAPE" --strip-components=1
fi
ls -lah "$SCRAPE" || true

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

# Patch Production seed for Digi-only wipe+reseed (one-shot Overwrite=true).
python3 - <<'PY'
import json
from pathlib import Path
path = Path("/var/www/mixplus/api-publish-new/appsettings.Production.json")
data = json.loads(path.read_text(encoding="utf-8"))
seed = data.setdefault("Seed", {})
seed["Enabled"] = True
seed["Overwrite"] = True
seed["OverwriteMixPlus"] = False
seed["ResetDatabase"] = False
seed["DigiScrape"] = True
seed["DigiCatalog"] = True
seed["DigiProductDetails"] = True
seed["DigiCategoryHierarchy"] = True
seed["DigiMarketplace"] = False
seed["DigiScrapePath"] = "/var/www/mixplus/data/digikala-scrape"
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Patched Production Seed:", seed)
PY

systemctl stop mixplus-api
rm -rf "$ROOT/api-publish-old"
mv "$ROOT/api-publish" "$ROOT/api-publish-old"
mv "$ROOT/api-publish-new" "$ROOT/api-publish"
systemctl start mixplus-api

echo "Waiting for API migrate+seed..."
ok=0
for i in $(seq 1 90); do
  if curl -fsS -o /dev/null http://127.0.0.1:5080/health 2>/dev/null \
    || curl -fsS -o /dev/null "http://127.0.0.1:5080/api/catalog/products?pageSize=1" 2>/dev/null; then
    ok=1
    echo "API up after ${i}0s-ish"
    break
  fi
  sleep 5
done
if [ "$ok" != "1" ]; then
  echo "API did not become healthy in time"
  journalctl -u mixplus-api -n 80 --no-pager || true
  exit 1
fi

echo "Restarting frontend..."
cd "$ROOT/frontend-src"
pm2 restart mixplus-web --update-env || pm2 start npm --name mixplus-web --cwd "$ROOT/frontend-src" -- start
pm2 save

# Leave Digi catalog on; disable Overwrite so later restarts do not wipe again.
python3 - <<'PY'
import json
from pathlib import Path
path = Path("/var/www/mixplus/api-publish/appsettings.Production.json")
data = json.loads(path.read_text(encoding="utf-8"))
seed = data.setdefault("Seed", {})
seed["Overwrite"] = False
seed["DigiCatalog"] = True
seed["DigiScrape"] = True
seed["DigiProductDetails"] = True
seed["DigiCategoryHierarchy"] = True
seed["DigiMarketplace"] = False
seed["DigiScrapePath"] = "/var/www/mixplus/data/digikala-scrape"
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Post-seed Seed flags:", seed)
PY

printf 'seller-panel-digi-catalog\n%s\n' "$(date -u)" > "$ROOT/DEPLOYED_BRANCH.txt"

sleep 2
systemctl is-active mixplus-api
curl -fsS -o /tmp/prod-products.json "http://127.0.0.1:5080/api/catalog/products?pageSize=3" || true
python3 - <<'PY'
import json
from pathlib import Path
p = Path('/tmp/prod-products.json')
if not p.exists():
    print('products: missing')
else:
    j = json.loads(p.read_text(encoding='utf-8'))
    items = j.get('items') or j.get('products') or []
    print('products total=', j.get('total'), 'sample=', [x.get('id') for x in items[:3]])
    print('has_dkp=', any(str(x.get('id','')).startswith('dkp-') for x in items))
PY
curl -fsS -o /dev/null -w "frontend:%{http_code}\n" http://127.0.0.1:3000/ || true
curl -fsS -o /dev/null -w "nginx:%{http_code}\n" http://127.0.0.1/ || true
curl -fsS -o /dev/null -w "pdp6042:%{http_code}\n" http://127.0.0.1:5080/api/catalog/products/dkp-22315884 || true
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


def make_scrape_tarball(src: Path, dest: Path) -> None:
    if not src.is_dir():
        die(f"missing scrape dir: {src}")
    with tarfile.open(dest, "w:gz") as tar:
        tar.add(src, arcname="digikala-scrape")


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 7200) -> str:
    print("\n$ " + cmd[:220])
    _i, out, err = client.exec_command(cmd, timeout=timeout, get_pty=True)
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
        print(etext[-3000:])
    if code != 0:
        die(f"remote command failed ({code}): {cmd}")
    return "".join(chunks)


def main() -> None:
    if not PASSWORD:
        die("Set MIXPLUS_SSH_PASSWORD")

    scrape_dir = REPO / "data" / "digikala-scrape"
    required = [
        "product-management.json",
        "variant-management.json",
        "product-details.json",
    ]
    missing = [n for n in required if not (scrape_dir / n).exists()]
    if missing:
        die(f"missing scrape files: {missing}")

    tmp = Path(tempfile.mkdtemp(prefix="mixplus-digi-deploy-"))
    fe_tar = tmp / "frontend.tgz"
    be_tar = tmp / "backend.tgz"
    scrape_tar = tmp / "scrape.tgz"

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
    print("Packaging scrape data...")
    make_scrape_tarball(scrape_dir, scrape_tar)
    print(
        f"sizes fe={fe_tar.stat().st_size} be={be_tar.stat().st_size} scrape={scrape_tar.stat().st_size}"
    )

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()
    run(client, f"rm -rf {REMOTE_UPLOAD} && mkdir -p {REMOTE_UPLOAD}", timeout=60)
    print("Uploading packages...")
    sftp.put(str(fe_tar), f"{REMOTE_UPLOAD}/frontend.tgz")
    sftp.put(str(be_tar), f"{REMOTE_UPLOAD}/backend.tgz")
    sftp.put(str(scrape_tar), f"{REMOTE_UPLOAD}/scrape.tgz")
    with sftp.file(f"{REMOTE_UPLOAD}/deploy.sh", "w") as f:
        f.write(REMOTE_SH)
    sftp.chmod(f"{REMOTE_UPLOAD}/deploy.sh", 0o755)
    sftp.close()

    started = time.time()
    run(client, f"bash {REMOTE_UPLOAD}/deploy.sh", timeout=7200)
    client.close()
    print(f"\nDone in {int(time.time() - started)}s")
    print("Storefront: http://45.149.78.183/")
    print("PDP sample: http://45.149.78.183/product/dkp-22315884")
    print("Seller: http://45.149.78.183/seller/login")


if __name__ == "__main__":
    main()
