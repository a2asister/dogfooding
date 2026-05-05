"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceModule = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./services/data.service");
const insurance_product_service_1 = require("./services/insurance-product.service");
const insured_person_service_1 = require("./services/insured-person.service");
const insurance_application_service_1 = require("./services/insurance-application.service");
const underwriting_record_service_1 = require("./services/underwriting-record.service");
const insurance_policy_service_1 = require("./services/insurance-policy.service");
const claim_application_service_1 = require("./services/claim-application.service");
const anti_fraud_service_1 = require("./services/anti-fraud.service");
const actuarial_service_1 = require("./services/actuarial.service");
const insurance_product_controller_1 = require("./controllers/insurance-product.controller");
const insured_person_controller_1 = require("./controllers/insured-person.controller");
const insurance_application_controller_1 = require("./controllers/insurance-application.controller");
const underwriting_record_controller_1 = require("./controllers/underwriting-record.controller");
const insurance_policy_controller_1 = require("./controllers/insurance-policy.controller");
const claim_application_controller_1 = require("./controllers/claim-application.controller");
const anti_fraud_controller_1 = require("./controllers/anti-fraud.controller");
const actuarial_controller_1 = require("./controllers/actuarial.controller");
let InsuranceModule = class InsuranceModule {
};
exports.InsuranceModule = InsuranceModule;
exports.InsuranceModule = InsuranceModule = __decorate([
    (0, common_1.Module)({
        providers: [
            data_service_1.DataService,
            insurance_product_service_1.InsuranceProductService,
            insured_person_service_1.InsuredPersonService,
            insurance_application_service_1.InsuranceApplicationService,
            underwriting_record_service_1.UnderwritingRecordService,
            insurance_policy_service_1.InsurancePolicyService,
            claim_application_service_1.ClaimApplicationService,
            anti_fraud_service_1.AntiFraudService,
            actuarial_service_1.ActuarialService,
        ],
        controllers: [
            insurance_product_controller_1.InsuranceProductController,
            insured_person_controller_1.InsuredPersonController,
            insurance_application_controller_1.InsuranceApplicationController,
            underwriting_record_controller_1.UnderwritingRecordController,
            insurance_policy_controller_1.InsurancePolicyController,
            claim_application_controller_1.ClaimApplicationController,
            anti_fraud_controller_1.AntiFraudController,
            actuarial_controller_1.ActuarialController,
        ],
    })
], InsuranceModule);
//# sourceMappingURL=insurance.module.js.map