import { FunctionComponent, useState, useEffect } from "react";
import { RxAvatar } from "react-icons/rx";
import { IoHomeSharp } from "react-icons/io5";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { RiAuctionFill } from "react-icons/ri";
import { HiMiniTrophy } from "react-icons/hi2";
import { MdReviews } from "react-icons/md";
import { toastError } from "../toasts";
import { Button } from "flowbite-react";

interface User {
    name: string
    email: string
}

const Home: FunctionComponent = () => {
    const location = useLocation();
    const navigate = useNavigate()

    const navItems = [
        { path: "dashboard", label: "Dashboard", icon: <IoHomeSharp className="text-blue-600 text-2xl" /> },
        { path: "profile", label: "Profile", icon: <RxAvatar className="text-blue-600 text-2xl" /> },
        { path: "bids", label: "My Bids", icon: <RiAuctionFill className="text-blue-600 text-2xl" /> },
        { path: "auctionswon", label: "Auctions Won", icon: <HiMiniTrophy className="text-blue-600 text-2xl" /> },
        { path: "reviews", label: "My Reviews", icon: <MdReviews className="text-blue-600 text-2xl" /> },
    ];

    const [activePath, setActivePath] = useState("dashboard");
    const [user, setUser] = useState<User>()

    const handleLogout = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/logout`, {
          method: "POST",
          credentials: "include",
        });
        navigate("/login");
      }

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/info`, { credentials: "include" })
            .then(async (res) => {
                setUser(await res.json())
            })
            .catch((e) => {
                toastError("Something went wrong");
                navigate('/login')
                console.log(e);
            })
    }, []);

    useEffect(() => {
        if (location.pathname === '/'){
            navigate("/dashboard")
            return
        }

        setActivePath(location.pathname.split("/")[1])
    },[location])

    return (
        <div className="homePage w-full h-full flex flex-col space-y-10">
            <div className="infoContainer flex w-full grow px-36 py-5">
                <div className="grid grid-cols-4 w-full h-full">
                    <div className="profileNav flex flex-col space-y-5">
                        <div className="profileInfo flex items-center space-x-2">
                            <div className="profileIcon w-10 h-10 rounded-full">
                                <RxAvatar className="w-full h-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold">{user?.name}</span>
                                <span>{user?.email}</span>
                            </div>
                        </div>
                        <nav className="pl-2 text-lg flex flex-col space-y-4 text-gray-600">
                            {navItems.map(({ path, label, icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setActivePath(path)}
                                >
                                    <div
                                        className={`flex space-x-2 text-2xl items-center px-4 py-3 rounded-s-lg transition-all ease-in duration-800 ${activePath === path ? "bg-gray-200" : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {icon}
                                        <span>{label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                        <div className="flex h-fit justify-center">
                            <Button color="failure" size="lg" onClick={handleLogout}>Logout</Button>
                        </div>
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