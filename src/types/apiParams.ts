export interface ApiParams {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | Record<string, unknown>;
}
