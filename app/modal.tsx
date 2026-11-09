import { useRouter } from 'expo-router';

import { ActivityModal } from '@/components/merchant/activity-modal';

export default function ActivityRoute() {
  const router = useRouter();

  return (
    <ActivityModal
      onClose={() => {
        router.back();
      }}
    />
  );
}
