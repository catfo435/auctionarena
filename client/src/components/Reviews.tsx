import { FunctionComponent, useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { toastError } from "../toasts";

interface Review {
    date: string;
    artwork_title: string;
    rating: number;
}

const Reviews: FunctionComponent = () => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/reviews`, { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                } else {
                    toastError("Failed to fetch reviews");
                }
            })
            .catch((e) => {
                toastError("Something went wrong");
                console.error(e);
            });
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {Array.from({ length: rating }).map((_, index) => (
                    <AiFillStar key={index} className="text-yellow-500" />
                ))}
            </div>
        );
    };

    return (
        <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-4">Your Reviews</h1>
            {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews found.</p>
            ) : (
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border border-gray-300">Date</th>
                            <th className="p-2 border border-gray-300">Artwork</th>
                            <th className="p-2 border border-gray-300">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50">
                                <td className="p-2 border border-gray-300">{new Date(review.date).toLocaleDateString()}</td>
                                <td className="p-2 border border-gray-300">{review.artwork_title}</td>
                                <td className="p-2 border border-gray-300">{renderStars(review.rating)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Reviews;