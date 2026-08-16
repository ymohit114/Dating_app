import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { getDiscoveryStack } from '@/services/discovery.service';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const { searchParams } = new URL(req.url);
    const minAge = searchParams.get('minAge') ? Number(searchParams.get('minAge')) : 18;
    const maxAge = searchParams.get('maxAge') ? Number(searchParams.get('maxAge')) : 38;
    const maxDistanceKm = searchParams.get('maxDistanceKm') ? Number(searchParams.get('maxDistanceKm')) : 50;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const stack = await getDiscoveryStack(
      userId,
      { lng: 77.2090, lat: 28.6139 },
      { minAge, maxAge, maxDistanceKm, verifiedOnly }
    );

    return NextResponse.json({ profiles: stack });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch discovery stack' }, { status: 500 });
  }
}
