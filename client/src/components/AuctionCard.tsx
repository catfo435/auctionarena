import { Card } from "flowbite-react";
import { FunctionComponent } from "react";

interface AuctionCardProps {
    imageUrl: string;
    title: string
    highestBid: number;
    timeLeft: string;
}

export const AuctionCard: FunctionComponent<AuctionCardProps> = ({
    imageUrl,
    title,
    highestBid,
    timeLeft,
}) => {
    return (
        <Card className="w-96 flex items-center">
            <div className="flex items-center space-x-4">
                <img
                    src={imageUrl}
                    alt="Auction Artwork"
                    className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex flex-col space-y-6">
                    <span className="text-2xl w-full text-center font-bold">{title}</span>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">
                            <span className="font-bold">Current Highest Bid: </span>
                            {highestBid.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                        </p>
                        <p className="text-sm text-gray-500">
                            <span className="font-bold">Time Left: </span>
                            {timeLeft}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};