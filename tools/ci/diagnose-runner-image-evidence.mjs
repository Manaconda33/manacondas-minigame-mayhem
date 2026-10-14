// Historical diagnostic only. This module never approves compatibility or restores evidence.
import {
  validationEvidenceName,
  validationToolchainFingerprint,
} from './pinned-validation-evidence.mjs';

const contractSha256 = '76e203407fddd2a350777bf2cc4dd1e683ce0afbe29edf172d8ae9a23ef95d42';
const images = ['ubuntu24/20261004.327.1', 'ubuntu24/20261012.334.1'];
const assignments = [
  ['billboard', 'b942c912510ec86312a9d0cd393d71d2eb478ea8', 0, 1],
  ['far300', 'ce6a64cf36b1f110af028536d3ff9c7a306ccbdb', 1, 0],
  ['dive', 'b49d9876f8c6ce87956f8b91675c3c8180e56b55', 0, 0],
  ['abyss-fog-004', '25ea008b15852d593681f5b3b2a17b467a193472', 0, 0],
];

const records = assignments.map(([runtimeId, sourceSha, producerIndex, consumerIndex]) => {
  const producerImage = images[producerIndex];
  const consumerImage = images[consumerIndex];
  const fingerprint = (runnerImage) =>
    validationToolchainFingerprint({
      nodeVersion: 'v22.23.3',
      npmVersion: '10.9.9',
      runnerImage,
    });
  const producerFingerprint = fingerprint(producerImage);
  const consumerFingerprint = fingerprint(consumerImage);
  const producerArtifactName = validationEvidenceName(
    runtimeId,
    sourceSha,
    contractSha256,
    producerFingerprint,
  );
  const requestedArtifactName = validationEvidenceName(
    runtimeId,
    sourceSha,
    contractSha256,
    consumerFingerprint,
  );
  return {
    runtimeId,
    sourceSha,
    producerImage,
    consumerImage,
    producerFingerprint,
    consumerFingerprint,
    producerArtifactName,
    requestedArtifactName,
    exactKeyMatches: producerArtifactName === requestedArtifactName,
  };
});

console.log(
  JSON.stringify(
    {
      purpose: 'Reproduce legacy exact artifact keys; no compatibility policy is enabled',
      assignmentsProvenance:
        'Owner supplied ImageVersion assignments; expanded hosted setup logs unavailable here',
      producerRun: 38634108940,
      consumerRun: 38638418993,
      nodeVersion: 'v22.23.3',
      npmVersion: '10.9.9',
      contractSha256,
      records,
    },
    null,
    2,
  ),
);
