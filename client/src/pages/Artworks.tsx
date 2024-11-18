import { FunctionComponent, useEffect, useState } from "react";
import { ArtworkCard } from "../components/ArtworkCard";

const ArtworksPage: FunctionComponent = () => {
    // State to store artwork data
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch artworks data from the API
    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artwork`);
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
        <div className="artworksPage flex flex-col w-full h-full bg-gray-100">
            <div className="routeSpecifier flex justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">ARTWORKS</span>
                <span className="italic text-xl">Get Mesmerized</span>
            </div>

            <div className="flex justify-center w-full grow px-36">
                <div className="artworksGrid grid grid-cols-3 gap-8 py-10 w-full lg:w-3/4 h-[35rem] overflow-y-auto">
                    {/* Artworks */}
                    {artworks.length === 0 ? (
                            <div>No artworks available.</div>
                        ) : (
                            artworks.map((artwork, index) => (
                                <ArtworkCard
                                    key={index}
                                    imageUrl={artwork.image_url}
                                    title={artwork.title}
                                    highestBid={artwork.highest_price}
                                    status={artwork.status}
                                />
                            ))
                        )}
                </div>
            </div>
        </div>
    );
};

export default ArtworksPage;