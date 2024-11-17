import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { FunctionComponent } from "react";
 
const Layout: FunctionComponent = () => {
    return ( 
        <div className="rootLayout flex flex-col w-screen h-screen">
            <Header />
            <div className="content flex w-full grow">
                <Outlet />
            </div>
        </div>
    );
}
 
export default Layout;