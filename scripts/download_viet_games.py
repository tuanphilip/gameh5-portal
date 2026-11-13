import urllib.request
import re
import os
import json
import time

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
        print(f"  Error fetching {url}: {e}")
        return None

def download_and_patch_game(slug, target_url):
    dest_dir = os.path.join(GAMES_DIR, slug)
    os.makedirs(dest_dir, exist_ok=True)
    os.makedirs(os.path.join(dest_dir, 'js'), exist_ok=True)
    os.makedirs(os.path.join(dest_dir, 'assets'), exist_ok=True)

    print(f"\n--> Bắt đầu tải Game: {slug} từ {target_url}")
    html_bytes = fetch_content(target_url)
    if not html_bytes:
        print(f"  Thất bại tải HTML {target_url}")
        return False

    html = html_bytes.decode('utf-8', errors='ignore')
    base_url = target_url.rstrip('/') + '/'

    # 1. Tìm các script .js
    scripts = set(re.findall(r'<script[^>]*src=[\"\']([^\"\']+)[\"\']', html))
    for s in scripts:
        if 'googletagmanager' in s or 'google-analytics' in s:
            continue
        s_clean = s.split('?')[0]
        s_filename = os.path.basename(s_clean)
        if s.startswith('http'):
            s_full = s
        else:
            s_full = urllib.parse.urljoin(base_url, s)
        
        js_data = fetch_content(s_full)
        if js_data:
            js_path = os.path.join(dest_dir, 'js', s_filename)
            with open(js_path, 'wb') as f:
                f.write(js_data)
            print(f"  [JS] Đã tải {s_filename} ({len(js_data)} bytes)")
            # Replace in HTML
            html = html.replace(s, f"js/{s_filename}")

    # 2. Tìm audio / texture / image
    media_files = set(re.findall(r'[\"\']([a-zA-Z0-9_\-/\.]+\.(?:mp3|wav|ogg|png|jpg|jpeg|webp|svg))[\"\']', html))
    for m in media_files:
        if m.startswith('data:') or m.startswith('blob:'):
            continue
        m_clean = m.split('?')[0]
        m_filename = os.path.basename(m_clean)
        if m.startswith('http'):
            m_full = m
        else:
            m_full = urllib.parse.urljoin(base_url, m)

        m_data = fetch_content(m_full)
        if m_data:
            m_path = os.path.join(dest_dir, 'assets', m_filename)
            with open(m_path, 'wb') as f:
                f.write(m_data)
            print(f"  [ASSET] Đã tải {m_filename} ({len(m_data)} bytes)")
            html = html.replace(m, f"assets/{m_filename}")

    # Remove GA / GTM tags
    html = re.sub(r'<script async src=\"https://www\.googletagmanager\.com/gtag/js.*?<\/script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<script>\s*window\.dataLayer.*?</script>', '', html, flags=re.DOTALL)

    # Save patched index.html
    index_path = os.path.join(dest_dir, 'index.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  --> Hoàn tất đóng gói {slug} tại {index_path}!")
    return True

def main():
    catalog_path = '/root/game-portal-project/data/games.json'
    if not os.path.exists(catalog_path):
        print("Chưa có games.json, chờ crawler hoàn thành...")
        return

    with open(catalog_path, 'r', encoding='utf-8') as f:
        games = json.load(f)

    viet_games = [g for g in games if g.get('is_viet') and g.get('direct_game_url')]
    print(f"Tổng số Game Việt phát hiện: {len(viet_games)}")

    success_count = 0
    for g in viet_games:
        slug = g['slug']
        url = g['direct_game_url']
        if 'workers.dev' in url or 'gamehihi' in url:
            if download_and_patch_game(slug, url):
                success_count += 1
            time.sleep(0.5)

    print(f"\n==========================================")
    print(f"ĐÃ TẢI THÀNH CÔNG {success_count}/{len(viet_games)} GAME VIỆT VỀ MÁY CHỦ!")
    print(f"==========================================")

if __name__ == "__main__":
    main()
