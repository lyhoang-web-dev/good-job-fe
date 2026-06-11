import { createFileRoute } from '@tanstack/react-router';

import ProfilePage from '@/lib/pages/profile';

export const Route = createFileRoute('/_authenticated/profile/$userId')({
  component: ProfileRoute,
});

function ProfileRoute() {
  const { userId } = Route.useParams();
  return <ProfilePage userId={userId} />;
}
