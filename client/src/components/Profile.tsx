import { FunctionComponent, useEffect, useState } from 'react';
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import { RiAuctionFill } from 'react-icons/ri';
import { IoMdPricetag } from 'react-icons/io';
import { AiOutlineGift } from 'react-icons/ai';

interface UserInfo {
    name: string;
    email: string;
    bids_placed?: number;
    total_auctions?: number;
    auctions_won?: number;
    auctions_leading?: number;
}

const Profile: FunctionComponent = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/info?all=true`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full text-lg font-semibold">Loading...</div>;
    }

    return (
        <div className="infoDisplay col-span-3 p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-lg">
                        <span className="text-lg font-semibold text-gray-800">Name:</span>
                        <span className="text-lg text-gray-600">{userInfo?.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-lg">
                        <span className="text-lg font-semibold text-gray-800">Email:</span>
                        <span className="text-lg text-gray-600">{userInfo?.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Bids Placed Card */}
                <div className="card bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-4">
                        <HiOutlineBadgeCheck size={24} className="text-blue-600" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Bids Placed</h3>
                            <p className="text-lg font-medium text-gray-600">{userInfo?.bids_placed}</p>
                        </div>
                    </div>
                </div>

                {/* Auctions Won Card */}
                <div className="card bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-4">
                        <AiOutlineGift size={24} className="text-green-600" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Auctions Won</h3>
                            <p className="text-lg font-medium text-gray-600">{userInfo?.auctions_won}</p>
                        </div>
                    </div>
                </div>

                {/* Auctions Leading Card */}
                <div className="card bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-4">
                        <RiAuctionFill size={24} className="text-orange-600" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Auctions Leading</h3>
                            <p className="text-lg font-medium text-gray-600">{userInfo?.auctions_leading}</p>
                        </div>
                    </div>
                </div>

                {/* Total Auctions Card */}
                <div className="card bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-4">
                        <IoMdPricetag size={24} className="text-teal-600" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Total Auctions</h3>
                            <p className="text-lg font-medium text-gray-600">{userInfo?.total_auctions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;