import { AgreementConfig } from "../templates/types";
import { mutualNdaConfig } from "./mutual-nda.config";
import { csaConfig } from "./csa.config";
import { dpaConfig } from "./dpa.config";
import { psaConfig } from "./psa.config";
import { slaConfig } from "./sla.config";
import { designPartnerConfig } from "./design-partner.config";
import { partnershipConfig } from "./partnership.config";
import { pilotConfig } from "./pilot.config";
import { baaConfig } from "./baa.config";
import { softwareLicenseConfig } from "./software-license.config";
import { aiAddendumConfig } from "./ai-addendum.config";

const agreements: Record<string, AgreementConfig> = {
  "mutual-nda": mutualNdaConfig,
  "csa": csaConfig,
  "dpa": dpaConfig,
  "psa": psaConfig,
  "sla": slaConfig,
  "design-partner": designPartnerConfig,
  "partnership": partnershipConfig,
  "pilot": pilotConfig,
  "baa": baaConfig,
  "software-license": softwareLicenseConfig,
  "ai-addendum": aiAddendumConfig,
};

export function getAgreementConfig(slug: string): AgreementConfig | undefined {
  return agreements[slug];
}

export function getAllAgreements(): AgreementConfig[] {
  return Object.values(agreements);
}

export { agreements };
