import { FunctionComponent } from "react";

interface AuctionCardProps {
    imageUrl: string;
    title: string
    quantity?: number;
    timeLeft: string;
    type: "trending" | "latest" | "upcoming"
}

export const AuctionCard: FunctionComponent<AuctionCardProps> = ({
    imageUrl,
    title,
    quantity,
    timeLeft,
    type
}) => {
    return (
        <div className="bg-white hover:bg-gray-200 w-80 p-4 h-48 shadow-md rounded-lg flex items-center space-x-4">
            <img
                src={imageUrl}
                alt="Auction Artwork"
                className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex flex-col space-y-6">
                <span className="text-xl w-full text-center font-bold">{title}</span>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                        <span className="font-bold">{type === "trending" ? `${quantity} Bids Placed` 
                        : type === "latest" ? `Current Highest Bid: ${quantity!.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`
                    : ""}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        <span className="font-bold">Time Left: </span>
                        {timeLeft}
                    </p>
                </div>
            </div>
        </div>
    );
};