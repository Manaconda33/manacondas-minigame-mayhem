"""Artifact tests catch invalid geometry, broken mounting nodes and LOD overflow."""
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

BUILDER = Path(__file__).with_name('build_archer_kart.py')
NODES = {'KartRoot', 'Chassis', 'AccentMesh', 'SteeringWheel', 'Wheel_FL',
         'Wheel_FR', 'Wheel_RL', 'Wheel_RR', 'Exhaust_L', 'Exhaust_R',
         'DriverMount', 'ItemMountRear', 'ItemMountForward'}


class ArcherKartContract(unittest.TestCase):
    def test_wheel_faces_driver_with_column_ahead_and_clear_of_hood(self):
        import build_archer_kart as kart
        ring, _ = kart.geometry()['SteeringWheel']
        positions = ring[0].arrays()[0]
        mount = np.array(kart.TRANSLATIONS['SteeringWheel'])
        world = positions + mount
        top = world[world[:, 1] > world[:, 1].max() - 0.05]
        bottom = world[world[:, 1] < world[:, 1].min() + 0.05]
        self.assertLess(top[:, 2].mean(), bottom[:, 2].mean(),
                        'Wheel top must lean toward nose, with face toward seated driver')
        self.assertGreater(world[:, 2].min(), -0.42,
                           'Ring must clear the hood instead of being partly buried')
        column = kart.geometry()['SteeringWheel'][1][0].arrays()[0] + mount
        self.assertLess(column[:, 2].min(), mount[2] - 0.4,
                        'Steering shaft base belongs ahead of wheel, away from driver')
        self.assertLess(column[:, 1].min(), 0.65, 'Column must reach structural support')

    def test_real_lods_are_valid_mounted_geometry_and_reproducible(self):
        self.assertTrue(BUILDER.exists(), 'Archer builder is required')
        counts = []
        with tempfile.TemporaryDirectory() as folder:
            for lod, budget in [('LOD0', 25000), ('LOD1', 12000), ('LOD2', 5000)]:
                target = Path(folder) / f'{lod}.glb'
                env = dict(os.environ, ARCHER_KART_LOD=lod,
                           ARCHER_KART_OUT=str(target), ARCHER_KART_SKIP_PREVIEW='1')
                subprocess.run([sys.executable, str(BUILDER)], env=env, check=True,
                               stdout=subprocess.DEVNULL)
                data = target.read_bytes()
                self.assertEqual(struct.unpack_from('<4sII', data), (b'glTF', 2, len(data)))
                length, kind = struct.unpack_from('<I4s', data, 12)
                self.assertEqual(kind, b'JSON')
                doc = json.loads(data[20:20+length])
                binary = data[28+length:]
                self.assertEqual({n['name'] for n in doc['nodes']}, NODES)
                self.assertEqual(len(doc['nodes']), 13)
                self.assertEqual(len(doc['materials']), 4)
                self.assertEqual(doc['extras']['forward'], '-Z')
                self.assertEqual(doc['extras']['lod'], lod)
                count = sum(doc['accessors'][p['indices']]['count']//3
                            for mesh in doc['meshes'] for p in mesh['primitives'])
                self.assertGreater(count, 0)
                self.assertLessEqual(count, budget)
                counts.append(count)
                for mesh in doc['meshes']:
                    for primitive in mesh['primitives']:
                        a = doc['accessors'][primitive['attributes']['POSITION']]
                        v = doc['bufferViews'][a['bufferView']]
                        pos = np.frombuffer(binary, '<f4', count=a['count']*3,
                                            offset=v.get('byteOffset', 0))
                        self.assertTrue(np.isfinite(pos).all())
                        self.assertLess(np.abs(pos).max(), 5)
                for node in doc['nodes']:
                    if node['name'] in {'SteeringWheel', 'Wheel_FL', 'Wheel_FR',
                                        'Wheel_RL', 'Wheel_RR', 'Exhaust_L', 'Exhaust_R'}:
                        self.assertIn('mesh', node)
                before = hashlib.sha256(data).hexdigest()
                subprocess.run([sys.executable, str(BUILDER)], env=env, check=True,
                               stdout=subprocess.DEVNULL)
                self.assertEqual(hashlib.sha256(target.read_bytes()).hexdigest(), before)
        self.assertGreater(counts[0], counts[1])
        self.assertGreater(counts[1], counts[2])


if __name__ == '__main__':
    unittest.main()
