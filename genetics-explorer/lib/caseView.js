/** A read-only historical projection. Never copies future evidence into an earlier day. */
export function getCaseAtDay(state, requestedDay) {
 if(requestedDay===null||requestedDay===undefined||Number(requestedDay)===state.day)return state;
 const day=Number(requestedDay);const point=state.timeline?.find(item=>item.day===day);
 if(!point)return state;
 const through=items=>(items||[]).filter(item=>typeof item!=='string'&&item.day<=day);
 const hypothesis=point.knowledgeState||through(state.hypothesisHistory).at(-1);
 const knowledgeState=hypothesis?{currentHypothesis:hypothesis.currentHypothesis,confidence:hypothesis.confidence,supportingEvidence:[...(hypothesis.supportingEvidence||[])],conflictingEvidence:[...(hypothesis.conflictingEvidence||[])],unknowns:[...(hypothesis.unknowns||[])]}:{currentHypothesis:point.currentDiagnosis||'Henüz yeterli gözlem yok',confidence:point.diagnosisConfidence||0,supportingEvidence:[],conflictingEvidence:[],unknowns:['Bu eski kayıtta ayrıntılı hipotez geçmişi bulunmuyor.']};
 return {...state,...point,knowledgeState,timeline:through(state.timeline),doctorNotes:through(state.doctorNotes),bulletinHistory:through(state.bulletinHistory),events:through(state.events),clinicalEvents:through(state.clinicalEvents),importantEvents:through(state.importantEvents),hypothesisHistory:through(state.hypothesisHistory),interventions:through(state.interventions),publicHealthDecisions:through(state.publicHealthDecisions),finalOutcome:null,running:false,paused:true,status:'paused'};
}
