#!/usr/bin/env python3
"""Verify checkpoint integrity without network requests or ref updates."""
import argparse,collections,csv,hashlib,json,os,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads((ROOT/p).read_text())
def sums(filename):
 for line in (ROOT/filename).read_text().splitlines():
  expected,name=line.split('  ',1);p=(ROOT/name).resolve()
  assert p.is_relative_to(ROOT) and p.is_file(),name
  assert digest(p)==expected,(name,'hash mismatch')
parser=argparse.ArgumentParser()
parser.add_argument('--verify-results-reconstruction',action='store_true')
opt=parser.parse_args()
sums('SOURCE-SHA256SUMS');sums('SHA256SUMS')
generator=load('methodology/generator-source.json')
assert hashlib.sha256(generator['content'].encode('utf-8')).hexdigest()==generator['source_content_sha256']
assert digest(ROOT/'inventory.tsv')=='80dc93b57b082d387b07fe6010e2ee31103e5a1ae1b0c061a9202d96e960c462'
assert digest(ROOT/'unified-c5-manifest.json')=='3f20804af31cd165ea74d4d54a67ca71d28eda278dc91aab3097127daac49ed2'
m=load('unified-c5-manifest.json');rows=m['branches']
assert len(rows)==len({r['branch'] for r in rows})==176
expected=''.join(r['branch']+'\t'+r['head_sha']+'\n' for r in sorted(rows,key=lambda r:r['branch']))
assert (ROOT/'inventory.tsv').read_text()==expected
assert dict(collections.Counter(r['classification'] for r in rows))=={'READY AFTER FINAL GATES':162,'PRESERVE FIRST':6,'RETAIN':4,'OWNER DECISION':4}
exceptions=[r for r in rows if r['classification']!='READY AFTER FINAL GATES']
assert len(exceptions)==14 and load('exceptions.json')==exceptions
flat=list(csv.DictReader((ROOT/'classification.tsv').open(),delimiter='\t'))
assert [(r['branch'],r['head_sha'],r['classification']) for r in flat]==[(r['branch'],r['head_sha'],r['classification']) for r in rows]
assert all(g['execution_authorized'] is False for g in load('retirement-sequence.json'))
s=load('checkpoint-status.json');assert s['exception_count']==14 and s['original_c5_a_classifications_unchanged'] and s['stage_c']=='PREPARED_DISABLED'
assert not s['source_branches_to_delete'] and not s['tags_to_create']
assert not any(s['owner_authorization'][k] for k in ['merge','branch_deletion','tag_creation_or_ruleset_changes','runtime_or_ci_changes','deployment','stage_c_activation'])
a=load('actions/artifact-index.json');assert len(a['records'])==13
present=0
for r in a['records']:
 if r['actual_content_accessed']:
  assert r['archive_sha256_calculated']==r['archive_sha256_expected']
  for c in r['content']:
   p=ROOT/c['path'];data=p.read_bytes()
   assert digest(p)==c['sha256'] and len(data)==c['size_bytes']
   assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==c['git_blob_sha']
   d=json.loads(data)
   if r['content_kind']=='producer-manifest':
    assert d['workflowRun']['id']==r['run_id']
    assert d['workflowRun']['sha']==r['source_workflow_commit'] and d['sourceSha']==r['runtime_source_commit']
   else:
    assert r['artifact_id']==11424851717 and d['sampleFrames']==45 and d['warmupFrames']==15 and not d['errors']
  present+=1
 else:assert r['preservation_status']=='INCOMPLETE_CONTENT_UNAVAILABLE' and not r['content'] and r['archive_sha256_calculated'] is None
assert present==a['verified_contents_included']==s['actions_contents_included']
assert 13-present==a['incomplete_contents']==s['actions_contents_unavailable']
p=load('results/provenance.json');assert digest(ROOT/'results'/p['patch_path'])==p['patch_sha256']
assert p['pr_merged'] is False and p['run_head']==p['production_merge_commit'] and p['run_conclusion']=='success'
if opt.verify_results_reconstruction:
 repo=ROOT.parents[2]
 with tempfile.TemporaryDirectory(prefix='c5b-results-index-') as tmp:
  env=os.environ.copy();env['GIT_INDEX_FILE']=str(Path(tmp)/'index')
  def git(*v):return subprocess.check_output(['git','-C',str(repo),*v],env=env,text=True).strip()
  git('merge-base','--is-ancestor',p['source_parent'],m['baseline']['main_sha'])
  git('read-tree',p['source_parent'])
  git('apply','--cached','--unidiff-zero',str(ROOT/'results'/p['patch_path']))
  for f in p['source_files']:assert git('rev-parse',':'+f['path'])==f['source_blob_sha'],f['path']
print(f'PASS: 176 records; 14 exceptions; hashes; {present} actual artifact contents; {13-present} explicitly incomplete; Results provenance; no retirement authorization.')
