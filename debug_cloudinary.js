
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const secret = process.env.CLOUDINARY_API_SECRET;
const key = process.env.CLOUDINARY_API_KEY;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

console.log("Cloud Name:", cloudName);
console.log("API Key:", key);
console.log("API Secret (first 5 chars):", secret ? secret.substring(0, 5) : "UNDEFINED");
console.log("API Secret length:", secret ? secret.length : 0);

const timestamp = 1771349193; // Timestamp from the error message
const folder = "campusshare-products";
const paramsToSign = {
    timestamp: timestamp,
    folder: folder
};

console.log("Params to sign:", paramsToSign);

const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);
console.log("Generated Signature:", signature);
console.log("Expectation from error: 146a5d55a55e763c5809c9cde734bdfb64af83f");

if (signature === "146a5d55a55e763c5809c9cde734bdfb64af83f") {
    console.log("MATCH! The backend is generating the SAME signature as the error.");
    console.log("This means the error 'Invalid Signature' implies Cloudinary expects a DIFFERENT signature.");
    console.log("Potential causes: API Secret is wrong, or Cloud Name is wrong, or Params mismatch on receiving end.");
} else {
    console.log("MISMATCH! The backend generated a different signature.");
}
