import { TOrder } from '@utils-types';
import { Location } from 'react-router-dom';

export type OrderCardProps = {
  order: TOrder;
  locationState?: { background?: Location };
  isProfileOrders?: boolean;
};
