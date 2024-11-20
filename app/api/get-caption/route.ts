import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    const output = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: imageUrl
        }
      }
    )
    return NextResponse.json({ caption: output })
  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 })
  }
}