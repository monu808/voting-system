import { visionConfig } from '../config/google-cloud';

class VisionService {
  private client: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamically import Google Cloud Vision
      const { ImageAnnotatorClient } = await import('@google-cloud/vision');
      
      // Initialize Vision client with credentials
      this.client = new ImageAnnotatorClient({
        credentials: visionConfig.credentials
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Vision API:', error);
      throw error;
    }
  }

  async verifyDocument(imageBuffer: Buffer): Promise<{
    isValid: boolean;
    confidence: number;
    extractedText: string;
    documentType: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Perform document text detection
      const [result] = await this.client.documentTextDetection(imageBuffer);
      const fullTextAnnotation = result.fullTextAnnotation;

      if (!fullTextAnnotation) {
        return {
          isValid: false,
          confidence: 0,
          extractedText: '',
          documentType: 'unknown'
        };
      }

      // Extract text and analyze document type
      const extractedText = fullTextAnnotation.text;
      const documentType = await this.determineDocumentType(extractedText);
      
      // Perform additional verification based on document type
      const verificationResult = await this.verifyDocumentByType(
        documentType,
        extractedText,
        imageBuffer
      );

      return {
        isValid: verificationResult.isValid,
        confidence: verificationResult.confidence,
        extractedText,
        documentType
      };
    } catch (error) {
      console.error('Document verification failed:', error);
      throw error;
    }
  }

  async detectFaces(imageBuffer: Buffer): Promise<{
    faces: any[];
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Perform face detection
      const [result] = await this.client.faceDetection(imageBuffer);
      const faces = result.faceAnnotations || [];

      // Calculate overall confidence
      const confidence = faces.reduce((acc: number, face: any) => {
        return acc + (face.detectionConfidence || 0);
      }, 0) / (faces.length || 1);

      return {
        faces,
        confidence
      };
    } catch (error) {
      console.error('Face detection failed:', error);
      throw error;
    }
  }

  private async determineDocumentType(text: string): Promise<string> {
    // Analyze text to determine document type
    // This is a simplified version - in production, use more sophisticated analysis
    const textLower = text.toLowerCase();

    if (textLower.includes('voter id') || textLower.includes('voter registration')) {
      return 'voter_id';
    } else if (textLower.includes('drivers license') || textLower.includes('driving license')) {
      return 'drivers_license';
    } else if (textLower.includes('passport')) {
      return 'passport';
    } else if (textLower.includes('national id') || textLower.includes('national identification')) {
      return 'national_id';
    }

    return 'unknown';
  }

  private async verifyDocumentByType(
    documentType: string,
    extractedText: string,
    imageBuffer: Buffer
  ): Promise<{
    isValid: boolean;
    confidence: number;
  }> {
    switch (documentType) {
      case 'voter_id':
        return this.verifyVoterId(extractedText);
      case 'drivers_license':
        return this.verifyDriversLicense(extractedText);
      case 'passport':
        return this.verifyPassport(extractedText);
      case 'national_id':
        return this.verifyNationalId(extractedText);
      default:
        return { isValid: false, confidence: 0 };
    }
  }

  private async verifyVoterId(text: string): Promise<{
    isValid: boolean;
    confidence: number;
  }> {
    // Implement voter ID verification logic
    // This is a simplified version - in production, use more sophisticated verification
    const requiredFields = [
      'voter id',
      'name',
      'date of birth',
      'address',
      'photo'
    ];

    const missingFields = requiredFields.filter(field => 
      !text.toLowerCase().includes(field)
    );

    const confidence = 1 - (missingFields.length / requiredFields.length);
    const isValid = confidence > 0.8; // 80% threshold

    return { isValid, confidence };
  }

  private async verifyDriversLicense(text: string): Promise<{
    isValid: boolean;
    confidence: number;
  }> {
    // Implement driver's license verification logic
    // This is a simplified version - in production, use more sophisticated verification
    const requiredFields = [
      'drivers license',
      'name',
      'date of birth',
      'address',
      'license number',
      'expiration date'
    ];

    const missingFields = requiredFields.filter(field => 
      !text.toLowerCase().includes(field)
    );

    const confidence = 1 - (missingFields.length / requiredFields.length);
    const isValid = confidence > 0.8; // 80% threshold

    return { isValid, confidence };
  }

  private async verifyPassport(text: string): Promise<{
    isValid: boolean;
    confidence: number;
  }> {
    // Implement passport verification logic
    // This is a simplified version - in production, use more sophisticated verification
    const requiredFields = [
      'passport',
      'name',
      'nationality',
      'date of birth',
      'passport number',
      'expiration date'
    ];

    const missingFields = requiredFields.filter(field => 
      !text.toLowerCase().includes(field)
    );

    const confidence = 1 - (missingFields.length / requiredFields.length);
    const isValid = confidence > 0.8; // 80% threshold

    return { isValid, confidence };
  }

  private async verifyNationalId(text: string): Promise<{
    isValid: boolean;
    confidence: number;
  }> {
    // Implement national ID verification logic
    // This is a simplified version - in production, use more sophisticated verification
    const requiredFields = [
      'national id',
      'name',
      'date of birth',
      'address',
      'id number',
      'expiration date'
    ];

    const missingFields = requiredFields.filter(field => 
      !text.toLowerCase().includes(field)
    );

    const confidence = 1 - (missingFields.length / requiredFields.length);
    const isValid = confidence > 0.8; // 80% threshold

    return { isValid, confidence };
  }
}

export const visionService = new VisionService(); 