import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  console.log("Signing params:", paramsToSign);
  const secret = process.env.CLOUDINARY_API_SECRET;
  console.log("Secret exists:", !!secret);
  if (secret) console.log("Secret length:", secret.length);
  
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    secret as string
  );
  console.log("Generated Signature:", signature);
  
  return Response.json({ signature });
}
