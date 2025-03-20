import { Contract, JsonRpcProvider, Signer } from 'ethers';
import { blockchainConfig } from '../config/google-cloud';

interface VoteEventArgs {
  voterId: string;
  candidateId: string;
  timestamp: bigint;
}

interface VoteEvent {
  args: VoteEventArgs;
}

function isVoteEvent(event: unknown): event is VoteEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'args' in event &&
    typeof (event as VoteEvent).args === 'object' &&
    (event as VoteEvent).args !== null &&
    'candidateId' in (event as VoteEvent).args &&
    'timestamp' in (event as VoteEvent).args
  );
}

class BlockchainService {
  private provider: JsonRpcProvider | null = null;
  private signer: Signer | null = null;
  private contract: Contract | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      if (!blockchainConfig.providerUrl) {
        throw new Error('Provider URL is not configured');
      }
      if (!blockchainConfig.contractAddress) {
        throw new Error('Contract address is not configured');
      }

      this.provider = new JsonRpcProvider(blockchainConfig.providerUrl);
      this.signer = await this.provider.getSigner();
      
      // Define contract ABI
      const contractABI = [
        'function recordVote(string memory voterId, string memory candidateId, uint256 timestamp) public',
        'function verifyVote(string memory voterId) public view returns (bool)',
        'function getVoteCount(string memory candidateId) public view returns (uint256)',
        'function isEligibleVoter(string memory voterId) public view returns (bool)',
        'event VoteRecorded(string indexed voterId, string indexed candidateId, uint256 timestamp)',
        'event VoterRegistered(string indexed voterId, uint256 timestamp)',
        'event VoterStatusUpdated(string indexed voterId, bool eligible, uint256 timestamp)'
      ];

      this.contract = new Contract(
        blockchainConfig.contractAddress,
        contractABI,
        this.signer
      );
      this.isInitialized = true;
    } catch (error) {
      console.error('Blockchain service initialization failed:', error);
      throw error;
    }
  }

  async recordVote(
    voterId: string,
    candidateId: string,
    timestamp: number
  ): Promise<{
    success: boolean;
    transactionHash: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract || !this.signer) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Check voter eligibility
      const isEligible = await this.contract.isEligibleVoter(voterId);
      if (!isEligible) {
        throw new Error('Voter is not eligible to vote');
      }

      // Check if vote already exists
      const hasVoted = await this.contract.verifyVote(voterId);
      if (hasVoted) {
        throw new Error('Vote already recorded for this voter');
      }

      // Record vote
      const tx = await this.contract.recordVote(voterId, candidateId, timestamp);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Vote recording failed:', error);
      throw error;
    }
  }

  async verifyVote(voterId: string): Promise<{
    hasVoted: boolean;
    timestamp: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly initialized');
      }

      const hasVoted = await this.contract.verifyVote(voterId);
      
      // Get vote timestamp from events
      const filter = this.contract.filters.VoteRecorded(voterId);
      const events = await this.contract.queryFilter(filter);
      
      const timestamp = events.length > 0
        ? Number((events[0] as unknown as VoteEvent).args.timestamp)
        : 0;

      return {
        hasVoted,
        timestamp
      };
    } catch (error) {
      console.error('Vote verification failed:', error);
      throw error;
    }
  }

  async getVoteCount(candidateId: string): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly initialized');
      }

      const count = await this.contract.getVoteCount(candidateId);
      return Number(count);
    } catch (error) {
      console.error('Vote count retrieval failed:', error);
      throw error;
    }
  }

  async registerVoter(voterId: string): Promise<{
    success: boolean;
    transactionHash: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract || !this.signer) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Register voter
      const tx = await this.contract.registerVoter(voterId);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Voter registration failed:', error);
      throw error;
    }
  }

  async updateVoterStatus(
    voterId: string,
    eligible: boolean
  ): Promise<{
    success: boolean;
    transactionHash: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract || !this.signer) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Update voter status
      const tx = await this.contract.updateVoterStatus(voterId, eligible);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Voter status update failed:', error);
      throw error;
    }
  }

  async getVoterHistory(voterId: string): Promise<Array<{
    candidateId: string;
    timestamp: number;
  }>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Get vote history from events
      const filter = this.contract.filters.VoteRecorded(voterId);
      const events = await this.contract.queryFilter(filter);

      return events.map((event: any) => {
        const eventData = event as unknown as VoteEvent;
        return {
          candidateId: eventData.args.candidateId,
          timestamp: Number(eventData.args.timestamp)
        };
      });
    } catch (error) {
      console.error('Voter history retrieval failed:', error);
      throw error;
    }
  }

  async getElectionResults(): Promise<Array<{
    candidateId: string;
    voteCount: number;
  }>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!this.contract) {
        throw new Error('Blockchain service not properly initialized');
      }

      // Get all vote recorded events
      const filter = this.contract.filters.VoteRecorded();
      const events = await this.contract.queryFilter(filter);

      // Count votes per candidate
      const voteCounts = events.reduce((acc: { [key: string]: number }, event: any) => {
        const eventData = event as unknown as VoteEvent;
        const candidateId = eventData.args.candidateId;
        acc[candidateId] = (acc[candidateId] || 0) + 1;
        return acc;
      }, {});

      // Convert to array format
      return Object.entries(voteCounts).map(([candidateId, voteCount]) => ({
        candidateId,
        voteCount: Number(voteCount)
      }));
    } catch (error) {
      console.error('Election results retrieval failed:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService(); 