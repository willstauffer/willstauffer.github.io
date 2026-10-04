from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root / 'portfolio/build_globe.py'), '--output-dir', str(root)], check=True)
(root / 'project-globe.html').replace(root / 'index.html')
print('Built index.html and assets/.')
