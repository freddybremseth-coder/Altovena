// Nexus execution policy prototype. No network, database or external side effects.
// This contract is deliberately separate from the public, illustrative Altovena demo.
export const STATES=Object.freeze(['draft','researching','review_required','approved','rejected','executing','completed','failed','cancelled']);
const edges=Object.freeze({
 draft:['researching','cancelled'],
 researching:['review_required','failed','cancelled'],
 review_required:['approved','rejected','cancelled'],
 approved:['executing','cancelled'],
 rejected:[],executing:['completed','failed'],completed:[],failed:[],cancelled:[]
});
// All execution paths need approval, including ostensibly read-only actions.
// Caller-supplied approvals are NOT trusted until checked again by an authoritative server.
export function transition({task,actor,next,now,approval}){
 if(!task||typeof task!=='object'||!STATES.includes(task.status)||!STATES.includes(next))throw Error('INVALID_STATE');
 if(!actor||typeof actor.id!=='string'||!actor.id.trim()||!Array.isArray(actor.permissions))throw Error('UNAUTHENTICATED');
 if(!edges[task.status].includes(next))throw Error('TRANSITION_DENIED');
 const permission=next==='approved'||next==='rejected'?'task:approve':next==='executing'?'task:execute':'task:write';
 if(!actor.permissions.includes(permission))throw Error('PERMISSION_DENIED');
 if(!task.brandId||!actor.brandIds?.includes(task.brandId))throw Error('BRAND_SCOPE_DENIED');
 if(next==='approved'){
  if(actor.id===task.proposedBy)throw Error('SEPARATION_OF_DUTIES');
  if(!task.qualityReviewed||!Array.isArray(task.evidence)||task.evidence.length===0)throw Error('EVIDENCE_REQUIRED');
 }
 if(next==='executing'){
  if(!approval||approval.taskId!==task.id||approval.actorId===task.proposedBy||approval.brandId!==task.brandId||approval.decision!=='approved'||approval.version!==task.version||approval.actionType!==task.actionType||approval.actorId===actor.id)throw Error('VALID_APPROVAL_REQUIRED');
  if(typeof approval.expiresAt!=='string'||!Number.isFinite(Date.parse(approval.expiresAt))||Date.parse(approval.expiresAt)<=Date.parse(now))throw Error('APPROVAL_EXPIRED');
  if(typeof task.actionDigest!=='string'||!task.actionDigest||approval.actionDigest!==task.actionDigest)throw Error('ACTION_CHANGED');
 }
 if(typeof now!=='string'||Number.isNaN(Date.parse(now)))throw Error('INVALID_TIMESTAMP');
 return Object.freeze({from:task.status,to:next,taskId:task.id,brandId:task.brandId,actorId:actor.id,occurredAt:now,taskVersion:task.version});
}
