export type TerminalSizeQuery = { cols: string, rows: string }
export type ProjectQuery = { projectId: string }
export type TerminalStats = {pid: number, projectId: string, dir: string}
export type TerminalStatsResponse = {message: string, terminals: TerminalStats[]}
export type KillTerminalRequest = { pid: number }