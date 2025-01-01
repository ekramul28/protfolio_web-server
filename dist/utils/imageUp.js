"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToImageBB = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const IMAGEBB_API_KEY = process.env.IMAGEBB_API_KEY; // Replace with your actual API key
const uploadImageToImageBB = (imageData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Prepare the form data for the image
        const formData = new FormData();
        formData.append("image", imageData);
        // Send the POST request to ImageBB
        const response = yield axios_1.default.post("https://api.imgbb.com/1/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            params: {
                key: IMAGEBB_API_KEY, // Add your API key here
            },
        });
        // Return the image URL
        const imageUrl = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url;
        if (!imageUrl) {
            throw new Error("Failed to upload image");
        }
        return imageUrl;
    }
    catch (error) {
        console.error("Error uploading image to ImageBB:", error.message);
        throw error;
    }
});
exports.uploadImageToImageBB = uploadImageToImageBB;
