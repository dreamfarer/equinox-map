import { TPopupPayload } from './popup-payload';

export type TPopup = {
  id: string;
  anchor: 'bottom' | 'center';
  categories: Record<string, TPopupPayload>;
};
