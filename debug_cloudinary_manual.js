
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

console.log("Start debugging...");
console.log("Cloudinary object keys:", Object.keys(cloudinary));
if (cloudinary.utils) {
    console.log("Cloudinary utils keys:", Object.keys(cloudinary.utils));
} else {
    console.log("Cloudinary utils NOT FOUND");
}

const secret = "JZTYpB00VkPGk9D-wtrAqS759rM";
// const key = "336666446514615";
// const cloudName = "dakqwgtkq";

const timestamp = 1771349193; 
const folder = "campusshare-products";

const paramsToSign = {
    folder: folder,
    timestamp: timestamp
};

console.log("Calling api_sign_request...");
const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);
console.log("Signature generated:", signature);

const expectedSignature = "146a5d55a55e763c5809c9cde734bdfb64af83f";

const output = `
Generated: ${signature}
Expected:  ${expectedSignature}
Match:     ${signature === expectedSignature}
`;

fs.writeFileSync('debug_output.txt', output);
console.log("Written output to debug_output.txt");
