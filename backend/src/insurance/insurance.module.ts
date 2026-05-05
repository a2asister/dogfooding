import { Module } from '@nestjs/common';
import { DataService } from './services/data.service';
import { InsuranceProductService } from './services/insurance-product.service';
import { InsuredPersonService } from './services/insured-person.service';
import { InsuranceApplicationService } from './services/insurance-application.service';
import { UnderwritingRecordService } from './services/underwriting-record.service';
import { InsurancePolicyService } from './services/insurance-policy.service';
import { ClaimApplicationService } from './services/claim-application.service';
import { AntiFraudService } from './services/anti-fraud.service';
import { ActuarialService } from './services/actuarial.service';
import { InsuranceProductController } from './controllers/insurance-product.controller';
import { InsuredPersonController } from './controllers/insured-person.controller';
import { InsuranceApplicationController } from './controllers/insurance-application.controller';
import { UnderwritingRecordController } from './controllers/underwriting-record.controller';
import { InsurancePolicyController } from './controllers/insurance-policy.controller';
import { ClaimApplicationController } from './controllers/claim-application.controller';
import { AntiFraudController } from './controllers/anti-fraud.controller';
import { ActuarialController } from './controllers/actuarial.controller';

@Module({
  providers: [
    DataService,
    InsuranceProductService,
    InsuredPersonService,
    InsuranceApplicationService,
    UnderwritingRecordService,
    InsurancePolicyService,
    ClaimApplicationService,
    AntiFraudService,
    ActuarialService,
  ],
  controllers: [
    InsuranceProductController,
    InsuredPersonController,
    InsuranceApplicationController,
    UnderwritingRecordController,
    InsurancePolicyController,
    ClaimApplicationController,
    AntiFraudController,
    ActuarialController,
  ],
})
export class InsuranceModule {}
