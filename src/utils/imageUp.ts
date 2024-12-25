import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const IMAGEBB_API_KEY = process.env.IMAGEBB_API_KEY; // Replace with your actual API key

// Define the response type based on ImageBB API response structure
interface ImageBBResponse {
  data: {
    [x: string]: any;
    data: {
      url: string;
    };
  };
}

/**
 * Uploads an image to ImageBB and returns the image URL.
 * @param imageData - Base64 string or binary image data to be uploaded
 * @returns A promise that resolves to the URL of the uploaded image
 */
export const uploadImageToImageBB = async (
  imageData: string | Blob
): Promise<string> => {
  try {
    // Prepare the form data for the image
    const formData = new FormData();
    formData.append("image", imageData);

    // Send the POST request to ImageBB
    const response = await axios.post<ImageBBResponse>(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          key: IMAGEBB_API_KEY, // Add your API key here
        },
      }
    );

    // Return the image URL
    const imageUrl = response.data?.data?.url as any;
    if (!imageUrl) {
      throw new Error("Failed to upload image");
    }
    return imageUrl;
  } catch (error: any) {
    console.error("Error uploading image to ImageBB:", error.message);
    throw error;
  }
};
