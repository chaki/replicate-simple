import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [error, setError] = useState('')

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setError('')
    setImageUrl('')
    setCaption('')
    setIsGeneratingImage(true)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      
      if (data.error) throw new Error(data.error)
      setImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const generateCaption = async () => {
    if (!imageUrl) return

    setError('')
    setCaption('')
    setIsGeneratingCaption(true)

    try {
      const response = await fetch('/api/get-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })
      const data = await response.json()
      
      if (data.error) throw new Error(data.error)
      setCaption(data.caption)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption')
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="space-y-4 p-6">
        <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>
        <Input
          placeholder="Enter your prompt here"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGeneratingImage || isGeneratingCaption}
          aria-label="Image prompt"
        />
        <Button 
          onClick={generateImage} 
          disabled={isGeneratingImage || isGeneratingCaption || !prompt.trim()}
          className="w-full"
        >
          {isGeneratingImage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Image...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center" role="alert">{error}</p>
        )}

        {imageUrl && (
          <div className="space-y-4">
            <div className="relative min-h-[200px] w-full rounded-lg border bg-muted">
              <img
                src={imageUrl}
                alt="Generated image"
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            <Button 
              onClick={generateCaption} 
              disabled={isGeneratingCaption || isGeneratingImage}
              className="w-full"
            >
              {isGeneratingCaption ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Caption...
                </>
              ) : (
                'Generate Caption'
              )}
            </Button>
          </div>
        )}

        {caption && (
          <Textarea
            value={caption}
            readOnly
            className="w-full"
            rows={3}
            aria-label="Generated caption"
          />
        )}
      </CardContent>
    </Card>
  )
}