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
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export { uploadOnCloudinary }