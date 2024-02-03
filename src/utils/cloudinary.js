import { v2 as cloudinary } from "cloudinary"
import fs from "fs"



cloudinary.config({
    cloud_name: 'deh96xgkj',
    api_key: '824598839256351',
    api_secret: 'yY9DBPKX3wyc7nIWlmHv_AMFWcc'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        // console.log(localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        // console.log(response);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl) return null;

        // Extract the public_id from the Cloudinary URL
        const publicId = cloudinaryUrl.split('/').pop().split('.')[0];


        // Delete the file from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(response);


        // Check if deletion was successful
        if (response.result === 'ok') {
            return response;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}




export { uploadOnCloudinary, deleteFromCloudinary }