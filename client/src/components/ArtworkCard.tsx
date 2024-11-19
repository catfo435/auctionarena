import { Card } from "flowbite-react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { Artwork } from "../pages/Artworks";

interface ArtworkCardProps {
    artwork: Artwork;
}

export const ArtworkCard: FunctionComponent<ArtworkCardProps> = ({ artwork }) => {
    const { image_url, title, highest_price, status, artist, auction_id } = artwork;

    // Define colors for different statuses
    const statusColor =
        status === "ongoing"
            ? "text-green-600"
            : status === "future"
            ? "text-yellow-500"
            : "text-red-600"; // 'ended' status

    return (
        <Card className="shadow-none border-none w-80 h-52">
            <div className="flex items-center">
                <img
                    src={image_url}
                    alt={title}
                    className="w-32 h-32 object-cover mr-4"
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
                        {highest_price.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                        })}
                    </p>
                    <p className={`text-sm font-bold ${statusColor}`}>
                        {status.toUpperCase()}
                    </p>
                    {status === "ongoing" && (
                        <Link className="text-sm underline" to={`/auctions/${auction_id}`}>
                            Go to the Auction
                        </Link>
                    )}
                </div>
            </div>
        </Card>
    );
};