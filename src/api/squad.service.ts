import { squadApi } from '@/api/client';

export interface SquadMember {
  userId: string;
  firstName: string;
  lastName: string;
  role: 'leader' | 'member';
  building?: string;
  openToTravel?: boolean;
}

export interface Squad {
  id: string;
  squadCode: string;
  name: string;
  badge: string;
  governorate: string;
  leaderId: string;
  members: SquadMember[];
  destination?: string;
  destinationValidated: boolean;
  surveyTarget: number;
  createdAt: string;
  remainingSeats?: number;
  maxMembers?: number;
  pendingSeatCount?: number;
  joinRequests?: SquadJoinRequest[];
}

export interface SquadJoinRequest {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  status: string;
  kind?: string;
}

export interface SquadStats {
  totalSquads: number;
  maxSquads: number;
  maxUsersPerSquad: number;
  remaining: number;
}

export const squadService = {
  getStats: () => squadApi.get<SquadStats>('/squads/stats').then((r) => r.data),
  listAdmin: (q?: string, governorate?: string) =>
    squadApi
      .get<Squad[]>('/squads/admin/all', { params: { q, governorate } })
      .then((r) => r.data),
  updateDestination: (squadId: string, destGov: string, dest: string) =>
    squadApi
      .put(`/squads/${squadId}/destination`, { destGov, dest, validated: true })
      .then((r) => r.data),
  adminAssignMember: (payload: {
    squadId: string;
    userId: string;
    firstName: string;
    lastName: string;
    building?: string;
    openToTravel?: boolean;
  }) => squadApi.post('/squads/admin/assign', payload).then((r) => r.data),
  adminRenameSquad: (squadId: string, name: string) =>
    squadApi.put<Squad>(`/squads/admin/${squadId}`, { name }).then((r) => r.data),
  adminRemoveMember: (squadId: string, memberId: string) =>
    squadApi.delete(`/squads/admin/${squadId}/members/${memberId}`).then((r) => r.data),
  adminDeleteSquad: (squadId: string) =>
    squadApi.delete(`/squads/admin/${squadId}`).then((r) => r.data),
  adminTransferLeadership: (squadId: string, newLeaderId: string) =>
    squadApi
      .put<Squad>(`/squads/admin/${squadId}/leadership`, { newLeaderId })
      .then((r) => r.data),
  listAdminInvites: () =>
    squadApi.get<AdminInvitesResponse>('/squads/admin/invites').then((r) => r.data),
  adminCancelInvite: (squadId: string, requestId: string) =>
    squadApi.delete(`/squads/admin/${squadId}/invites/${requestId}`).then((r) => r.data),
  listUnassignedEmployees: () =>
    squadApi
      .get<{ items: UnassignedEmployee[] }>('/squads/admin/unassigned-employees')
      .then((r) => r.data.items ?? []),
  runAllocation: () =>
    squadApi
      .post<AllocationProposalsResponse>('/squads/admin/allocation/run')
      .then((r) => r.data),
  listAllocationProposals: (status?: AllocationProposal['status']) =>
    squadApi
      .get<AllocationProposalsResponse>('/squads/admin/allocation/proposals', {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),
  confirmAllocation: (id: string) =>
    squadApi
      .post<AllocationProposal>(`/squads/admin/allocation/proposals/${id}/confirm`)
      .then((r) => r.data),
  rejectAllocation: (id: string) =>
    squadApi
      .post<AllocationProposal>(`/squads/admin/allocation/proposals/${id}/reject`)
      .then((r) => r.data),
};

export interface UnassignedEmployee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  governorate?: string;
  buildingName?: string;
  openToTravel: boolean;
  onboardingCompleted?: boolean;
}

export interface AdminInvite {
  id: string;
  squadId: string;
  squadName: string;
  squadCode: string;
  memberCount: number;
  maxMembers: number;
  leaderId: string;
  leaderName: string;
  inviteeUserId: string;
  inviteeFirstName: string;
  inviteeLastName: string;
  inviteeStatus: 'in_squad' | 'no_squad' | 'unregistered';
  sentAt: string;
  status: string;
}

export interface AdminInvitesResponse {
  items: AdminInvite[];
  summary: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    cancelled: number;
  };
}

export interface AllocationProposal {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  governorate?: string;
  openToTravel: boolean;
  preferredGovernorates: string[];
  squadId?: string;
  squadName: string;
  reason: string;
  createsNewSquad: boolean;
  newSquadKey?: string;
  isLeaderOfNewSquad: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface AllocationProposalsResponse {
  items: AllocationProposal[];
  summary: {
    pending: number;
    confirmed: number;
    rejected: number;
    total: number;
  };
}
