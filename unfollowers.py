#!/usr/bin/env python3
"""
Lista usuarios que seguís pero que no te siguen de vuelta.
Usa las cookies de tu navegador (no requiere contraseña).

Requisitos: pip install instaloader browser-cookie3
Uso: python3 unfollowers.py <tu_usuario>
"""

import sys
import instaloader

try:
    import browser_cookie3
except ImportError:
    print("Falta instalar browser-cookie3: pip install browser-cookie3")
    sys.exit(1)


def load_browser_cookies(session):
    for loader, name in [
        (browser_cookie3.chrome, "Chrome"),
        (browser_cookie3.firefox, "Firefox"),
        (browser_cookie3.safari, "Safari"),
    ]:
        try:
            cookies = loader(domain_name=".instagram.com")
            session.cookies.update(cookies)
            if session.cookies.get("sessionid"):
                print(f"Sesion cargada desde {name}.")
                return True
        except Exception:
            continue
    return False


def get_unfollowers(username):
    L = instaloader.Instaloader()

    if not load_browser_cookies(L.context._session):
        print("No se encontraron cookies de Instagram en ningun navegador.")
        print("Asegurate de estar logueado en Instagram en Chrome, Firefox o Safari.")
        sys.exit(1)

    L.context.username = username

    try:
        profile = instaloader.Profile.from_username(L.context, username)
    except Exception as e:
        print(f"Error al cargar el perfil: {e}")
        sys.exit(1)

    print("Obteniendo seguidos...")
    following = set(p.username for p in profile.get_followees())

    print("Obteniendo seguidores...")
    followers = set(p.username for p in profile.get_followers())

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
    if len(sys.argv) != 2:
        print(f"Uso: python3 {sys.argv[0]} <tu_usuario_de_instagram>")
        sys.exit(1)
    get_unfollowers(sys.argv[1])
