import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessLicense: string;
  serviceType: string;
  description: string;
  createdAt: string;
  status: string;
}

export interface Qualification {
  id: string;
  supplierId: string;
  supplierName: string;
  qualificationType: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: string;
  reviewer?: string;
  reviewDate?: string;
  comments?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  supplierId: string;
  supplierName: string;
  ratingPeriod: string;
  serviceQuality: number;
  timeliness: number;
  communication: number;
  costEffectiveness: number;
  overallRating: number;
  comments: string;
  rater: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  supplierId: string;
  supplierName: string;
  contractNumber: string;
  contractName: string;
  contractType: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentTerms: string;
  status: string;
  signedBy: string;
  signDate: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  supplierId: string;
  supplierName: string;
  contractId: string;
  contractName: string;
  settlementNumber: string;
  settlementPeriod: string;
  amount: number;
  description: string;
  status: string;
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  supplierId: string;
  supplierName: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  assignee?: string;
  createdBy: string;
  responseDeadline: string;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:28473/api';

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(`${this.baseUrl}/suppliers`);
  }

  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'status'>): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${this.baseUrl}/suppliers`, supplier);
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.baseUrl}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/suppliers/${id}`);
  }

  getQualifications(): Observable<ApiResponse<Qualification[]>> {
    return this.http.get<ApiResponse<Qualification[]>>(`${this.baseUrl}/qualifications`);
  }

  createQualification(qualification: Omit<Qualification, 'id' | 'createdAt' | 'status'>): Observable<ApiResponse<Qualification>> {
    return this.http.post<ApiResponse<Qualification>>(`${this.baseUrl}/qualifications`, qualification);
  }

  updateQualification(id: string, qualification: Partial<Qualification>): Observable<ApiResponse<Qualification>> {
    return this.http.put<ApiResponse<Qualification>>(`${this.baseUrl}/qualifications/${id}`, qualification);
  }

  getRatings(): Observable<ApiResponse<Rating[]>> {
    return this.http.get<ApiResponse<Rating[]>>(`${this.baseUrl}/ratings`);
  }

  createRating(rating: Omit<Rating, 'id' | 'createdAt'>): Observable<ApiResponse<Rating>> {
    return this.http.post<ApiResponse<Rating>>(`${this.baseUrl}/ratings`, rating);
  }

  getContracts(): Observable<ApiResponse<Contract[]>> {
    return this.http.get<ApiResponse<Contract[]>>(`${this.baseUrl}/contracts`);
  }

  createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'status'>): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.baseUrl}/contracts`, contract);
  }

  updateContract(id: string, contract: Partial<Contract>): Observable<ApiResponse<Contract>> {
    return this.http.put<ApiResponse<Contract>>(`${this.baseUrl}/contracts/${id}`, contract);
  }

  getSettlements(): Observable<ApiResponse<Settlement[]>> {
    return this.http.get<ApiResponse<Settlement[]>>(`${this.baseUrl}/settlements`);
  }

  createSettlement(settlement: Omit<Settlement, 'id' | 'createdAt' | 'status'>): Observable<ApiResponse<Settlement>> {
    return this.http.post<ApiResponse<Settlement>>(`${this.baseUrl}/settlements`, settlement);
  }

  updateSettlement(id: string, settlement: Partial<Settlement>): Observable<ApiResponse<Settlement>> {
    return this.http.put<ApiResponse<Settlement>>(`${this.baseUrl}/settlements/${id}`, settlement);
  }

  getTickets(): Observable<ApiResponse<Ticket[]>> {
    return this.http.get<ApiResponse<Ticket[]>>(`${this.baseUrl}/tickets`);
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'updatedAt'>): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.baseUrl}/tickets`, ticket);
  }

  updateTicket(id: string, ticket: Partial<Ticket>): Observable<ApiResponse<Ticket>> {
    return this.http.put<ApiResponse<Ticket>>(`${this.baseUrl}/tickets/${id}`, ticket);
  }
}
