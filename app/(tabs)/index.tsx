import { useRouter } from 'expo-router';

import { HomeScreen } from '@/components/merchant/home-screen';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      onShowMore={() => {
        router.push('/modal');
      }}
    />
  );
}
