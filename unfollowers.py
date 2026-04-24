#!/usr/bin/env python3
"""
Lista usuarios que seguís pero que no te siguen de vuelta.

Uso:
  python3 unfollowers.py <usuario> <sessionid>

El sessionid se obtiene desde Chrome:
  F12 > Application > Cookies > www.instagram.com > sessionid
"""

import sys
import time
import requests


def get_user_id(session, username):
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
    headers = {
        "X-IG-App-ID": "936619743392459",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": f"https://www.instagram.com/{username}/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    }
    resp = session.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()["data"]["user"]["id"]


def get_paginated(session, url):
    results = []
    next_max_id = None
    headers = {
        "X-IG-App-ID": "936619743392459",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    }
    while True:
        params = {"count": 100}
        if next_max_id:
            params["max_id"] = next_max_id
        resp = session.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()
        results.extend(u["username"] for u in data.get("users", []))
        next_max_id = data.get("next_max_id")
        if not next_max_id:
            break
        time.sleep(1)
    return set(results)


def get_unfollowers(username, sessionid):
    session = requests.Session()
    session.cookies.set("sessionid", sessionid, domain=".instagram.com")

    print("Obteniendo ID del perfil...")
    try:
        user_id = get_user_id(session, username)
    except Exception as e:
        print(f"Error: no se pudo obtener el perfil. Verificá que el sessionid sea correcto.\nDetalle: {e}")
        sys.exit(1)

    print("Obteniendo seguidos...")
    following = get_paginated(session, f"https://i.instagram.com/api/v1/friendships/{user_id}/following/")

    print("Obteniendo seguidores...")
    followers = get_paginated(session, f"https://i.instagram.com/api/v1/friendships/{user_id}/followers/")

    unfollowers = following - followers

    print(f"\n{'='*50}")
    print(f"Seguis a {len(following)} cuentas.")
    print(f"Te siguen {len(followers)} cuentas.")
    print(f"No te siguen de vuelta: {len(unfollowers)} cuentas.")
    print(f"{'='*50}\n")

    if unfollowers:
        for i, user in enumerate(sorted(unfollowers), 1):
            print(f"{i:3}. https://www.instagram.com/{user}/")
    else:
        print("Todo el mundo que seguis te sigue de vuelta.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Uso: python3 {sys.argv[0]} <usuario> <sessionid>")
        print()
        print("Para obtener el sessionid:")
        print("  1. Abre Instagram en Chrome")
        print("  2. Presiona F12 > Application > Cookies > www.instagram.com")
        print("  3. Copia el valor de 'sessionid'")
        sys.exit(1)

    get_unfollowers(sys.argv[1], sys.argv[2])
