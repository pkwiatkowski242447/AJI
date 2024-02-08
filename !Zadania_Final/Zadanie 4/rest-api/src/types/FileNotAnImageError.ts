export type FileNotAnImageError = {
    message: string,
    details: {
        givenMIMEType: string,
        fileName: string,
    },
    allowedMIMETypes: Array<String>
}