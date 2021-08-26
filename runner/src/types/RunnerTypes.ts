export type TerminalSizeQuery = { cols: string, rows: string }
export type AuthQuery = { token: string, projectId: string }
export type TerminalStats = {pid: number, projectId: string, dir: string}
export type TerminalStatsResponse = {message: string, terminals: TerminalStats[]}