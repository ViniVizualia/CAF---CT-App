import Dexie, { type Table } from 'dexie'

export interface TournamentMeta {
  tournamentId: string
  name: string
  snapshotGeneratedAt: string
  athleteCount: number
  offlineExpiresAt: string
}

export interface AthleteSnapshot {
  publicToken: string
  tournamentId: string
  athleteId: string
  cafNumber: number | null
  fullName: string
  categoryName: string | null
  status: string
  validityDate: string | null
  thumbnailBlob: Blob | null
}

export interface PendingScanLog {
  clientEventId: string
  tournamentId: string
  athleteId: string | null
  organizerProfileId: string
  scannedAt: string
  method: 'qr' | 'manual'
  resultStatus: 'liberado' | 'vencido' | 'bloqueado' | 'nao_encontrado'
}

export interface TeamSnapshot {
  id: string
  tournamentId: string
  categoryId: number
  categoryName: string
  label: string
}

export interface BracketSnapshot {
  tournamentId_categoryId: string
  id: string | null
  tournamentId: string
  categoryId: number
  status: string
}

export interface BracketMatchSnapshot {
  clientEventId: string
  id: string | null
  tournamentId: string
  categoryId: number
  roundNumber: number
  stage: 'pool' | 'knockout'
  teamAId: string | null
  teamBId: string | null
  teamALossesBefore: number
  teamBLossesBefore: number
  score: string | null
  winnerTeamId: string | null
  synced: boolean
}

class CafOfflineDB extends Dexie {
  tournamentMeta!: Table<TournamentMeta, string>
  athletesSnapshot!: Table<AthleteSnapshot, string>
  pendingScanLogs!: Table<PendingScanLog, string>
  teamsSnapshot!: Table<TeamSnapshot, string>
  bracketsSnapshot!: Table<BracketSnapshot, string>
  bracketMatchesSnapshot!: Table<BracketMatchSnapshot, string>

  constructor() {
    super('caf-offline')
    this.version(1).stores({
      tournamentMeta: 'tournamentId',
      athletesSnapshot: 'publicToken, tournamentId',
      pendingScanLogs: 'clientEventId, tournamentId',
    })
    this.version(2).stores({
      tournamentMeta: 'tournamentId',
      athletesSnapshot: 'publicToken, tournamentId',
      pendingScanLogs: 'clientEventId, tournamentId',
      teamsSnapshot: 'id, tournamentId, categoryId',
      bracketsSnapshot: 'tournamentId_categoryId, tournamentId',
      bracketMatchesSnapshot: 'clientEventId, tournamentId, categoryId, synced',
    })
  }
}

export const offlineDB = new CafOfflineDB()
