'use client';

import { FC, useState } from 'react';

interface InteractiveStarRatingProps {
    value: number;
    onChange: (rating: number) => void;
}

const InteractiveStarRating: FC<InteractiveStarRatingProps> = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-4xl transition-colors focus:outline-none"
                >
                    <span
                        className={star <= (hover || value) ? 'text-orange-500' : 'text-gray-300'}
                    >
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
};

export default InteractiveStarRating;
