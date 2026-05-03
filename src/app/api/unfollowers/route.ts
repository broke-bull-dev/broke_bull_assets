import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const IG_APP_ID = '936619743392459';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function igHeaders(sessionid: string) {
  return {
    'X-IG-App-ID': IG_APP_ID,
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: `sessionid=${sessionid}`,
    'User-Agent': UA,
    Referer: 'https://www.instagram.com/',
    Origin: 'https://www.instagram.com',
  };
}

// The user ID is the first segment of the decoded sessionid: "{userId}:{...}"
function extractUserId(sessionid: string): string {
  const decoded = decodeURIComponent(sessionid);
  const userId = decoded.split(':')[0];
  if (!userId || !/^\d+$/.test(userId)) {
    throw new Error('sessionid inválido — no se pudo extraer el user ID');
  }
  return userId;
}

async function fetchList(
  sessionid: string,
  url: string
): Promise<{ username: string; full_name: string; profile_pic_url: string }[]> {
  const results: { username: string; full_name: string; profile_pic_url: string }[] = [];
  let nextMaxId: string | null = null;

  while (true) {
    const params = new URLSearchParams({ count: '100' });
    if (nextMaxId) params.set('max_id', nextMaxId);

    const res = await fetch(`${url}?${params}`, { headers: igHeaders(sessionid) });
    if (!res.ok) throw new Error(`Error al obtener lista (${res.status})`);

    const data = await res.json();
    for (const u of data.users ?? []) {
      results.push({
        username: u.username,
        full_name: u.full_name ?? '',
        profile_pic_url: u.profile_pic_url ?? '',
      });
    }

    nextMaxId = data.next_max_id ?? null;
    if (!nextMaxId) break;
    await new Promise((r) => setTimeout(r, 800));
  }

  return results;
}

export async function POST(req: NextRequest) {
  const { username, sessionid } = await req.json();

  if (!username || !sessionid) {
    return NextResponse.json({ error: 'Faltan username o sessionid' }, { status: 400 });
  }

  try {
    const userId = extractUserId(sessionid);

    const following = await fetchList(
      sessionid,
      `https://i.instagram.com/api/v1/friendships/${userId}/following/`
    );

    const followers = await fetchList(
      sessionid,
      `https://i.instagram.com/api/v1/friendships/${userId}/followers/`
    );

    const followerSet = new Set(followers.map((u) => u.username));
    const unfollowers = following
      .filter((u) => !followerSet.has(u.username))
      .sort((a, b) => a.username.localeCompare(b.username));

    return NextResponse.json({
      following_count: following.length,
      followers_count: followers.length,
      unfollowers,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
