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
}

export interface SquadStats {
  totalSquads: number;
  maxSquads: number;
  maxUsersPerSquad: number;
  remaining: number;
}

export const squadService = {
  getStats: () => squadApi.get<SquadStats>('/squads/stats').then((r) => r.data),
  list: (q?: string, governorate?: string) =>
    squadApi
      .get<Squad[]>('/squads', { params: { q, governorate } })
      .then((r) => r.data),
  /** Admin-only: includes members array required by console enrichment. */
  listAdmin: (q?: string, governorate?: string) =>
    squadApi
      .get<Squad[]>('/squads/admin/all', { params: { q, governorate } })
      .then((r) => r.data),
  getById: (id: string) => squadApi.get<Squad>(`/squads/${id}`).then((r) => r.data),
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
};
