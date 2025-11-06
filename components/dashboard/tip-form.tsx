'use client'

import { useState } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const categories = [
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'idiom', label: 'Idiom' },
  { value: 'culture', label: 'Culture' },
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'other', label: 'Other' },
]

const japaneseLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'N6', label: 'N6 (Hiragana Katakana)' },
  { value: 'N5', label: 'N5 (Basic)' },
  { value: 'N4', label: 'N4 (Elementary)' },
  { value: 'N3', label: 'N3 (Intermediate)' },
  { value: 'N2', label: 'N2 (Pre-Advanced)' },
  { value: 'N1', label: 'N1 (Advanced)' },
]

interface Tip {
  _id: string
  title: string
  content: string
  category: string
  japaneseLevel: string
  isActive: boolean
  displayDate: string
}

interface TipFormProps {
  tip?: Tip | null
  onSuccess?: () => void
}

export function TipForm({ tip, onSuccess }: TipFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: tip?.title || '',
    content: tip?.content || '',
    category: tip?.category || '',
    japaneseLevel: tip?.japaneseLevel || 'all',
    isActive: tip?.isActive !== undefined ? tip.isActive : true,
    displayDate: tip?.displayDate 
      ? new Date(tip.displayDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = tip ? `/api/tips/${tip._id}` : '/api/tips'
      const method = tip ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tip')
      }

      toast.success(tip ? 'Tip updated successfully!' : 'Tip created successfully!')
      
      setFormData({
        title: '',
        content: '',
        category: '',
        japaneseLevel: 'all',
        isActive: true,
        displayDate: new Date().toISOString().split('T')[0]
      })

      router.refresh()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter tip title"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter tip content"
          rows={6}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="japaneseLevel" className="text-sm font-medium">
            Japanese Level <span className="text-destructive">*</span>
          </label>
          <Select
            value={formData.japaneseLevel}
            onValueChange={(value) => setFormData({ ...formData, japaneseLevel: value })}
            required
          >
            <SelectTrigger id="japaneseLevel">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {japaneseLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="displayDate" className="text-sm font-medium">
            Display Date
          </label>
          <Input
            id="displayDate"
            type="date"
            value={formData.displayDate}
            onChange={(e) => setFormData({ ...formData, displayDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm">
              Active
            </label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tip ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          tip ? 'Update Tip' : 'Create Tip'
        )}
      </Button>
    </form>
  )
}

