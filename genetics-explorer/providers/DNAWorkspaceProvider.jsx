'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import useDNAExperiment from '../hooks/useDNAExperiment';
import {useSimulation} from './SimulationProvider';
import {caseDNAWorkspaceKey,supportedCaseDNAPreset,dnaWorkspaceMode} from '../lib/dnaWorkspace';
const DNAWorkspaceContext=createContext(null);
function useExperimentWorkspace(){
 const experiment=useDNAExperiment();
 const [activeDiseaseId,setActiveDiseaseId]=useState(null);
 const [diseaseQueue,setDiseaseQueue]=useState([]);
 const {pending,act,reset}=experiment;
 useEffect(()=>{
  if(!diseaseQueue.length||pending)return;
  const [step,...rest]=diseaseQueue;
  act(step.kind,step.base,{id:step.id,side:step.side});setDiseaseQueue(rest);
 },[diseaseQueue,pending,act]);
 const applyDisease=useCallback(preset=>{reset();setActiveDiseaseId(preset.id);setDiseaseQueue(preset.steps.map(step=>({...step})));},[reset]);
 const clearDisease=useCallback(()=>{setActiveDiseaseId(null);setDiseaseQueue([]);},[]);
 const revertDisease=useCallback(()=>{clearDisease();reset();},[clearDisease,reset]);
 return {...experiment,activeDiseaseId,diseaseQueue,applyDisease,clearDisease,revertDisease};
}
export function useDNAWorkspace(mode='free'){
 const value=useContext(DNAWorkspaceContext);
 if(!value)throw new Error('DNA çalışma alanı sağlayıcısı bulunamadı.');
 return value[dnaWorkspaceMode(mode)];
}
export default function DNAWorkspaceProvider({children}){
 const {state,caseEpoch=0}=useSimulation();
 const free=useExperimentWorkspace();
 const caseWorkspace=useExperimentWorkspace();
 const applied=useRef(null);
 const key=caseDNAWorkspaceKey(state,caseEpoch);
 useEffect(()=>{
  if(applied.current===key)return;applied.current=key;
  const preset=supportedCaseDNAPreset(state.scenarioConfig);
  if(preset)caseWorkspace.applyDisease(preset);else caseWorkspace.revertDisease();
 },[key,state.scenarioConfig,caseWorkspace.applyDisease,caseWorkspace.revertDisease]);
 // Both hooks stay mounted across routes. AP/deletion release timers and queued
 // preset operations complete in their own workspace even while its page is hidden.
 return <DNAWorkspaceContext.Provider value={{free,case:caseWorkspace,caseKey:key}}>{children}</DNAWorkspaceContext.Provider>;
}