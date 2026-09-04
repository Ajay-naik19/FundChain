import type { VercelRequest, VercelResponse } from "@vercel/node"

export const config = {
  api: {
    bodyParser: false
  }
}

function readRequestBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    req.on("end", () => {
      resolve(Buffer.concat(chunks))
    })

    req.on("error", reject)
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
      return res.status(500).json({
        error: "PINATA_JWT is not configured"
      })
    }

    const contentType = req.headers["content-type"]

    if (!contentType) {
      return res.status(400).json({
        error: "Content-Type is missing"
      })
    }

    const body = await readRequestBody(req)

    const response = await fetch(
      "https://uploads.pinata.cloud/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType
        },
        body: body as unknown as BodyInit
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error("Pinata upload error:", error)

    return res.status(500).json({
      error: "Failed to upload file to Pinata"
    })
  }
}