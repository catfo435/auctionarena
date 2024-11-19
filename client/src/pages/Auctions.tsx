import { FunctionComponent, useEffect, useState } from "react";
import { AuctionCard } from "../components/AuctionCard";
import { AuctionModal } from "../components/AuctionModal";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../toasts";

interface Auction {
    auction_id: string;
    artwork_id: string;
    status: 'ongoing' | 'completed';
    s_time: string;
    e_time: string;
    highest_bid: number;
    artwork_title: string;
    image_url: string;
}

interface AuctionsResponse {
    trendingAuctions: Auction[];
    newestAuctions: Auction[];
}

const AuctionsPage: FunctionComponent = () => {
    // State to store auction data
    const [trendingAuctions, setTrendingAuctions] = useState<any[]>([]);
    const [newestAuctions, setNewestAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedAuction, setSelectedAuction] = useState<any | null>(null); // State to manage selected auction
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility

    const { id } = useParams()
    const navigate = useNavigate()

    const fetchAuction = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auction/${id}`, { credentials: "include" });
            const data = await response.json();
            setSelectedAuction(data)
            setIsModalOpen(true);
        } catch (error) {
            toastError("Something went wrong")
            navigate("/auctions")
            console.error("Error fetching auction", error);
        }
    };

    const fetchAuctions = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auction`, { credentials: "include" });
            const data: AuctionsResponse = await response.json();
            setTrendingAuctions(data.trendingAuctions);
            setNewestAuctions(data.newestAuctions);
            setLoading(false);
        } catch (error) {
            toastError("Something went wrong")
            console.error("Error fetching auctions:", error);
            setLoading(false);
        }
    };

    // Fetch auctions data from the API
    useEffect(() => {
        fetchAuctions();
    }, []);

    useEffect(() => {
        if (id) fetchAuction()
    }, [id])

    const [forceRender, setForceRender] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setForceRender((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    const getFormattedTimeLeft = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const time = Math.max(0, end.getTime() - now.getTime());

        if (time <= 0) return "Auction Ended";

        const months = Math.floor(time / (1000 * 3600 * 24 * 30));
        const weeks = Math.floor((time % (1000 * 3600 * 24 * 30)) / (1000 * 3600 * 24 * 7));
        const days = Math.floor((time % (1000 * 3600 * 24 * 7)) / (1000 * 3600 * 24));
        const hours = Math.floor((time % (1000 * 3600 * 24)) / (1000 * 3600));
        const minutes = Math.floor((time % (1000 * 3600)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        return [
            months > 0 ? `${months}m` : "",
            weeks > 0 ? `${weeks}w` : "",
            days > 0 ? `${days}d` : "",
            hours > 0 ? `${hours}h` : "",
            minutes > 0 ? `${minutes}m` : "",
            seconds > 0 ? `${seconds}s` : ""
        ]
            .filter(Boolean)
            .join(" ") + " left";
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAuction(null);
        fetchAuctions()
        navigate("/auctions")
    };

    const handleBid = async (amount: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auction/${selectedAuction.auction_id}/bid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: "your-user-id",
                    amount,
                }),
                credentials: "include"
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to place bid:", error.message);
                toastError("Failed to place bid: " + error.message);
                return;
            }

            toastSuccess("Bid placed successfully!");

            fetchAuction()
        } catch (error) {
            console.error("Error placing bid:", error);
            toastError("An error occurred while placing the bid.");
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading auctions...</div>;
    }

    return (
        <div className="auctionsPage flex flex-col w-full h-full bg-gray-100">
            <AuctionModal
                isOpen={isModalOpen}
                auction={selectedAuction}
                onClose={closeModal}
                onBid={handleBid}
            />
            <div className="routeSpecifier flex justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">AUCTIONS</span>
                <span className="italic text-xl">Bid and Win!</span>
            </div>

            <div className="flex justify-center w-full grow px-36">
                <div className="auctionsGrid grid grid-rows-2 gap-6 py-10 w-full lg:w-3/4 h-fit">
                    {/* Trending Auctions */}
                    <div className="trendingAuctions w-full overflow-x-auto scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Trending Auctions</h2>
                        {trendingAuctions.length === 0 ? (
                            <div>No trending auctions available.</div>
                        ) : (
                            <div className="flex space-x-4">
                                {trendingAuctions.map((auction, index) => (
                                    <Link to={`/auctions/${auction.auction_id}`} key={index}>
                                        <AuctionCard
                                            title={auction.artwork_title}
                                            imageUrl={auction.image_url}
                                            highestBid={auction.highest_bid}
                                            timeLeft={getFormattedTimeLeft(auction.e_time)}
                                        />
                                    </Link>
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
                            <div className="flex space-x-4">
                                {newestAuctions.map((auction, index) => (
                                    <Link to={`/auctions/${auction.auction_id}`} key={index}>
                                        <AuctionCard
                                            title={auction.artwork_title}
                                            imageUrl={auction.image_url}
                                            highestBid={(auction.highest_bid)}
                                            timeLeft={getFormattedTimeLeft(auction.e_time)}
                                        />
                                    </Link>
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