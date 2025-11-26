"use server"

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})


export const RemoveCloudImages = async function (publicids) {
    try {
        await cloudinary.api.delete_resources(publicids)
    } catch (error) {
        return { error: true, message: "internal server error (cloudinary)" }
    }
}

export const RemoveCloudImage = async function (publicid) {
    try {
        await cloudinary.uploader.destroy(publicid);
    } catch (error) {
        return { error: true, message: "internal server error (cloudinary)" }
    }
}
