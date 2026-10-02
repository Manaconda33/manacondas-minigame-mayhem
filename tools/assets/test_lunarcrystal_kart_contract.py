"""Verify real exported geometry, mounting, budgets and reproducibility."""
import hashlib
import json
import os
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest
import numpy as np

BUILDER = Path(__file__).with_name('build_lunarcrystal_kart.py')
NODES = {'KartRoot', 'Chassis', 'AccentMesh', 'SteeringWheel', 'Wheel_FL',
         'Wheel_FR', 'Wheel_RL', 'Wheel_RR', 'Exhaust_L', 'Exhaust_R',
         'DriverMount', 'ItemMountRear', 'ItemMountForward'}


class LunarcrystalKartContract(unittest.TestCase):
    def test_exported_lods_are_complete_finite_budgeted_and_reproducible(self):
        self.assertTrue(BUILDER.exists(), 'Moonlit Carriage builder is required')
        counts = []
        with tempfile.TemporaryDirectory() as folder:
            for lod, budget in [('LOD0', 25000), ('LOD1', 12000), ('LOD2', 5000)]:
                out = Path(folder) / f'{lod}.glb'
                env = dict(os.environ, LUNAR_KART_LOD=lod, LUNAR_KART_OUT=str(out),
                           LUNAR_KART_SKIP_PREVIEW='1')
                subprocess.run([sys.executable, str(BUILDER)], env=env, check=True,
                               stdout=subprocess.DEVNULL)
                data = out.read_bytes()
                self.assertEqual(struct.unpack_from('<4sII', data), (b'glTF', 2, len(data)))
                length, kind = struct.unpack_from('<I4s', data, 12)
                self.assertEqual(kind, b'JSON')
                doc = json.loads(data[20:20+length])
                binary = data[28+length:]
                self.assertEqual({n['name'] for n in doc['nodes']}, NODES)
                self.assertEqual(doc['extras']['forward'], '-Z')
                self.assertEqual(doc['extras']['lod'], lod)
                triangles = sum(doc['accessors'][p['indices']]['count']//3
                                for m in doc['meshes'] for p in m['primitives'])
                self.assertGreater(triangles, 0)
                self.assertLessEqual(triangles, budget)
                counts.append(triangles)
                for mesh in doc['meshes']:
                    for p in mesh['primitives']:
                        a = doc['accessors'][p['attributes']['POSITION']]
                        v = doc['bufferViews'][a['bufferView']]
                        positions = np.frombuffer(binary, '<f4', count=a['count']*3,
                                                  offset=v.get('byteOffset', 0))
                        self.assertTrue(np.isfinite(positions).all())
                        self.assertLess(np.abs(positions).max(), 5)
                for node in doc['nodes']:
                    if node['name'] in NODES - {'KartRoot', 'DriverMount', 'ItemMountRear', 'ItemMountForward'}:
                        self.assertIn('mesh', node)
                first = hashlib.sha256(data).hexdigest()
                subprocess.run([sys.executable, str(BUILDER)], env=env, check=True,
                               stdout=subprocess.DEVNULL)
                self.assertEqual(hashlib.sha256(out.read_bytes()).hexdigest(), first)
        self.assertGreater(counts[0], counts[1])
        self.assertGreater(counts[1], counts[2])


if __name__ == '__main__':
    unittest.main()
