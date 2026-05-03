// components/StatusBadge.tsx
import { RequestStatus } from '@/services/api';

const labels: Record<RequestStatus | string, string> = {
  PENDING:   '⏳ Pending',
  ACCEPTED:  '✅ Accepted',
  REJECTED:  '❌ Rejected',
  COMPLETED: '🎉 Completed',
};

export default function StatusBadge({ status }: { status: RequestStatus | string }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}
