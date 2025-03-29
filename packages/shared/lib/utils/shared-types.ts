export type ValueOf<T> = T[keyof T];

export enum BackgroundRequestAction {
  REFRESH_IP_INFO = 'REFRESH_IP_INFO',
}
