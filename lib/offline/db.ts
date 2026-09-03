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

class CafOfflineDB extends Dexie {
  tournamentMeta!: Table<TournamentMeta, string>
  athletesSnapshot!: Table<AthleteSnapshot, string>
  pendingScanLogs!: Table<PendingScanLog, string>

  constructor() {
    super('caf-offline')
    this.version(1).stores({
      tournamentMeta: 'tournamentId',
      athletesSnapshot: 'publicToken, tournamentId',
      pendingScanLogs: 'clientEventId, tournamentId',
    })
  }
}

export const offlineDB = new CafOfflineDB()
