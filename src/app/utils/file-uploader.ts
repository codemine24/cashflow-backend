import multer from "multer";

const storage = multer.memoryStorage();

const multipleUpload = multer({ storage }).fields([
  {
    name: "images",
    maxCount: 10,
  },
]);

const upload = multer({ storage });

export const fileUploader = {
  upload,
  multipleUpload,
};
