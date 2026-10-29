import zipfile
import os
import sys

def package_assets(apk_path, assets_dir):
    print(f"Adding assets from {assets_dir} into {apk_path} with standard forward slashes...")
    with zipfile.ZipFile(apk_path, 'a', compression=zipfile.ZIP_DEFLATED) as z:
        # Also add classes.dex if present in bin
        dex_path = os.path.join(os.path.dirname(assets_dir), 'bin', 'classes.dex')
        if os.path.exists(dex_path):
            print("Adding classes.dex...")
            z.write(dex_path, 'classes.dex')

        for root, dirs, files in os.walk(assets_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, assets_dir)
                
                # Standard asset entry with forward slashes: assets/...
                arcname = ('assets/' + rel_path).replace('\\', '/')
                z.write(full_path, arcname)
                print(f"  + {arcname}")
                
                # Also if rel_path starts with dist/, add candidate without dist/ as well
                if rel_path.startswith('dist' + os.sep) or rel_path.startswith('dist/'):
                    clean_rel = rel_path[5:]
                    clean_arc = ('assets/' + clean_rel).replace('\\', '/')
                    z.write(full_path, clean_arc)
                    print(f"  + {clean_arc}")

    print("All assets successfully packaged into APK with forward slashes.")

if __name__ == '__main__':
    apk = sys.argv[1] if len(sys.argv) > 1 else 'unaligned.apk'
    assets = sys.argv[2] if len(sys.argv) > 2 else 'assets'
    package_assets(apk, assets)
