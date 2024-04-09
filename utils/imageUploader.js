const aws =  require("aws-sdk");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadFile = multer({
  limits: 1024 * 1024 * 5,
  fileFilter: function (req, file, done) {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      done(null, true);
    } else {
      done("File type not supported by multer", false);
    }
  },
});
const uploadImage = async (fileData) => {
  return new Promise(async (resolve, reject) => {
    const date = Date.now().toString();
    const imgName = `${date}.jpeg`;
    const params = {
      Bucket: "blogcampus",
      Key: imgName,
      Body: fileData,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log(data);
      return resolve(data);
    });
  });
};

module.exports = {uploadFile, uploadImage};