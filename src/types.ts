export type User = {
  email: string;
  password: string;
};
type Link = {
  filename: string;
  width: string;
  height: string;
  videoUrl: string;
  success: boolean;
};

type VideoAndAudio = {
  success: boolean;
  video: string;
  audio: string;
};

type Claim = {
  claim: string;
  evidence: string;
  is_worth_verifying: boolean;
};

type Analysis = {
  category: string;
  claims: Claim[];
  summary: string;
  is_worthy: boolean;
  why_not_worthy?: string | null;
};

type Description = {
  success: boolean;
  analysis: Analysis;
};

type IndividualClaim = {
  claim: string;
  can_verify_with_llm: boolean;
  verification_method: string;
  authenticity_score: number;
  authenticity_label: string;
  explanation: string;
  evidence_sources?: string[] | null;
  confidence: number;
};

type IfWorthyResponse = {
  overall_authenticity: string;
  overall_score: number;
  summary: string;
  recommendation: string;
  individual_claims: IndividualClaim[];
};

type FinalResponse = {
  overall_authenticity: string;
  overall_score: number;
  summary: string;
  recommendation: string;
  individual_claims: IndividualClaim[];
};

type NotWorthyResponseDetails = {
  summary: string;
  reason: string;
  category: string;
};

type WorthyResponse = {
  link: Link;
  video_and_audio: VideoAndAudio;
  transcription: string;
  description: Description;
  if_worthy_response: IfWorthyResponse;
  final: FinalResponse;
};

type NotWorthyResponse = {
  link: Link;
  video_and_audio: VideoAndAudio;
  transcription: string;
  description: Description;
  not_worthy_response: NotWorthyResponseDetails;
  final: NotWorthyResponseDetails;
};

export type APIResponse = {
  worthy: boolean;
  response: WorthyResponse | NotWorthyResponse;
};

export type Feedback = {
  transcript_rating: number;
  transcript_feedback: string;

  description_rating: number;
  description_feedback: string;

  worthy_checked_correctly: boolean;

  not_worthy_reason_rating: number;
  not_worthy_reason_feedback: string;

  worthy_reason_rating: number;
  worthy_reason_feedback: string;

  urls_fetched_rating: number;
  urls_fetched_feedback: string;

  final_rating: number;
  final_feedback: string;
};

export type CreateTestEntry = APIResponse & {
  feedback: Feedback;
  insta_reel_id: string;
};

export type OneTestEntry = {
  _id: string;
  worthy: boolean;
  insta_reel_id: string;
  created_at: string;
};

export type OneTestDetailedEntry = CreateTestEntry & {
  _id: string;
  user_email: string;
  created_at: string;
};
