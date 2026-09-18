/**
 * A request to attend the inaugural AI Decision Control Forum
 * (/events/inaugural-forum). One-shot submission, no lifecycle to track —
 * written once and never updated in place, same shape as
 * VolunteerApplicationRecord.
 */
export interface EventInvitationRequest {
  id: string;
  event: 'inaugural-forum';
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  jobTitle: string;
  industry: string;
  country: string;
  linkedIn: string;
  concern: string;
  discussionTopic: string;
  contributorInterest?: string;
  createdAt: string;
}
