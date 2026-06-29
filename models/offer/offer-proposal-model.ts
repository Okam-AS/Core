import { OfferProposalStatus } from '../../enums/offer-proposal-status';
import { OfferProposalLineItemModel } from './offer-proposal-line-item-model';

export class OfferProposalModel {
  offerProposalId: number;
  code: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  companyLegalName: string;
  companyFullAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyVAT: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  accepted?: Date;
  expiration?: Date;
  status: OfferProposalStatus;
  notes: string;
  internalNotes: string;
  sellerId?: string;
  sellerName?: string;
  sellersManagerId?: string;
  sellersManagerName?: string;
  isExpired: boolean;
  lineItems: OfferProposalLineItemModel[] = [];
}
