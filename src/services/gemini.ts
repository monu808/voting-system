import { geminiConfig } from '../config/google-cloud';

// Add module declaration to suppress TypeScript errors
declare module '@google/generative-ai';

class GeminiService {
  private model: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamic import with more resilient approach
      const geminiModule = await import('@google/generative-ai');
      const GoogleGenerativeAI = geminiModule.GoogleGenerativeAI;
      
      // Initialize Gemini with API key
      const apiKey = geminiConfig.apiKey || '';
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: geminiConfig.model || 'gemini-pro' });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw error;
    }
  }

  async analyzeVoterBehavior(voterData: {
    id: string;
    location: string;
    time: string;
    deviceInfo: string;
    previousVotes: any[];
  }): Promise<{
    riskScore: number;
    anomalies: string[];
    recommendations: string[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const prompt = this.generateAnalysisPrompt(voterData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Voter behavior analysis failed:', error);
      throw error;
    }
  }

  async detectFraudulentPatterns(votingData: {
    timestamp: string;
    location: string;
    voterId: string;
    deviceId: string;
    ipAddress: string;
  }): Promise<{
    isSuspicious: boolean;
    reasons: string[];
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const prompt = this.generateFraudDetectionPrompt(votingData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseFraudDetectionResponse(text);
    } catch (error) {
      console.error('Fraud pattern detection failed:', error);
      throw error;
    }
  }

  private generateAnalysisPrompt(voterData: any): string {
    return `
      Analyze the following voter behavior data for potential anomalies:
      Voter ID: ${voterData.id}
      Location: ${voterData.location}
      Time: ${voterData.time}
      Device Info: ${voterData.deviceInfo}
      Previous Votes: ${JSON.stringify(voterData.previousVotes)}

      Please provide:
      1. Risk score (0-100)
      2. List of detected anomalies
      3. Security recommendations
    `;
  }

  private generateFraudDetectionPrompt(votingData: any): string {
    return `
      Analyze the following voting data for potential fraud:
      Timestamp: ${votingData.timestamp}
      Location: ${votingData.location}
      Voter ID: ${votingData.voterId}
      Device ID: ${votingData.deviceId}
      IP Address: ${votingData.ipAddress}

      Please provide:
      1. Whether the activity is suspicious (true/false)
      2. List of suspicious patterns detected
      3. Confidence score (0-1)
    `;
  }

  private parseAnalysisResponse(text: string): {
    riskScore: number;
    anomalies: string[];
    recommendations: string[];
  } {
    // Parse the Gemini response into structured data
    // This is a simplified version - in production, use more robust parsing
    const lines = text.split('\n');
    let riskScore = 0;
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    for (const line of lines) {
      if (line.includes('Risk score:')) {
        riskScore = parseInt(line.split(':')[1].trim());
      } else if (line.includes('Anomaly:')) {
        anomalies.push(line.split(':')[1].trim());
      } else if (line.includes('Recommendation:')) {
        recommendations.push(line.split(':')[1].trim());
      }
    }

    return { riskScore, anomalies, recommendations };
  }

  private parseFraudDetectionResponse(text: string): {
    isSuspicious: boolean;
    reasons: string[];
    confidence: number;
  } {
    // Parse the Gemini response into structured data
    // This is a simplified version - in production, use more robust parsing
    const lines = text.split('\n');
    let isSuspicious = false;
    const reasons: string[] = [];
    let confidence = 0;

    for (const line of lines) {
      if (line.includes('Suspicious:')) {
        isSuspicious = line.split(':')[1].trim().toLowerCase() === 'true';
      } else if (line.includes('Reason:')) {
        reasons.push(line.split(':')[1].trim());
      } else if (line.includes('Confidence:')) {
        confidence = parseFloat(line.split(':')[1].trim());
      }
    }

    return { isSuspicious, reasons, confidence };
  }
}

export const geminiService = new GeminiService(); 