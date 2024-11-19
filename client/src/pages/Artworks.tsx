import { FunctionComponent, useEffect, useState } from "react";
import { ArtworkCard } from "../components/ArtworkCard";
import { Button } from "flowbite-react";
import RatingModal from "../components/RatingModal";
import { toastError, toastSuccess } from "../toasts";

const ArtworksPage: FunctionComponent = () => {
    // State to store artwork data
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
    const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

    const openRatingModal = (artwork: any) => {
        setSelectedArtwork(artwork);
        setShowRatingModal(true);
    };

    const submitRating = async (rating: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ rating, artwork_id: selectedArtwork.artwork_id }),
            });
    
            const result = await response.json();
            if (response.ok) {
                toastSuccess(result.message);
            } else {
                toastError(result.error || "Failed to submit the review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toastError("An error occurred. Please try again.");
        }
    };    

    // Fetch artworks data from the API
    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artwork`, { credentials: "include" });
                const data = await response.json();
                setArtworks(data.artworks);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching artworks:", error);
                setLoading(false);
            }
        };

        fetchArtworks();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading artworks...</div>;
    }

    return (
        <div className="artworksPage flex flex-col w-full h-full bg-gray-100 overflow-y-auto">
            <RatingModal
                isOpen={showRatingModal}
                artwork={selectedArtwork}
                onClose={() => setShowRatingModal(false)}
                onRate={submitRating}
            />
            <div className="routeSpecifier flex justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">ARTWORKS</span>
                <span className="italic text-xl">Get Mesmerized</span>
            </div>

            <div className="flex justify-center w-full grow px-36">
                <div className="artworksGrid grid grid-cols-3 gap-8 py-10 w-full lg:w-3/4 h-[35rem]">
                    {/* Artworks */}
                    {artworks.length === 0 ? (
                        <div>No artworks available.</div>
                    ) : (
                        artworks.map((artwork, index) => (
                            <div className="bg-white p-2 shadow-lg rounded-xl flex flex-col justify-center items-center">
                                <ArtworkCard
                                    key={index}
                                    artist={artwork.artist}
                                    imageUrl={artwork.image_url}
                                    title={artwork.title}
                                    highestBid={artwork.highest_price}
                                    status={artwork.status}
                                    auction_id={artwork.auction_id}
                                />
                                <Button color="green" size="sm" onClick={() => openRatingModal(artwork)}>
                                    Rate this artwork
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtworksPage;