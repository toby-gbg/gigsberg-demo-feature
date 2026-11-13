'use client';

import { FC } from 'react';

interface StarRatingProps {
    count: number;
}

const StarRating: FC<StarRatingProps> = ({ count }) => {
    return (
        <div className="flex">
            {[...Array(count)].map((_, index) => (
                <span key={index} className="text-orange-500 text-4xl">
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
