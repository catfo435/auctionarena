import { FunctionComponent, useEffect, useState } from "react";
import { HiMiniTrophy } from "react-icons/hi2";
import { IoPodium } from "react-icons/io5";
import { RiAuctionFill } from "react-icons/ri";
import { toastError } from "../toasts";

const Dashboard: FunctionComponent = () => {
    const [dashboardData, setDashboardData] = useState({
        activeAuctions: "0",
        auctionsWon: "0",
        auctionsInLead: "0",
    });

    const [auctions, setAuctions] = useState<any[]>([]);

    const data = [
        {
            icon: <RiAuctionFill size="3rem" className="text-orange-600" />,
            count: dashboardData.activeAuctions,
            label: "Auctions In",
        },
        {
            icon: <IoPodium size="3rem" className="text-orange-600" />,
            count: dashboardData.auctionsInLead,
            label: "Auctions Leading",
        },
        {
            icon: <HiMiniTrophy size="3rem" className="text-orange-600" />,
            count: dashboardData.auctionsWon,
            label: "Auctions Won",
        },
    ];

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/dashboard`, { credentials: "include" })
            .then(async (res) => {
                if (res.ok) {
                    const { dashboardData, auctions } = await res.json();
                    setDashboardData(dashboardData);
                    setAuctions(auctions);
                } else {
                    toastError("Failed to fetch dashboard data");
                }
            })
            .catch((e) => {
                toastError("Something went wrong");
                console.log(e);
            });
    }, []);

    const formatCountdown = (endTime: string) => {
        const timeLeft = new Date(endTime).getTime() - Date.now();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div className="flex flex-col w-full h-full p-2">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-3 w-full h-40">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-4 items-center m-5 p-4 rounded-3xl border-2 border-gray-300"
                    >
                        {item.icon}
                        <div className="flex flex-col col-span-3">
                            <span className="text-3xl font-bold">{item.count}</span>
                            <span className="text-gray-500">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Auctions Table */}
            <div className="flex flex-col space-y-4 mt-6 px-3 w-full">
                <span className="font-bold text-2xl">My Ongoing Bids</span>
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border border-gray-300">Artwork</th>
                            <th className="p-2 border border-gray-300">Current Price</th>
                            <th className="p-2 border border-gray-300">Start Price</th>
                            <th className="p-2 border border-gray-300">End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auctions.map((auction, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50">
                                <td className="border p-2 border-gray-300">{auction.artwork_title}</td>
                                <td className="border p-2 border-gray-300">{auction.current_price}</td>
                                <td className="border p-2 border-gray-300">{auction.start_price}</td>
                                <td className="border p-2 border-gray-300">{formatCountdown(auction.end_time)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;