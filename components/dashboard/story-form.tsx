'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'

// Category options
const categories = [
  { value: '恋愛', label: '恋愛 (Ren\'ai) – Romance', description: 'Love stories, often about emotional growth, relationships, or heartbreak.' },
  { value: 'ファンタジー', label: 'ファンタジー (Fantasy)', description: 'Magic, other worlds (異世界 isekai), spirits, gods, or mythical creatures.' },
  { value: '異世界転生', label: '異世界転生 (Isekai tensei)', description: 'Reincarnated in another world' },
  { value: 'ダークファンタジー', label: 'ダークファンタジー (Dark Fantasy)', description: 'Dark Fantasy' },
  { value: 'アーバンファンタジー', label: 'アーバンファンタジー (Urban Fantasy)', description: 'Urban Fantasy' },
  { value: '日常', label: '日常 (Nichijou) – Slice of Life', description: 'Everyday moments, school life, family, friendship, or quiet reflections.' },
  { value: '冒険', label: '冒険 (Bouken) – Adventure', description: 'Exploration, quests, journeys across worlds or lands.' },
  { value: 'アクション', label: 'アクション (Action)', description: 'Battles, martial arts, missions, or hero vs villain stories.' },
  { value: 'ミステリー', label: 'ミステリー (Mystery)', description: 'Detective stories, unsolved crimes, or supernatural mysteries.' },
  { value: 'ホラー', label: 'ホラー (Horror)', description: 'Ghosts (幽霊 yuurei), curses, psychological horror, or Japanese folklore.' },
  { value: 'SF', label: 'SF (Science Fiction / Sci-Fi)', description: 'Futuristic settings, space, robots, AI, or time travel.' },
  { value: 'コメディ', label: 'コメディ (Comedy)', description: 'Funny stories, parodies, misunderstandings, or absurd humor.' },
  { value: 'ドラマ', label: 'ドラマ (Drama)', description: 'Deep emotional storytelling — often realistic, focusing on human struggles.' },
]

// Japanese level options
const japaneseLevels = [
  { value: 'N6', label: 'N6 (Hiragana Katakana)', description: 'Basic hiragana and katakana characters' },
  { value: 'N5', label: 'N5 (Basic)', description: 'Basic Japanese - beginner level' },
  { value: 'N4', label: 'N4 (Elementary)', description: 'Elementary Japanese - basic conversation' },
  { value: 'N3', label: 'N3 (Intermediate)', description: 'Intermediate Japanese - daily conversation' },
  { value: 'N2', label: 'N2 (Pre-Advanced)', description: 'Pre-advanced Japanese - business and academic' },
  { value: 'N1', label: 'N1 (Advanced)', description: 'Advanced Japanese - fluent level' },
]

// Access options
const accessOptions = [
  { value: 'free', label: 'Free', description: 'Available to all users for free' },
  { value: 'premium', label: 'Premium', description: 'Available only to premium subscribers' },
]

