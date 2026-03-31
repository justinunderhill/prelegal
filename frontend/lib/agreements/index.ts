import { AgreementConfig } from "../templates/types";
import { mutualNdaConfig } from "./mutual-nda.config";

const agreements: Record<string, AgreementConfig> = {
  "mutual-nda": mutualNdaConfig,
};

export function getAgreementConfig(slug: string): AgreementConfig | undefined {
  return agreements[slug];
}

export function getAllAgreements(): AgreementConfig[] {
  return Object.values(agreements);
}

export { agreements };
