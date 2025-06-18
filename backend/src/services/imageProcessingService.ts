import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// Type definitions for image processing
export interface ProcessedImageResult {
  imageUrl: string
  imageAlt: string
  imageSizes: Record<string, string>
}

export interface ProcessedCoverArtResult {
  coverArtUrl: string
  coverArtAlt: string
  coverArtSizes: Record<string, string>
}

export interface ImageSize {
  name: string
  width: number
  height: number
}

export type ImageType = 'artist' | 'release'

export class ImageProcessingService {
  
  /**
   * Validate uploaded image file
   */
  static validateImageFile(file: Express.Multer.File): void {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit')
    }
    
    // Check MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed')
    }
    
    // Check if buffer exists (for memory storage)
    if (!file.buffer) {
      throw new Error('File buffer is required')
    }
  }
  
  /**
   * Process artist image into multiple sizes
   */
  static async processArtistImage(
    file: Express.Multer.File,
    artistId: number,
    altText: string
  ): Promise<ProcessedImageResult> {
    try {
      this.validateImageFile(file)
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads/artists')
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true })
      }
      
      const sizes = this.getImageSizes('artist')
      const imageSizes: Record<string, string> = {}
      
      // Process each size
      for (const size of sizes) {
        const filename = `${artistId}_${size.name}.webp`
        const filepath = path.join(uploadsDir, filename)
        
        await sharp(file.buffer)
          .resize(size.width, size.height)
          .webp({ quality: 85 })
          .toFile(filepath)
        
        imageSizes[size.name] = `/uploads/artists/${filename}`
      }
      
      return {
        imageUrl: imageSizes.profile, // Main image URL points to profile size
        imageAlt: altText,
        imageSizes
      }
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Process release cover art into multiple sizes (1:1 aspect ratio)
   */
  static async processReleaseCoverArt(
    file: Express.Multer.File,
    releaseId: number,
    altText: string
  ): Promise<ProcessedCoverArtResult> {
    try {
      this.validateImageFile(file)
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads/releases')
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true })
      }
      
      const sizes = this.getImageSizes('release')
      const coverArtSizes: Record<string, string> = {}
      
      // Process each size with 1:1 aspect ratio
      for (const size of sizes) {
        const filename = `${releaseId}_${size.name}.webp`
        const filepath = path.join(uploadsDir, filename)
        
        await sharp(file.buffer)
          .resize(size.width, size.height) // Square dimensions for releases
          .webp({ quality: 85 })
          .toFile(filepath)
        
        coverArtSizes[size.name] = `/uploads/releases/${filename}`
      }
      
      return {
        coverArtUrl: coverArtSizes.medium, // Main cover URL points to medium size
        coverArtAlt: altText,
        coverArtSizes
      }
    } catch (error) {
      throw new Error(`Cover art processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Get image size configurations for different types
   */
  static getImageSizes(type: ImageType): ImageSize[] {
    switch (type) {
      case 'artist':
        return [
          { name: 'thumbnail', width: 400, height: 400 },
          { name: 'profile', width: 800, height: 800 },
          { name: 'featured', width: 1200, height: 1200 }
        ]
      case 'release':
        return [
          { name: 'small', width: 300, height: 300 },
          { name: 'medium', width: 600, height: 600 },
          { name: 'large', width: 1200, height: 1200 }
        ]
      default:
        throw new Error(`Invalid image type: ${type}`)
    }
  }
  
  /**
   * Delete image files for a given entity
   */
  static async deleteImageFiles(type: ImageType, entityId: number): Promise<void> {
    const sizes = this.getImageSizes(type)
    const uploadsDir = path.join(__dirname, `../../uploads/${type === 'artist' ? 'artists' : 'releases'}`)
    
    const deletePromises = sizes.map(async (size) => {
      const filename = `${entityId}_${size.name}.webp`
      const filepath = path.join(uploadsDir, filename)
      
      try {
        await fs.promises.unlink(filepath)
      } catch (error: any) {
        // Ignore file not found errors
        if (error.code !== 'ENOENT') {
          console.error(`Failed to delete ${filepath}:`, error)
        }
      }
    })
    
    await Promise.all(deletePromises)
  }
}