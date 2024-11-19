import { FunctionComponent } from "react";
import { Modal, Button } from "flowbite-react";

interface AuctionModalProps {
    isOpen: boolean;
    auction: any;
    onClose: () => void;
    onBid: (amount: number) => void;
}

export const AuctionModal: FunctionComponent<AuctionModalProps> = ({ isOpen, auction, onClose, onBid }) => {
    if (!isOpen || !auction) return null;

    const formatTimeLeft = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        let timeDiff = start > now ? start.getTime() - now.getTime() : end.getTime() - now.getTime();

        if (timeDiff <= 0) return "Auction Ended";

        const hours = Math.floor(timeDiff / (1000 * 3600));
        const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
        const days = Math.floor(hours / 24);
        const hoursLeft = hours % 24;

        if (start > now) {
            return `${days}d ${hoursLeft}h ${minutes}m to Auction`;
        } else {
            return `${hoursLeft}h ${minutes}m left`;
        }
    };

    const handleBid = (amount: number) => {
        onBid(auction.highest_bid + amount);
    };

    const isAuctionStarted = new Date(auction.s_time) < new Date();
    const isAuctionInFuture = new Date(auction.s_time) > new Date();

    return (
        <Modal show={isOpen} onClose={onClose} size="3xl">
            <Modal.Header>{auction.artwork_title}</Modal.Header>
            <Modal.Body>
                <div className="grid grid-cols-2">
                    <div className="w-full aspect-w-16 aspect-h-9 p-8">
                        <img src={auction.image_url} alt={auction.artwork_title} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="flex flex-col items-center justify-between py-10 space-y-10">
                        <div className="flex flex-col space-y-2">
                            <span className="font-bold text-4xl">{auction.artwork_title}</span>
                            <span className="italic text-2xl">{auction.artist_name}</span>
                        </div>
                        <div className="text-center text-2xl space-y-5">
                            <span className="block"><strong>Highest Bid: </strong>{auction.highest_bid.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                            })}</span>

                            <span className="block">
                                <strong>{isAuctionInFuture ? 'Time to Auction: ' : 'Time Left: '}</strong>
                                {formatTimeLeft(auction.s_time, auction.e_time)}
                            </span>
                        </div>

                        {isAuctionStarted && new Date(auction.e_time) > new Date() && (
                            <div className="flex flex-col items-center space-y-4 rounded-lg bg-gray-200 p-4">
                                <span className="text-2xl">Increase Bid</span>
                                <div className="flex justify-center space-x-4">
                                    <Button color="blue" onClick={() => handleBid(100)}>+100</Button>
                                    <Button color="blue" onClick={() => handleBid(500)}>+500</Button>
                                    <Button color="blue" onClick={() => handleBid(1000)}>+1000</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};