export default function StoryForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    category: '',
    japaneseLevel: '',
    access: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string } | null>(null)
  const [imageError, setImageError] = useState<string>('')
  const [errors, setErrors] = useState<{ category?: string; japaneseLevel?: string; access?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImage = async (file: File): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
    // Validate file format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedFormats.includes(file.type.toLowerCase())) {
      return { 
        valid: false, 
        error: 'Invalid format. Only JPG, PNG, and WebP are allowed.' 
      }
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return { 
        valid: false, 
        error: `File size too large (${sizeMB}MB). Maximum size is 2MB.` 
      }
    }

    // Validate dimensions
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const width = img.width
          const height = img.height

          // Minimum dimension validation
          if (width < 800 || height < 600) {
            resolve({ 
              valid: false, 
              error: `Image too small (${width}x${height}px). Minimum size is 800x600px.`,
              dimensions: { width, height }
            })
            return
          }

          resolve({ 
            valid: true, 
            dimensions: { width, height } 
          })
        }
        img.onerror = () => {
          resolve({ valid: false, error: 'Failed to load image' })
        }
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        resolve({ valid: false, error: 'Failed to read file' })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedImage(null)
      setImagePreview('')
      setImageInfo(null)
      setImageError('')
      return
    }

    // Validate image
    setImageError('')
    const validation = await validateImage(file)

    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image')
      setSelectedImage(null)
      setImagePreview('')
      setImageInfo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.error(validation.error || 'Invalid image')
      return
    }

    // Set image and preview
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      if (validation.dimensions) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        setImageInfo({
          width: validation.dimensions.width,
          height: validation.dimensions.height,
          size: sizeMB
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const getDimensionStatus = (width: number, height: number): { status: 'optimal' | 'recommended' | 'minimum'; message: string } => {
    // Optimal: 1920x1080 or larger
    if (width >= 1920 && height >= 1080) {
      return { status: 'optimal', message: 'Optimal size for high-quality displays' }
    }
    // Recommended: 1200x800 or 1280x720
    if ((width >= 1200 && height >= 800) || (width >= 1280 && height >= 720)) {
      return { status: 'recommended', message: 'Recommended size for good quality' }
    }
    // Minimum: 800x600
    return { status: 'minimum', message: 'Minimum size (consider using larger for better quality)' }
  }

  const validateForm = (): boolean => {
    const newErrors: { category?: string; japaneseLevel?: string; access?: string } = {}
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.japaneseLevel) {
      newErrors.japaneseLevel = 'Please select a Japanese level'
    }
    
    if (!formData.access) {
      newErrors.access = 'Please select an access level'
    }
    
    setErrors(newErrors)
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setLoading(true)

    try {
      // Upload image if selected
      let imageUrl = formData.imageUrl
      if (selectedImage) {
        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', selectedImage)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          toast.error(`Upload failed: ${uploadData.error}`)
          setLoading(false)
          setUploading(false)
          return
        }

        imageUrl = uploadData.imageUrl
        setUploading(false)
      }

      // Save story with the image URL
      const storyData = {
        ...formData,
        imageUrl
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Story created successfully')
        
        // Reset form completely
        setFormData({
          title: '',
          story: '',
          date: new Date().toISOString().split('T')[0],
          imageUrl: '',
          category: '',
          japaneseLevel: '',
          access: ''
        })
        setSelectedImage(null)
        setImagePreview('')
        setImageInfo(null)
        setImageError('')
        setErrors({})
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Redirect to home page to see the new story (with fresh data)
        // The page will automatically fetch fresh data in development mode
        setTimeout(() => {
          router.push('/')
          router.refresh() // Force refresh to get latest data
        }, 1000) // Wait 1 second to show success message
      } else {
        toast.error(`Error: ${data.error}`)
      }
    } catch (error) {
      toast.error('Failed to submit story')
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error when user selects a value
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      })
    }
  }

  const getCategoryDescription = (value: string) => {
    return categories.find(cat => cat.value === value)?.description || ''
  }

  const getJapaneseLevelDescription = (value: string) => {
    return japaneseLevels.find(level => level.value === value)?.description || ''
  }

  const getAccessDescription = (value: string) => {
    return accessOptions.find(access => access.value === value)?.description || ''
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title *
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter story title"
          />
        </div>

        <div>
          <label htmlFor="story" className="block text-sm font-medium mb-1">
            Story *
          </label>
          <div className="mb-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              ⚠️ Important: Use spaces to separate words for proper word segmentation
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
              Example: <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">東京　へ　行きます</code>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Use any space (normal or full-width) between words. Spaces will be removed in display but used for word boundaries.
            </p>
          </div>
          <textarea
            id="story"
            name="story"
            value={formData.story}
            onChange={handleChange}
            required
            rows={6}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono"
            placeholder="東京　へ　行きます"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date *
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Image *
          </label>
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              required={!formData.imageUrl}
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Accepted formats: JPG, PNG, WebP</p>
              <p>Maximum file size: 2MB</p>
              <p>Minimum dimensions: 800x600px (Recommended: 1200x800px or 1280x720px, Optimal: 1920x1080px)</p>
            </div>
            {imageError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">⚠️ {imageError}</p>
              </div>
            )}
            {imagePreview && imageInfo && (
              <div className="space-y-2">
                <div className="p-2 border border-input rounded-md bg-muted/50">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-xs max-h-48 rounded-md object-contain mx-auto"
                  />
                </div>
                <div className="p-3 rounded-md bg-muted/50 border border-input space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Dimensions:</span>
                    <span className="text-muted-foreground">{imageInfo.width} x {imageInfo.height}px</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">File size:</span>
                    <span className="text-muted-foreground">{imageInfo.size} MB</span>
                  </div>
                  {(() => {
                    const status = getDimensionStatus(imageInfo.width, imageInfo.height)
                    const statusColors = {
                      optimal: 'text-green-600 dark:text-green-400',
                      recommended: 'text-blue-600 dark:text-blue-400',
                      minimum: 'text-amber-600 dark:text-amber-400'
                    }
                    const statusIcons = {
                      optimal: '✓',
                      recommended: 'ℹ️',
                      minimum: '⚠️'
                    }
                    return (
                      <div className={`flex items-center gap-2 text-sm pt-1 border-t border-border ${statusColors[status.status]}`}>
                        <span>{statusIcons[status.status]}</span>
                        <span className="font-medium capitalize">{status.status}:</span>
                        <span>{status.message}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category *
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
            required
          >
            <SelectTrigger 
              id="category" 
              className={`w-full ${errors.category ? 'border-destructive focus:ring-destructive' : ''}`}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="mt-1 text-xs text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.category}</span>
            </p>
          )}
          {formData.category && !errors.category && (
            <p className="mt-1 text-xs text-muted-foreground">
              {getCategoryDescription(formData.category)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="japaneseLevel" className="block text-sm font-medium mb-1">
            Japanese Level *
          </label>
          <Select
            value={formData.japaneseLevel}
            onValueChange={(value) => handleSelectChange('japaneseLevel', value)}
            required
          >
            <SelectTrigger 
              id="japaneseLevel" 
              className={`w-full ${errors.japaneseLevel ? 'border-destructive focus:ring-destructive' : ''}`}
            >
              <SelectValue placeholder="Select Japanese level" />
            </SelectTrigger>
            <SelectContent>
              {japaneseLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.japaneseLevel && (
            <p className="mt-1 text-xs text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.japaneseLevel}</span>
            </p>
          )}
          {formData.japaneseLevel && !errors.japaneseLevel && (
            <p className="mt-1 text-xs text-muted-foreground">
              {getJapaneseLevelDescription(formData.japaneseLevel)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="access" className="block text-sm font-medium mb-1">
            Access *
          </label>
          <Select
            value={formData.access}
            onValueChange={(value) => handleSelectChange('access', value)}
            required
          >
            <SelectTrigger 
              id="access" 
              className={`w-full ${errors.access ? 'border-destructive focus:ring-destructive' : ''}`}
            >
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              {accessOptions.map((access) => (
                <SelectItem key={access.value} value={access.value}>
                  {access.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.access && (
            <p className="mt-1 text-xs text-destructive font-medium flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.access}</span>
            </p>
          )}
          {formData.access && !errors.access && (
            <p className="mt-1 text-xs text-muted-foreground">
              {getAccessDescription(formData.access)}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading || uploading} className="w-full">
          {uploading ? 'Uploading image...' : loading ? 'Saving...' : 'Save Story'}
        </Button>
      </form>
    </div>
  )
}

