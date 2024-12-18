import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_APP_SECRET 
});

const uploasCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return  "localFilePath not found",null 
        }
        // upload the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the file

    }
}


export default uploasCloudinary