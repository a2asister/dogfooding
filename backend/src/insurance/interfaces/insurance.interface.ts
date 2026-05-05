export interface InsuranceProduct {
  id: string;
  name: string;
  type: 'accident' | 'health' | 'life' | 'property';
  description: string;
  minAge: number;
  maxAge: number;
  minPremium: number;
  maxCoverage: number;
  coveragePeriod: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface InsuredPerson {
  id: string;
  name: string;
  idNumber: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  healthStatus: 'healthy' | 'minor_issue' | 'serious_issue';
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceApplication {
  id: string;
  insuredPersonId: string;
  productId: string;
  applicationDate: string;
  coverageAmount: number;
  premiumAmount: number;
  paymentMethod: 'annual' | 'semi-annual' | 'quarterly' | 'monthly';
  healthDeclaration: {
    hasSeriousIllness: boolean;
    hasSurgeryInLastYear: boolean;
    isSmoker: boolean;
    isDrinker: boolean;
    familyHistory: string;
  };
  status: 'draft' | 'submitted' | 'underwriting' | 'approved' | 'rejected' | 'withdrawn';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnderwritingRecord {
  id: string;
  applicationId: string;
  underwriterId: string;
  underwriterName: string;
  underwritingDate: string;
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    score: number;
    factors: {
      name: string;
      score: number;
      weight: number;
    }[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_info';
  recommendation: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  applicationId: string;
  insuredPersonId: string;
  productId: string;
  issueDate: string;
  effectiveDate: string;
  expiryDate: string;
  coverageAmount: number;
  premiumAmount: number;
  paymentMethod: 'annual' | 'semi-annual' | 'quarterly' | 'monthly';
  status: 'active' | 'lapsed' | 'surrendered' | 'matured';
  terms: {
    coverageScope: string;
    exclusions: string;
    waitingPeriod: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClaimApplication {
  id: string;
  policyId: string;
  policyNumber: string;
  insuredPersonId: string;
  claimDate: string;
  claimType: 'accident_death' | 'accident_disability' | 'medical_expense' | 'serious_illness' | 'life_death';
  description: string;
  claimAmount: number;
  supportingDocuments: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
  status: 'submitted' | 'reviewing' | 'investigating' | 'approved' | 'rejected' | 'paid';
  investigationStatus: 'pending' | 'in_progress' | 'completed';
  approvedAmount: number | null;
  rejectionReason: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AntiFraudRecord {
  id: string;
  relatedId: string;
  relatedType: 'application' | 'claim' | 'policy';
  detectionDate: string;
  fraudRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: {
    name: string;
    score: number;
    description: string;
  }[];
  investigationStatus: 'pending' | 'in_progress' | 'completed';
  investigationResult: 'no_fraud' | 'suspected_fraud' | 'confirmed_fraud';
  investigatorId: string;
  investigatorName: string;
  investigationNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActuarialData {
  id: string;
  productId: string;
  productName: string;
  analysisPeriod: {
    startDate: string;
    endDate: string;
  };
  premiumStatistics: {
    totalPremium: number;
    averagePremium: number;
    premiumByAgeGroup: {
      ageGroup: string;
      totalPremium: number;
      count: number;
    }[];
  };
  claimStatistics: {
    totalClaims: number;
    totalClaimAmount: number;
    averageClaimAmount: number;
    claimRate: number;
    claimsByType: {
      type: string;
      count: number;
      totalAmount: number;
    }[];
  };
  lossRatio: number;
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
  riskAssessment: {
    overallRiskLevel: 'low' | 'medium' | 'high';
    keyRiskFactors: string[];
  };
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}
