import { FunctionComponent, useState, useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { IoHomeSharp } from "react-icons/io5";
import { Link, Outlet, useLocation } from "react-router-dom";
import { RiAuctionFill } from "react-icons/ri";
import { HiMiniTrophy } from "react-icons/hi2";
import { MdReviews } from "react-icons/md";

const Home: FunctionComponent = () => {
    const location = useLocation();

    const navItems = [
        { path: "dashboard", label: "Dashboard", icon: <IoHomeSharp className="text-blue-600 text-xl" /> },
        { path: "profile", label: "Profile", icon: <RxAvatar className="text-blue-600 text-xl" /> },
        { path: "bids", label: "My Bids", icon: <RiAuctionFill className="text-blue-600 text-xl" /> },
        { path: "winning", label: "Winning Bids", icon: <HiMiniTrophy className="text-blue-600 text-xl" /> },
        { path: "reviews", label: "My Reviews", icon: <MdReviews className="text-blue-600 text-xl" /> },
    ];

    const [activePath, setActivePath] = useState(location.pathname.split("/")[1] || "dashboard");

    // Sync `activePath` with `location.pathname` on route changes
    useEffect(() => {
        setActivePath(location.pathname.split("/")[1] || "dashboard");
    }, [location]);

    return (
        <div className="homePage w-full h-full flex flex-col space-y-14">
            <div className="routeSpecifier flex justify-between items-center px-36 h-36 bg-gray-200">
                <span className="text-5xl text-orange-600 font-extrabold">{`HOME > ${activePath.toUpperCase()}`}</span>
                <span className="italic text-xl">Personal Dashboard</span>
            </div>
            <div className="infoContainer flex w-full grow px-36 pb-5">
                <div className="grid grid-cols-4 w-full h-full">
                    <div className="profileNav flex flex-col space-y-5">
                        <div className="profileInfo flex items-center space-x-2">
                            <div className="profileIcon w-10 h-10 rounded-full">
                                <RxAvatar className="w-full h-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold">Profile Name</span>
                                <span>Profile Email</span>
                            </div>
                        </div>
                        <nav className="pl-2 text-lg flex flex-col space-y-2 text-gray-600">
                            {navItems.map(({ path, label, icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setActivePath(path)}
                                >
                                    <div
                                        className={`flex space-x-2 items-center px-4 py-3 rounded-s-lg transition-all ease-in duration-800 ${
                                            activePath === path ? "bg-gray-200" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {icon}
                                        <span>{label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="infoDisplay col-span-3 rounded-lg bg-gray-200">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;