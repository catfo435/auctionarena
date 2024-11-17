import { FunctionComponent, useEffect, useState } from "react";
import { AuctionCard } from "../components/AuctionCard";

const AuctionsPage: FunctionComponent = () => {
    // State to store auction data
    const [trendingAuctions, setTrendingAuctions] = useState<any[]>([]);
    const [newestAuctions, setNewestAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch auctions data from the API
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auction`);
                const data = await response.json();
                setTrendingAuctions(data.trendingAuctions);
                setNewestAuctions(data.newestAuctions);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching auctions:", error);
                setLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    // Function to format the time left in a human-readable way
    const formatTimeLeft = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const timeDiff = end.getTime() - now.getTime();

        if (timeDiff <= 0) return "Auction Ended";

        const hours = Math.floor(timeDiff / (1000 * 3600));
        const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
        return `${hours}h ${minutes}m left`;
    };

    if (loading) {
        return <div className="text-center p-8">Loading auctions...</div>;
    }

    return (
        <div className="auctionsPage flex flex-col w-full h-full bg-gray-100">
            <div className="routeSpecifier flex justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">AUCTIONS</span>
                <span className="italic text-xl">Bid and Win!</span>
            </div>

            <div className="flex justify-center w-full grow px-36">
                <div className="auctionsGrid grid grid-rows-2 gap-6 py-10 w-full lg:w-3/4 h-fit">
                    {/* Trending Auctions */}
                    <div className="trendingAuctions w-full overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-4">Trending Auctions</h2>
                        {trendingAuctions.length === 0 ? (
                            <div>No trending auctions available.</div>
                        ) : (
                            <div className="flex space-x-2">
                                {trendingAuctions.map((auction, index) => (
                                <AuctionCard
                                    key={index}
                                    title={auction.artwork_title}
                                    imageUrl={auction.image_url}
                                    highestBid={auction.highest_bid}
                                    timeLeft={formatTimeLeft(auction.e_time)}
                                />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Newest Auctions */}
                    <div className="newestAuctions w-full overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-4">Newest Auctions</h2>
                        {newestAuctions.length === 0 ? (
                            <div>No newest auctions available.</div>
                        ) : (
                            <div className="flex space-x-2">
                                {newestAuctions.map((auction, index) => (
                                <AuctionCard
                                    key={index}
                                    title={auction.artwork_title}
                                    imageUrl={auction.image_url}
                                    highestBid={auction.highest_bid}
                                    timeLeft={formatTimeLeft(auction.e_time)}
                                />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionsPage;
