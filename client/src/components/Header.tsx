import { FunctionComponent } from "react";
import { RiAuctionFill } from "react-icons/ri";
import { Link } from "react-router-dom";


const Header: FunctionComponent = () => {
    return (
        <div className="header flex justify-between items-center w-full shrink-0 h-16 px-36 shadow-md text-amber-900">
            <div className="logoContainer flex justify-center items-center space-x-2 font-semibold">
                <RiAuctionFill size="25px" />
                <span className="text-2xl tracking-wider">Auction Arena</span>
            </div>
            <div>
                <nav className="space-x-5">
                    <Link className="hover:underline" to="/">Home</Link>
                    <Link className="hover:underline" to="/auctions">Auctions</Link>
                    <Link className="hover:underline" to="/artwork">Artwork</Link>
                    <Link className="hover:underline" to="/about">About Us</Link>
                </nav>
            </div>
        </div>
    );
}

export default Header;