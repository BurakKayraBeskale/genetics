import { generateClinicalEvents } from './CaseEventEngine.js';
/** Compatibility adapter for existing doctor/bulletin consumers. */
export function generateCaseEvents(previous,next,options={}){
 const {clinicalEvents}=generateClinicalEvents(previous,next,options);
 return {doctorNotes:clinicalEvents.filter(e=>['CLINICAL','ANATOMY','IMMUNE','ALERT'].includes(e.type)),bulletins:clinicalEvents.filter(e=>['BULLETIN','PUBLIC_HEALTH'].includes(e.type)),events:clinicalEvents};
}
