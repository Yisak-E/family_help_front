'use client';
// components/StarRating.tsx

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
}

export default function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className="stars">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <span
          key={n}
          className={`star ${n <= value ? '' : 'empty'}`}
          onClick={() => onChange?.(n)}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
