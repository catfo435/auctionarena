import { Card } from "flowbite-react";
import { FunctionComponent } from "react";

interface ArtworkCardProps {
    imageUrl: string;
    title: string;
    highestBid: number;
    status: string; // Sold or Ongoing status
}

export const ArtworkCard: FunctionComponent<ArtworkCardProps> = ({
    imageUrl,
    title,
    highestBid,
    status,
}) => {
    return (
        <Card className="shadow-lg rounded-xl p-2">
            <div className="flex">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-32 h-32 object-cover rounded-lg mr-4"
                />
                <div className="flex flex-col">
                    <h5 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold">Highest Bid: </span>
                        {highestBid.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                        })}
                    </p>
                    <p
                        className={`text-sm font-bold ${status === "Sold" ? "text-green-600" : "text-yellow-500"
                            }`}
                    >
                        {status}
                    </p>
                </div>
            </div>
        </Card>
    );
};