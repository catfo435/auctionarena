import { FunctionComponent, useEffect, useState } from "react";
import { toastError } from "../toasts";

const AuctionsWon: FunctionComponent = () => {
    const [auctions, setAuctions] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/auctionswon`, { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setAuctions(data);
                } else {
                    toastError("Failed to fetch auctions won");
                }
            })
            .catch((e) => {
                toastError("Something went wrong");
                console.error(e);
            });
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Auctions Won</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border border-gray-300">Artwork Name</th>
                            <th className="p-2 border border-gray-300">Start Price</th>
                            <th className="p-2 border border-gray-300">Price Won At</th>
                            <th className="p-2 border border-gray-300">End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auctions.map((auction, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50">
                                <td className="p-2 border border-gray-300">{auction.artwork_name}</td>
                                <td className="p-2 border border-gray-300">{auction.start_price}</td>
                                <td className="p-2 border border-gray-300">{auction.price_won_at}</td>
                                <td className="p-2 border border-gray-300">{auction.end_time}</td>
                            </tr>
                        ))}
                        {auctions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-4 border border-gray-300">
                                    No auctions won yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuctionsWon;