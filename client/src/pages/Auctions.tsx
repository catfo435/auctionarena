import { FunctionComponent, useEffect, useState } from "react";
import { AuctionCard } from "../components/AuctionCard";
import { AuctionModal } from "../components/AuctionModal";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../toasts";
import CreateAuctionModal from "../components/CreateAuctionModal";

interface Auction {
    auction_id: string;
    artwork_id: string;
    status: 'ongoing' | 'completed' | 'future';
    s_time: string;
    e_time: string;
    highest_bid: number;
    num_bids: number,
    artwork_title: string;
    image_url: string;
}

interface AuctionsResponse {
    trendingAuctions: Auction[];
    newestAuctions: Auction[];
    upcomingAuctions: Auction[];
}

const AuctionsPage: FunctionComponent = () => {
    // State to store auction data
    const [trendingAuctions, setTrendingAuctions] = useState<any[]>([]);
    const [newestAuctions, setNewestAuctions] = useState<any[]>([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedAuction, setSelectedAuction] = useState<any | null>(null); // State to manage selected auction
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
            setUpcomingAuctions(data.upcomingAuctions)
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

    const [_, setForceRender] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setForceRender((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    const getAuctionStatus = (endTime: string) => {
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
                body: JSON.stringify({ amount }),
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

    const handleAuctionSubmit = async (data: any) => {
        try {
            if (!data.image || data.image.length === 0) {
                toastError("Image is required.");
                return;
            }

            const formData = new FormData();

            formData.append("image", data.image);
            formData.append("artworkTitle", data.artworkTitle);
            formData.append("startPrice", data.startPrice);
            formData.append("startTime", data.startTime);
            formData.append("endTime", data.endTime);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artwork`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to create auction:", error.message);
                toastError("Failed to create auction: " + error.message);
                return;
            }

            const result = await response.json();
            toastSuccess("Auction created successfully!");
            navigate(`/auctions/${result.auctionId}`);
            fetchAuctions()
        } catch (error) {
            console.error("Error creating auction:", error);
            toastError("Failed to create auction");
        }
    };


    if (loading) {
        return <div className="text-center p-8">Loading auctions...</div>;
    }

    return (
        <div className="auctionsPage flex flex-col w-full h-full overflow-y-auto bg-gray-100">
            <AuctionModal
                isOpen={isModalOpen}
                auction={selectedAuction}
                onClose={closeModal}
                onBid={handleBid}
            />
            <CreateAuctionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleAuctionSubmit}
            />

            <div className="routeSpecifier flex shrink-0 justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">AUCTIONS</span>
                <span className="italic text-xl">Bid and Win!</span>
            </div>

            <div className="relative w-full grow px-36">
                <div className="absolute right-5 top-0 mt-4">
                    <button onClick={() => setIsCreateModalOpen(true)} className="p-3 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700">Create Auction</button>
                </div>
                <div className="auctions flex flex-col items-center space-y-4 py-5 w-full h-full">

                    <div className="trendingAuctions w-full">
                        <span className="text-2xl font-bold">Trending Auctions</span>
                        {trendingAuctions.length === 0 ? (
                            <div>No trending auctions available.</div>
                        ) : (
                            <div className="flex space-x-4 overflow-x-auto">
                                {trendingAuctions.map((auction, index) => (
                                    <Link to={`/auctions/${auction.auction_id}`} key={index}>
                                        <AuctionCard
                                            title={auction.artwork_title}
                                            imageUrl={auction.image_url}
                                            type="trending"
                                            quantity={auction.num_bids}
                                            timeLeft={getAuctionStatus(auction.e_time)}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="newestAuctions w-full">
                        <h2 className="text-2xl font-bold mb-4">Newest Auctions</h2>
                        {newestAuctions.length === 0 ? (
                            <div>No newest auctions available.</div>
                        ) : (
                            <div className="flex space-x-4 overflow-x-auto">
                                {newestAuctions.map((auction, index) => (
                                    <Link to={`/auctions/${auction.auction_id}`} key={index}>
                                        <AuctionCard
                                            title={auction.artwork_title}
                                            imageUrl={auction.image_url}
                                            type="latest"
                                            quantity={(auction.highest_bid)}
                                            timeLeft={getAuctionStatus(auction.e_time)}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="upcomingAuctions w-full">
                        <h2 className="text-2xl font-bold mb-4">Upcoming Auctions</h2>
                        {upcomingAuctions.length === 0 ? (
                            <div>No upcoming auctions available.</div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {upcomingAuctions.map((auction, index) => (
                                    <Link to={`/auctions/${auction.auction_id}`} key={index}>
                                        <AuctionCard
                                            title={auction.artwork_title}
                                            imageUrl={auction.image_url}
                                            type="upcoming"
                                            timeLeft={`Starts in ${getAuctionStatus(auction.s_time)}`}
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