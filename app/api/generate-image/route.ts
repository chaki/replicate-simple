import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import PocketBase from 'pocketbase'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}


export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    // Start the image generation prediction
    const prediction = await replicate.predictions.create({
      version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
      input: {
        prompt,
        num_outputs: 1,
      }
    })

    // Poll for the prediction result
    let result = await replicate.predictions.get(prediction.id)
    
    // Wait until the prediction is complete
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      result = await replicate.predictions.get(prediction.id)
    }

    // Check if the prediction is complete and successful
    if (result.status !== 'succeeded') {
      throw new Error(`Prediction failed with status: ${result.status}`)
    }

    const imageUrl = result.output[0]

    // LOG
    console.log('> Image URL:', imageUrl)

    // Validate the image URL
    if (!imageUrl || typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
      console.error('Invalid image URL from Replicate:', imageUrl)
      throw new Error('Invalid image URL from Replicate')
    }

    // Store the generation in PocketBase
    try {
      await pb.collection('generated_images').create({
        prompt: prompt,
        image_url: imageUrl,
        created: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Error saving to database:', dbError)
      // Continue execution even if database save fails
    }

    return NextResponse.json({ imageUrl })
  
  } 
  catch (error) 
  {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}