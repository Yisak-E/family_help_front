// components/StatusBadge.tsx
import { RequestStatus } from '@/services/api';

const labels: Record<RequestStatus, string> = {
  PENDING:   '⏳ Pending',
  ACCEPTED:  '✅ Accepted',
  REJECTED:  '❌ Rejected',
  COMPLETED: '🎉 Completed',
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}
