import urllib.request
import re
import os

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://gamehihi.com/'
}

GAMES_DIR = '/root/game-portal-project/public/games'

def fetch_content(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            return res.read()
    except Exception as e:
        return None

def patch_base_href_game(slug):
    game_path = os.path.join(GAMES_DIR, slug, 'index.html')
    if not os.path.exists(game_path):
        return
    with open(game_path, 'r', encoding='utf-8') as f:
        html = f.read()

    base_matches = re.findall(r'<base\s+href=[\"\']([^\"\']+)[\"\']', html)
    if not base_matches:
        return
    base_url = base_matches[0]
    print(f"Refining {slug} with base href: {base_url}")
    dest_dir = os.path.join(GAMES_DIR, slug)

    # 1. Download scripts using base_url
    scripts = re.findall(r'<script[^>]*src=[\"\']([^\"\']+)[\"\']', html)
    for s in scripts:
        if s.startswith('http') or s.startswith('js/'):
            s_clean = s.replace('js/', '')
        else:
            s_clean = s
        s_filename = os.path.basename(s_clean.split('?')[0])
        s_full = urllib.parse.urljoin(base_url, s_clean)
        data = fetch_content(s_full)
        if data:
            js_path = os.path.join(dest_dir, 'js', s_filename)
            with open(js_path, 'wb') as sf:
                sf.write(data)
            print(f"  [FIXED JS] {s_filename} ({len(data)} bytes)")
            html = html.replace(s, f"js/{s_filename}")

    # Remove base href so relative paths work locally
    html = re.sub(r'<base\s+href=[\"\'][^\"\']+[\"\']\s*/?>', '', html)

    with open(game_path, 'w', encoding='utf-8') as f:
        f.write(html)

def main():
    for slug in os.listdir(GAMES_DIR):
        patch_base_href_game(slug)

if __name__ == "__main__":
    main()
