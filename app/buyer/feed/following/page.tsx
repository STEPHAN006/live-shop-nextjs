'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FollowingFeedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/buyer/feed');
  }, [router]);

  return null;
}
