const MODES=new Set(['body','cell']);
const ORGANS=new Set(['lungs','digestive','brain','muscle','renal','endocrine','skin','blood']);
/** Route requests describe a view only; they never alter case metrics or DNA. */
export function normalizeObservationRequest(input={}) {
 if(!MODES.has(input.mode))return null;
 return {mode:input.mode,organ:ORGANS.has(input.organ)?input.organ:null,structure:input.structure==='all'?'all':null};
}
