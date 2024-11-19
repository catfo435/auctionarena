import { FunctionComponent, useEffect, useState } from "react";
import { Modal, Button, Label, FileInput, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { toastError } from "../toasts";

interface CreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (auctionData: any) => void;
}

interface AuctionFormValues {
    artworkTitle: string;
    image: FileList;
    startPrice: number;
    startTime: string;
    endTime: string;
}

const CreateAuctionModal: FunctionComponent<CreateAuctionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AuctionFormValues>();

    const [imageError, setImageError] = useState<string | null>(null);
    const [artistName, setArtistName] = useState("loading...")
    const watchImage = watch("image");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!validImageTypes.includes(file.type)) {
                setImageError("The file must be a valid image (JPEG, PNG, GIF).");
            } else {
                setImageError(null);
            }
        }
    };

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user/info`, { credentials: "include" })
            .then(async (res) => {
                setArtistName((await res.json()).name)
            })
            .catch((e) => {
                toastError("Something went wrong");
                console.log(e);
            })
    },[])

    const handleFormSubmit = (data: AuctionFormValues) => {
        const auctionData = {
            artworkTitle: data.artworkTitle,
            image: data.image[0], // Extract the first file from FileList
            startPrice: data.startPrice,
            startTime: data.startTime,
            endTime: data.endTime,
        };
        onSubmit(auctionData);
        onClose();
    };

    return (
        <Modal show={isOpen} size="lg" onClose={onClose}>
            <Modal.Header>Create Auction</Modal.Header>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Modal.Body>
                    {/* Artwork Title */}
                    <div className="mb-4">
                        <Label htmlFor="artworkTitle" value="Artwork Title" />
                        <TextInput
                            id="artworkTitle"
                            placeholder="Enter artwork title"
                            {...register("artworkTitle", { required: "Artwork title is required" })}
                        />
                        {errors.artworkTitle && (
                            <p className="text-red-500 text-sm mt-1">{errors.artworkTitle.message}</p>
                        )}
                    </div>

                    {/* Artist Name (Read-only) */}
                    <div className="mb-4">
                        <Label htmlFor="artistName" value="Artist Name" />
                        <TextInput id="artistName" value={artistName} readOnly />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                        <Label htmlFor="image" value="Upload Artwork Image" />
                        <FileInput
                            id="image"
                            accept="image/*"
                            {...register("image", {
                                required: "Artwork image is required",
                            })}
                            onChange={(e) => {
                                handleFileChange(e); // Validate the image
                            }}
                        />
                        {errors.image && !imageError && (
                            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
                        )}
                        {imageError && (
                            <p className="text-red-500 text-sm mt-1">{imageError}</p>
                        )}
                        {watchImage && watchImage.length > 0 && !imageError && (
                            <p className="text-green-500 text-sm mt-1">Image selected: {watchImage[0].name}</p>
                        )}
                    </div>


                    {/* Start Price */}
                    <div className="mb-4">
                        <Label htmlFor="startPrice" value="Start Price" />
                        <TextInput
                            id="startPrice"
                            type="number"
                            placeholder="Enter starting price"
                            step="0.01"
                            {...register("startPrice", {
                                required: "Start price is required",
                                min: { value: 0, message: "Start price must be greater than 0" },
                            })}
                        />
                        {errors.startPrice && (
                            <p className="text-red-500 text-sm mt-1">{errors.startPrice.message}</p>
                        )}
                    </div>

                    {/* Start Time */}
                    <div className="mb-4">
                        <Label htmlFor="startTime" value="Start Time" />
                        <TextInput
                            id="startTime"
                            type="datetime-local"
                            {...register("startTime", { required: "Start time is required" })}
                        />
                        {errors.startTime && (
                            <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                        )}
                    </div>

                    {/* End Time */}
                    <div className="mb-4">
                        <Label htmlFor="endTime" value="End Time" />
                        <TextInput
                            id="endTime"
                            type="datetime-local"
                            {...register("endTime", { required: "End time is required" })}
                        />
                        {errors.endTime && (
                            <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" color="blue">Create Auction</Button>
                    <Button color="failure" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default CreateAuctionModal;