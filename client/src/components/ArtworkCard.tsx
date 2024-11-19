import { Card } from "flowbite-react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

interface ArtworkCardProps {
    imageUrl: string;
    artist: string
    title: string;
    highestBid: number;
    status: string;
    auction_id : string
}

export const ArtworkCard: FunctionComponent<ArtworkCardProps> = ({
    imageUrl,
    title,
    highestBid,
    status,
    artist,
    auction_id
}) => {
    return (
        <Card className="shadow-none border-none w-80 h-52">
            <div className="flex items-center">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-32 h-32 object-cove mr-4"
                />
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 mb-2">
                            {title}
                        </span>
                        <span className="italic">{artist}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold">Highest Bid: </span>
                        {highestBid.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                        })}
                    </p>
                    <p
                        className={`text-sm font-bold ${status === "ongoing" ? "text-green-600" : "text-yellow-500"
                            }`}
                    >
                        {status.toUpperCase()}
                    </p>
                    {status === "ongoing" ? <Link className="text-sm underline" to={`/auctions/${auction_id}`}>Go to the Auction</Link> : <></>}
                </div>
            </div>
        </Card>
    );
};