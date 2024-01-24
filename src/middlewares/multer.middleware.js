import multer from "multer";

const storage = multer.diskStorage({
    //- Specify the destination directory for uploaded files
    destination: function (req, file, cb) {
        //- Call the callback function with no error (null) and the destination path
        cb(null, "./public/temp");
    },

    //- Specify the filename for uploaded files
    filename: function (req, file, cb) {
        //- Call the callback function with no error (null) and the original filename
        cb(null, file.originalname);
    }
});

//-Exporting this to use it as a middleware :
export const uploadInLocal = multer({
    storage,
})