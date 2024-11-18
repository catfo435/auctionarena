import { FunctionComponent } from "react";
const AboutUsPage: FunctionComponent = () => {
    const teamMembers = [
        { name: "P. V. Pranava Sreeyush", id: "2022AAPS0274H" },
        { name: "Tanay Rajesh Garde", id: "2022A3PS0610H" },
        { name: "Rohan R Venugopal", id: "2022AAPS0407H" },
        { name: "Sarthak Samir Shah", id: "2021B4TS2793H" },
    ];

    return (
        <div className="aboutUsPage flex flex-col w-full h-full bg-gray-100">
            <div className="routeSpecifier flex justify-between items-center px-36 h-32 bg-gray-200">
                <span className="text-4xl text-orange-600 font-extrabold">ABOUT US</span>
                <span className="italic text-xl">Meet the team</span>
            </div>

            <div className="flex justify-center w-full grow px-36">
                <div className="teamGrid grid grid-cols-1 lg:grid-cols-2 gap-8 py-10 w-full lg:w-1/2 h-fit">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="card bg-white shadow-lg rounded-xl p-6 flex flex-col items-center space-y-4 hover:shadow-xl transition-all"
                        >
                            <div className="bg-gray-200 w-full h-24 rounded-lg mb-4 flex items-center justify-center">
                                <h3 className="text-lg font-semibold text-gray-800 text-center line-clamp-2">{member.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                <span className="font-bold">BITS ID: </span>
                                {member.id}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
};

export default AboutUsPage;
