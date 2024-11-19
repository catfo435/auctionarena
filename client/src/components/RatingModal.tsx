import { FunctionComponent, useState, useEffect } from "react";
import { Modal, Button, Rating } from "flowbite-react";

interface RatingModalProps {
    isOpen: boolean;
    artwork: any;
    onClose: () => void;
    onRate: (rating: number) => void;
}

export const RatingModal: FunctionComponent<RatingModalProps> = ({ isOpen, artwork, onClose, onRate }) => {
    const [rating, setRating] = useState<number>(0);

    useEffect(() => {
        if (isOpen && artwork) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/review/${artwork.artwork_id}`, {credentials : "include"})
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.length > 0) {
                        setRating(data[0].rating);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching rating:", error);
                });
        }
    }, [isOpen, artwork]);

    if (!isOpen || !artwork) return null;

    const handleRate = () => {
        if (rating > 0) {
            onRate(rating);
            onClose();
            setRating(0);
        } else {
            alert("Please select a rating before submitting.");
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} size="lg">
            <Modal.Header>Rate Artwork</Modal.Header>
            <Modal.Body>
                <div className="grid grid-cols-2">
                    <div className="w-full aspect-w-16 aspect-h-9 p-8">
                        <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-between py-10 space-y-10">
                        <div className="text-center">
                            <span className="font-bold text-3xl">{artwork.title}</span>
                            <span className="italic text-xl block mt-2">by {artwork.artist}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <span className="text-2xl">Select Rating:</span>
                            <Rating>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Rating.Star
                                        key={value}
                                        filled={value <= rating}
                                        onClick={() => setRating(value)}
                                    />
                                ))}
                            </Rating>
                            <span className="text-lg">{rating} Star{rating !== 1 ? "s" : ""}</span>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button color="gray" onClick={onClose}>
                    Cancel
                </Button>
                <Button color="green" onClick={handleRate}>
                    Submit Rating
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RatingModal;