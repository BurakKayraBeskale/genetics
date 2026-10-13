import { DISEASE_PRESETS } from './diseases.js';
import { getCaseDNARelation } from './dnaCaseContext.js';
/** A simulation day, preview selection or archive save is not a new DNA workspace. */
export function caseDNAWorkspaceKey(state,caseEpoch=0){return [state?.diseaseScenarioId||'none',state?.seed??state?.config?.seed??0,caseEpoch].join(':');}
export function supportedCaseDNAPreset(profile){
 const relation=getCaseDNARelation(profile||{});
 const direct=relation.type==='DIRECT_GENETIC';
 if(!direct)return null;
 const id=relation.presetId||relation.educationalVariant?.presetId;
 return DISEASE_PRESETS.find(preset=>preset.id===id)||null;
}
export const dnaWorkspaceMode=value=>value==='case'?'case':'free';