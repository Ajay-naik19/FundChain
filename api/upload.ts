import type { VercelRequest, VercelResponse } from "@vercel/node"

export const config = {
  api: {
    bodyParser: false
  }
}

function readRequestBody(
  req: VercelRequest
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on("data", (chunk) => {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      )
    })

    req.on("end", () => {
      resolve(Buffer.concat(chunks))
    })

    req.on("error", (error) => {
      reject(error)
    })
  })
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    })
  }

  try {
    const token = process.env.PINATA_JWT

    if (!token) {
      console.error(
        "PINATA_JWT environment variable is missing"
      )

      return res.status(500).json({
        error: "PINATA_JWT is not configured"
      })
    }

    const contentType =
      req.headers["content-type"]

    if (!contentType) {
      return res.status(400).json({
        error: "Content-Type is missing"
      })
    }

    const body =
      await readRequestBody(req)

    if (!body || body.length === 0) {
      return res.status(400).json({
        error: "No file data received"
      })
    }

    console.log(
      "Uploading file to Pinata..."
    )

    const pinataResponse =
      await fetch(
        "https://uploads.pinata.cloud/v3/files",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              contentType
          },
          body:
            body as unknown as BodyInit
        }
      )

    const responseText =
      await pinataResponse.text()

    console.log(
      "Pinata status:",
      pinataResponse.status
    )

    if (!pinataResponse.ok) {
      console.error(
        "Pinata error:",
        responseText
      )

      return res
        .status(pinataResponse.status)
        .json({
          error:
            "Pinata upload failed",
          details: responseText
        })
    }

    let data

    try {
      data =
        JSON.parse(responseText)
    } catch {
      console.error(
        "Pinata returned invalid JSON:",
        responseText
      )

      return res.status(500).json({
        error:
          "Pinata returned an invalid response"
      })
    }

    console.log(
      "Pinata upload successful:",
      data
    )

    return res.status(200).json(data)

  } catch (error) {
    console.error(
      "Pinata upload error:",
      error
    )

    return res.status(500).json({
      error:
        "Failed to upload file to Pinata"
    })
  }
}