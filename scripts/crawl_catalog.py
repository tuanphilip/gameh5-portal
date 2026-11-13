import urllib.request
import urllib.parse
import json
import re
import time
import os

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching JSON {url}: {e}")
        return None

def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching HTML {url}: {e}")
        return ""

def main():
    print("=== Bước 1: Thu thập thông tin 255 game từ WP REST API ===")
    all_raw_games = []
    
    # Page size 100
    for page in range(1, 4):
        url = f"https://gamehihi.com/vi/wp-json/wp/v2/gamejoy_game?per_page=100&page={page}"
        print(f"Đang lấy trang {page}...")
        data = fetch_json(url)
        if not data:
            break
        all_raw_games.extend(data)
        time.sleep(1)

    print(f"Tổng số game thu thập được: {len(all_raw_games)}")

    # Lấy danh sách chuyên mục
    cat_map = {}
    cats_data = fetch_json("https://gamehihi.com/vi/wp-json/wp/v2/gamejoy_game_cat?per_page=100") or []
    for c in cats_data:
        cat_map[c['id']] = {'name': c['name'], 'slug': c['slug']}

    processed_games = []

    print("\n=== Bước 2: Phân tích chi tiết và bóc tách Play URL từng game ===")
    for idx, g in enumerate(all_raw_games, 1):
        gid = g['id']
        slug = g['slug']
        title = g['title']['rendered']
        link = g['link']
        
        # Categories
        g_cats = [cat_map[cid]['name'] for cid in g.get('gamejoy_game_cat', []) if cid in cat_map]
        is_viet = (329 in g.get('gamejoy_game_cat', [])) or any('viet' in cat_map.get(cid, {}).get('slug', '') for cid in g.get('gamejoy_game_cat', []))
        
        # Featured Image
        thumb_url = ""
        yoast_json = g.get('yoast_head_json', {})
        if yoast_json and 'og_image' in yoast_json and yoast_json['og_image']:
            thumb_url = yoast_json['og_image'][0].get('url', '')

        # Content description clean
        desc = re.sub(r'<[^>]+>', ' ', g.get('content', {}).get('rendered', '')).strip()
        desc = re.sub(r'\s+', ' ', desc)

        print(f"[{idx}/{len(all_raw_games)}] ID: {gid} | {title} | Việt: {is_viet}")

        # Fetch play page to resolve direct iframe/play URL
        play_url = ""
        raw_iframe_src = ""
        game_origin_type = "iframe"

        try:
            page_html = fetch_html(link)
            nonce_m = re.search(r'\"restNonce\":\"([a-f0-9]+)\"', page_html)
            if nonce_m:
                nonce = nonce_m.group(1)
                p_api = f"https://gamehihi.com/vi/wp-json/gamejoyh5/v1/play-url/{gid}"
                p_req = urllib.request.Request(p_api, headers={
                    'User-Agent': HEADERS['User-Agent'],
                    'Referer': link,
                    'X-WP-Nonce': nonce
                })
                with urllib.request.urlopen(p_req, timeout=10) as p_res:
                    p_data = json.loads(p_res.read().decode('utf-8'))
                    play_url = p_data.get('url', '')

            if play_url:
                # Nếu là URL nội bộ launcher gamehihi-play
                if 'gamehihi.com/gamehihi-play/' in play_url:
                    launcher_html = fetch_html(play_url)
                    iframes = re.findall(r'<iframe[^>]+src=[\"\']([^\"\']+)[\"\']', launcher_html)
                    if iframes:
                        raw_iframe_src = iframes[0]
                    else:
                        raw_iframe_src = play_url
                else:
                    raw_iframe_src = play_url
            
            # Phân loại
            if 'workers.dev' in raw_iframe_src or is_viet or 'gamejoyh5' in raw_iframe_src:
                game_origin_type = "self-hosted"
            else:
                game_origin_type = "iframe"

        except Exception as err:
            print(f"   Lỗi bóc tách URL chơi game {gid}: {err}")

        game_item = {
            'id': gid,
            'slug': slug,
            'title': title,
            'categories': g_cats,
            'is_viet': is_viet,
            'thumbnail': thumb_url,
            'description': desc[:500],
            'page_url': link,
            'play_url': play_url,
            'direct_game_url': raw_iframe_src,
            'type': game_origin_type
        }
        processed_games.append(game_item)
        time.sleep(0.3)

    output_path = "/root/game-portal-project/data/games.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(processed_games, f, ensure_ascii=False, indent=2)

    print(f"\n Hoàn tất! Đã lưu {len(processed_games)} game vào {output_path}")

if __name__ == "__main__":
    main()
