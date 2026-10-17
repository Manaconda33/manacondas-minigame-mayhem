#!/usr/bin/env python3
# Historical generator, not CI tooling. Requires the separate original C5-A bundle.
import hashlib,json
from pathlib import Path
record=json.loads(Path(__file__).with_name('generator-source.json').read_text())
source=record['content'].encode('utf-8')
assert hashlib.sha256(source).hexdigest()==record['source_content_sha256']
exec(compile(source,record['original_filename'],'exec'))
