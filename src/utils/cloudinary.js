"use server"

const CLOUD_NAME = process.env.CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function UploadImage(image) {
    try {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const result = await res.json();


        if (result.error) {
            return { error: true, message: result.error.message };
        }

        return {
            url: result.secure_url,
            publicid: result.public_id,
        };
     
    } catch (err) {
        console.error(err);
        return { error: true, message: "upload failed" };
    }
}

