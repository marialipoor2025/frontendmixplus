import os
import pathlib
import subprocess
import sys

home_path = pathlib.Path(__file__).resolve().parents[1] / "src/Host/MixPlus.Api/Seed/data/home.json"
home = home_path.read_text(encoding="utf-8")
sql = f"""
UPDATE merchandising."HomePages"
SET "PayloadJson" = $json${home}$json$::jsonb,
    "UpdatedAtUtc" = NOW() AT TIME ZONE 'utc'
WHERE "Key" = 'default';
SELECT "PayloadJson"->'heroSlides'->0->>'title' AS title;
"""
env = os.environ.copy()
env["PGPASSWORD"] = "mixplus_dev"
result = subprocess.run(
    [
        r"C:\PostgreSQL\16\bin\psql.exe",
        "-U",
        "mixplus",
        "-h",
        "127.0.0.1",
        "-d",
        "mixplus",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql,
    ],
    env=env,
    capture_output=True,
    text=True,
    encoding="utf-8",
)
sys.stdout.write(result.stdout)
sys.stderr.write(result.stderr)
raise SystemExit(result.returncode)
