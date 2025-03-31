export type ValueOf<T> = T[keyof T];

export enum BackgroundRequestAction {
  REFRESH_IP_INFO = 'REFRESH_IP_INFO',
  ADD_SESSION_ACCESS_RULE = 'ADD_SESSION_ACCESS_RULE',
}
