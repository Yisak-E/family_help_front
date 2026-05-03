// components/CategoryBadge.tsx
import { ServiceCategory } from '@/services/api';

const labels: Record<ServiceCategory | string, string> = {
  CHILDCARE:      '👶 Childcare',
  TUTORING:       '📚 Tutoring',
  TRANSPORTATION: '🚗 Transport',
  ELDER_CARE:     '💛 Elder Care',
  HOUSEHOLD:      '🏡 Household',
};

export default function CategoryBadge({ category }: { category: ServiceCategory | string }) {
  return (
    <span className={`badge badge-${category.toLowerCase()}`}>
      {labels[category]}
    </span>
  );
}
