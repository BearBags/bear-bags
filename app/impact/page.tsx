import { getContributions } from '@/lib/contributions';
import ImpactView from './ImpactView';

// Static page, rebuilt when the admin changes a contribution (revalidatePath in
// app/api/admin/contributions) and every 5 minutes as a safety net.
export const revalidate = 300;

export default async function ImpactPage() {
  const contributions = await getContributions();
  return <ImpactView contributions={contributions} />;
}
