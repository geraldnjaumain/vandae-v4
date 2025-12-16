import imageCompression from 'browser-image-compression'

/**
 * Compression options for different file types
 */
const IMAGE_COMPRESSION_OPTIONS = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
}

const PDF_COMPRESSION_OPTIONS = {
    maxSizeMB: 5,
    useWebWorker: true,
}

/**
 * File size limits (in MB)
 */
export const MAX_FILE_SIZE_MB = 10
export const MAX_IMAGE_SIZE_MB = 2
export const MAX_PDF_SIZE_MB = 5

/**
 * Allowed file types
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]

/**
 * Compress an image file
 */
export async function compressImage(file: File): Promise<File> {
    try {
        // Skip compression for small files (< 500KB)
        if (file.size < 500 * 1024) {
            return file
        }

        const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)

        // If compressed file is larger, return original
        if (compressedFile.size > file.size) {
            return file
        }

        return compressedFile
    } catch (error) {
        console.error('Image compression failed:', error)
        // Return original file if compression fails
        return file
    }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxMB: number = MAX_FILE_SIZE_MB): boolean {
    const maxBytes = maxMB * 1024 * 1024
    return file.size <= maxBytes
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[] = ALLOWED_FILE_TYPES): boolean {
    return allowedTypes.includes(file.type)
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0
    return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * Check if file is an image
 */
export function isImage(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type)
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
    return file.type === 'application/pdf'
}

/**
 * Compress file based on type
 */
export async function compressFile(file: File): Promise<{
    compressedFile: File
    originalSize: number
    compressedSize: number
    compressionRatio: number
}> {
    const originalSize = file.size

    let compressedFile: File

    if (isImage(file)) {
        compressedFile = await compressImage(file)
    } else {
        // For non-images, return as is
        compressedFile = file
    }

    const compressedSize = compressedFile.size
    const compressionRatio = getCompressionRatio(originalSize, compressedSize)

    return {
        compressedFile,
        originalSize,
        compressedSize,
        compressionRatio,
    }
}

/**
 * Validate and compress file
 */
export async function validateAndCompressFile(file: File): Promise<{
    success: boolean
    file?: File
    error?: string
    metadata?: {
        originalSize: number
        compressedSize: number
        compressionRatio: number
    }
}> {
    // Validate file type
    if (!validateFileType(file)) {
        return {
            success: false,
            error: 'File type not supported. Please upload images or PDF files.',
        }
    }

    // Validate original file size
    if (!validateFileSize(file, 50)) { // Max 50MB before compression
        return {
            success: false,
            error: 'File is too large. Maximum size is 50MB.',
        }
    }

    // Compress file
    const { compressedFile, originalSize, compressedSize, compressionRatio } = await compressFile(file)

    // Validate compressed file size
    if (!validateFileSize(compressedFile, MAX_FILE_SIZE_MB)) {
        return {
            success: false,
            error: `File is still too large after compression. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        }
    }

    return {
        success: true,
        file: compressedFile,
        metadata: {
            originalSize,
            compressedSize,
            compressionRatio,
        },
    }
}
