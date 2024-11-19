import { FunctionComponent, useEffect, useState } from "react";
import { toastError } from "../toasts";

const Bids: FunctionComponent = () => {
    const [bids, setBids] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/bids`, { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setBids(data); // Set the bids data
                } else {
                    toastError("Failed to fetch bids data");
                }
            })
            .catch((e) => {
                toastError("Something went wrong fetching bid data");
                console.log(e);
            });
    }, []);

    return (
        <div className="flex flex-col w-full h-full p-4">
            <div className="mt-6 w-full overflow-y-auto h-full">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border border-gray-300">Artwork</th>
                            <th className="p-2 border border-gray-300">Bid Amount</th>
                            <th className="p-2 border border-gray-300">Bid Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bids.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center p-4 text-gray-500">
                                    No bids placed yet.
                                </td>
                            </tr>
                        ) : (
                            bids.map((bid, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="border p-2 border-gray-300">{bid.artwork_name}</td>
                                    <td className="border p-2 border-gray-300">{bid.bid_amount}</td>
                                    <td className="border p-2 border-gray-300">{bid.bid_date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bids;