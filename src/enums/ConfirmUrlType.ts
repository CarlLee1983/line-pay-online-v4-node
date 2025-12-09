/**
 * Confirm URL Type
 * - CLIENT: User is redirected to the confirmUrl (Client-side)
 * - SERVER: Server-to-server confirmation (less common for standard web flow)
 */
export enum ConfirmUrlType {
  CLIENT = 'CLIENT',
  SERVER = 'SERVER',
}
