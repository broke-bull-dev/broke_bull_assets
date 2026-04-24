#!/usr/bin/env python3
"""
Lista los usuarios que seguís en Instagram pero que no te siguen de vuelta.
Uso: python3 check_unfollowers.py <tu_usuario>
"""

import sys
import instaloader


def get_unfollowers(username: str) -> None:
    L = instaloader.Instaloader()

    print(f"Iniciando sesión como '{username}'...")
    try:
        L.load_session_from_file(username)
        print("Sesión cargada desde archivo.")
    except FileNotFoundError:
        L.interactive_login(username)
        L.save_session_to_file()
        print("Sesión guardada para futuros usos.")

    profile = instaloader.Profile.from_username(L.context, username)

    print("Obteniendo lista de seguidos (following)...")
    following = set(p.username for p in profile.get_followees())

    print("Obteniendo lista de seguidores (followers)...")
    followers = set(p.username for p in profile.get_followers())

    unfollowers = following - followers

    print(f"\n{'='*50}")
    print(f"Seguís a {len(following)} cuentas.")
    print(f"Te siguen {len(followers)} cuentas.")
    print(f"No te siguen de vuelta: {len(unfollowers)} cuentas.")
    print(f"{'='*50}\n")

    if unfollowers:
        for i, user in enumerate(sorted(unfollowers), 1):
            print(f"{i:3}. https://www.instagram.com/{user}/")
    else:
        print("Todo el mundo que seguís te sigue de vuelta.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Uso: python3 {sys.argv[0]} <tu_usuario_de_instagram>")
        sys.exit(1)

    get_unfollowers(sys.argv[1])
