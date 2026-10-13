import { readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const groups = {
  landing: ['LandingPage','HeroSearch','HeroMotionBanner','SpecialtiesGrid','FeaturedDoctors','TelemedicineShowcase','NationalNetworkPillars','PatientStoriesAndEvidence','FAQSection','ClinicalCarePathway'],
  directory: ['DoctorSearchDirectory','MedicalCentersDirectory','BookingModal'],
  registry: ['CancerRegistryForm'],
  telemedicine: ['TelemedicineRoom'],
  'tumor-board': ['TumorBoardModal'],
  screening: ['InteractiveSymptomScreening','SymptomScreeningForm','EmergencyModal'],
  education: ['CancerEducationArticles','CategoryDetailView'],
  ai: ['AISurvivalAnalysis','AIAssistantWidget'],
  'legacy-dashboards': ['PatientPortal','DoctorDashboard','NationalDashboard','TreatmentProgressWidget','MedicationTrackerSection','MedicalReportModal'],
  governance: ['SecurityComplianceShowcase'],
};
const moves = new Map();
for (const [feature, names] of Object.entries(groups)) for (const name of names) {
  const from = path.resolve(root, 'src/components', `${name}.tsx`);
  const to = path.resolve(root, 'src/features', feature, 'components', `${name}.tsx`);
  if (!to.startsWith(root + path.sep) || !from.startsWith(root + path.sep)) throw new Error('Outside workspace');
  if (existsSync(from)) moves.set(from,to);
}
const files = [];
function walk(dir) { for (const item of readdirSync(dir,{withFileTypes:true})) { const file=path.join(dir,item.name); if(item.isDirectory())walk(file);else if(/\.(tsx?|css)$/.test(file)) files.push(file); } }
walk(path.join(root,'src'));
// Agent-owned entry components are intentionally untouched; their imports remain stable.
const owned = new Set(['Header','AuthPage','AuthModal','RoleProfileManager']);
for (const file of files) {
  if (owned.has(path.basename(file,'.tsx')) && path.dirname(file)===path.join(root,'src/components')) continue;
  const destination = moves.get(file) || file;
  const original = readFileSync(file,'utf8');
  const rewritten = original.replace(/(from\s+|import\s*\()(['"])(\.[^'"]+)\2/g,(full,prefix,quote,spec)=>{
    let target = path.resolve(path.dirname(file),spec);
    for(const ext of ['', '.tsx','.ts','/index.ts']) if(moves.has(target+ext)||existsSync(target+ext)){target+=ext;break;}
    const newTarget=moves.get(target)||target;
    let relative=path.relative(path.dirname(destination),newTarget).replaceAll('\\','/').replace(/\.(tsx?|css)$/,'');
    if(!relative.startsWith('.')) relative='./'+relative;
    return prefix+quote+relative+quote;
  });
  if (moves.has(file)) {mkdirSync(path.dirname(destination),{recursive:true});renameSync(file,destination);}
  if(rewritten!==original) writeFileSync(destination,rewritten);
}
console.log(`Organized ${moves.size} components into domain features.`);
