import { PrismaticSystem, PRISMATIC } from './items/PrismaticSystem';
import { PrismaticVisual } from './items/PrismaticVisual';
import { PrismaticMusic } from '../audio/PrismaticMusic';
import { PrismaticCounterFixture, prismaticTestFromSearch } from './items/PrismaticCounterFixture';
import { observeAiHazards } from './ai/AiHazardAwareness';
import { AiHazardFixture, aiHazardTestFromSearch } from './ai/AiHazardFixture';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Howler } from 'howler';
import { HazardSystem } from './items/HazardSystem';
import { ShockwaveSystem } from './items/ShockwaveSystem';
import { ShockwaveCounterFixture } from './items/ShockwaveCounterFixture';
import { ItemPhysicsCapacity } from './items/ItemPhysicsCapacity';
import { SlickGroundSurface } from './items/SlickGroundSurface';
import { IncomingSlickFixture } from './items/IncomingSlickFixture';
import { IncomingBlastOrbFixture } from './items/IncomingBlastOrbFixture';
import { ApexMissileSystem, type ApexWarning } from './items/ApexMissileSystem';
import { ApexPresentation } from './items/ApexPresentation';
import { IncomingApexFixture } from './items/IncomingApexFixture';
import { SeekerWarningAudio, APEX_WARNING_TONE } from '../audio/SeekerWarningAudio';
import { IncomingSeekerFixture } from './items/IncomingSeekerFixture';
import { nearestRacerAhead, targetingProgressSnapshot } from './items/ItemTargeting';
import {
  seekerThreats,
  SeekerWarningVisual,
  type SeekerWarningLevel,
} from './items/SeekerWarnings';
import { playDriftTierTone } from '../audio/driftTone';
import { createKartTuning, type SurfaceType } from '../config/kartTuning';
import { AiDriver } from './ai/AiDriver';
import { ChaseCamera } from './camera/ChaseCamera';
import { SpinoutCameraAnchor } from './camera/SpinoutCameraAnchor';
import { FixedStepRunner } from './physics/FixedStepRunner';
import { KartController, type DriveInput } from './physics/KartController';
import type { DriftTier } from './physics/KartController';
import { collisionImpulseShares, collisionSpeedRetention } from './physics/KartCollision';
import { LapTracker } from './race/LapTracker';
import { RaceDirector, rankRacers, type RacerProgress } from './race/RaceDirector';
import { CircuitAlpha } from './track/CircuitAlpha';
import { createTrackScene } from './track/createTrackScene';
import {
  GUARDRAIL_KART_RADIUS_METERS,
  GUARDRAIL_RESTITUTION,
  GUARDRAIL_TANGENTIAL_RETENTION,
  guardrailContact,
} from './track/GuardrailSystem';
import { ItemBoxSystem } from './items/ItemBoxSystem';
import { ProjectileSystem } from './items/ProjectileSystem';
import { executeItemUse } from './items/ItemEffectDispatcher';
import { selectItem } from './items/ItemSelector';
import {
  forcedItemForRacer,
  forcedItemFromSearch,
  incomingSeekerFromSearch,
  incomingApexFromSearch,
  incomingBlastOrbFromSearch,
  incomingSlickFromSearch,
  shockwaveCounterFromSearch,
} from './items/ItemTestMode';
import { NitroSurgeVisual } from './items/NitroSurgeVisual';
import { RacerEffects } from './items/RacerEffects';
import {
  ItemSystem,
  isItemUseKey,
  itemUseDirection,
  type ItemHudSnapshot,
} from './items/ItemSystem';
import { ITEM_DEFINITIONS, type RaceRank } from './items/itemDefinitions';
import { characterManifest, type CharacterDefinition } from '../characters/manifest';
import { selectAiRoster } from '../characters/raceRoster';
import { normalizeMinimapTrack, type MinimapState } from './ui/Minimap';
import {
  driverFrameFallbacks,
  driverSpritePosition,
  isDriverFrontFacingCamera,
  modeledSteeringControlPosition,
  selectDriverFrame,
  shouldShowModeledSteeringControl,
  type DriverFrame,
} from './driver/DriverSpriteState';

export interface HudState {
  lap: number;
  speedKph: number;
  elapsed: number;
  surface: SurfaceType;
  wrongWay: boolean;
  fps: number;
  frameMs: number;
  finished: boolean;
  driftTier: DriftTier;
  driftCharge: number;
  boostActive: boolean;
  activeBoostLabel: string | null;
  airborne: boolean;
  position: number;
  countdown: string;
  minimap: MinimapState;
  item: ItemHudSnapshot;
  testModeItemLabel: string | null;
  seekerWarning: SeekerWarningLevel | null;
  apexWarning: ApexWarning | null;
  itemUseMessage: string | null;
  prismaticSeconds: number;
}

export interface RaceResult {
  time: number;
  place: number;
  standings: { name: string; place: number | null; time: number | null }[];
}

export interface TimeTrialOptions {
  canvas: HTMLCanvasElement;
  character: CharacterDefinition;
  onHud: (state: HudState) => void;
  onFinish: (result: RaceResult) => void;
}

interface AiRacer {
  id: string;
  name: string;
  portrait: string;
  controller: KartController;
  driver: AiDriver;
  mesh: THREE.Group;
  driverVisual: DriverSpriteVisual | null;
  driverHitSeconds: number;
  steering: number;
  lapTracker: LapTracker;
  progress: RacerProgress;
  lastCheckpointOverlap: number;
  recoveryCooldown: number;
}

interface DriverSpriteVisual {
  character: CharacterDefinition;
  sprite: THREE.Sprite;
  textures: Map<DriverFrame, THREE.Texture>;
  activeFrame: DriverFrame;
  modeledSteeringControl: THREE.Object3D | null;
  modeledSteeringControlDefaultPosition: readonly [number, number, number] | null;
}

interface OpponentVisual {
  group: THREE.Group;
  driverVisual: DriverSpriteVisual | null;
}

export class KartTimeTrial {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly track = new CircuitAlpha();
  private readonly trackScene = createTrackScene(this.track);
  private readonly slickGround = new SlickGroundSurface(this.trackScene);
  private readonly trackLength = this.track.curve.getLength();
  private readonly minimapTrack = normalizeMinimapTrack(this.track.samples);
  private readonly lapTracker = new LapTracker();
  private readonly raceDirector = new RaceDirector();
  private readonly fixedStep = new FixedStepRunner();
  private readonly pressed = new Set<string>();
  private readonly kartMesh = new THREE.Group();
  private readonly driftLights: THREE.Mesh[] = [];
  private readonly kart: KartController;
  private readonly opponents: AiRacer[] = [];
  private readonly chaseCamera: ChaseCamera;
  private readonly spinoutCameraAnchor = new SpinoutCameraAnchor();
  private readonly position = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly world: RAPIER.World;
  private animationFrame = 0;
  private lastFrame = performance.now();
  private elapsed = 0;
  private paused = false;
  private lastCheckpointOverlap = -1;
  private lastRecoveryIndex = 0;
  private wrongWaySeconds = 0;
  private outOfBoundsSeconds = 0;
  private fpsAccumulator = 0;
  private fpsFrames = 0;
  private fps = 60;
  private lastToneTier: DriftTier = 'none';
  private readonly touchPressed = new Set<string>();
  private playerDriverVisual: DriverSpriteVisual | null = null;
  private driverHitSeconds = 0;
  private playerSteering = 0;
  private rearViewActive = false;
  private readonly playerProgress: RacerProgress = {
    id: 'player',
    lap: 0,
    trackProgress: 0,
    finished: false,
    finishTime: null,
    finishPlace: null,
  };
  private finishReported = false;
  private readonly contactCooldowns = new Map<string, number>();
  private readonly guardrailContactCooldowns = new Map<string, number>();
  private readonly itemBoxes: ItemBoxSystem;
  private readonly itemSystem = new ItemSystem();
  private readonly racerEffects = new RacerEffects();
  private readonly prismatic = new PrismaticSystem(this.racerEffects);
  private readonly prismaticVisual = new PrismaticVisual();
  private readonly prismaticMusic = new PrismaticMusic();
  private readonly prismaticContactVictims: string[] = [];
  private prismaticFixtureContact: string | null = null;
  private readonly prismaticFixture = new PrismaticCounterFixture(
    prismaticTestFromSearch(window.location.search),
  );
  private readonly forcedTestItem = forcedItemFromSearch(window.location.search);
  private readonly nitroSurgeVisual = new NitroSurgeVisual();
  private readonly shockwave = new ShockwaveSystem(
    (position) => this.slickGround.at(position),
    (ownerId) =>
      ownerId === 'player'
        ? this.kart.position()
        : this.opponents.find((opponent) => opponent.id === ownerId)?.controller.position(),
  );
  private readonly shockwaveCounterTest = shockwaveCounterFromSearch(window.location.search);
  private readonly shockwaveCounterFixture = new ShockwaveCounterFixture(this.shockwaveCounterTest);
  private readonly itemPhysicsCapacity = new ItemPhysicsCapacity();
  private readonly projectiles = new ProjectileSystem(this.track, this.itemPhysicsCapacity);
  private readonly hazards = new HazardSystem(this.track, this.itemPhysicsCapacity, (position) =>
    this.slickGround.at(position),
  );
  private readonly aiHazardFixture = new AiHazardFixture(
    aiHazardTestFromSearch(window.location.search),
  );
  private readonly incomingSlickTest = incomingSlickFromSearch(window.location.search);
  private readonly incomingSlickFixture = new IncomingSlickFixture(this.incomingSlickTest);
  private readonly incomingBlastTest = incomingBlastOrbFromSearch(window.location.search);
  private readonly incomingBlastFixture = new IncomingBlastOrbFixture(this.incomingBlastTest);
  private readonly incomingSeekerTest = incomingSeekerFromSearch(window.location.search);
  private readonly incomingSeekerFixture = new IncomingSeekerFixture(this.incomingSeekerTest);
  private readonly seekerWarningVisual = new SeekerWarningVisual();
  private readonly seekerWarningAudio = new SeekerWarningAudio();
  private seekerWarning: SeekerWarningLevel | null = null;
  private itemUseMessage: string | null = null;
  private itemUseMessageSeconds = 0;
  private readonly apex = new ApexMissileSystem(this.track, this.projectiles);
  private readonly apexPresentation = new ApexPresentation();
  private readonly incomingApexTest = incomingApexFromSearch(window.location.search);
  private readonly incomingApexFixture = new IncomingApexFixture(this.incomingApexTest);
  private readonly apexWarningAudio = new SeekerWarningAudio(undefined, APEX_WARNING_TONE);

  public static async create(options: TimeTrialOptions): Promise<KartTimeTrial> {
    await RAPIER.init();
    const game = new KartTimeTrial(options);
    await game.createKartVisual();
    return game;
  }

  private constructor(private readonly options: TimeTrialOptions) {
    this.renderer = new THREE.WebGLRenderer({ canvas: options.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(0x8f718f);
    this.scene.fog = new THREE.Fog(0x9b7d97, 180, 650);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
    this.chaseCamera = new ChaseCamera(this.camera);
    this.scene.add(this.trackScene);
    this.itemBoxes = new ItemBoxSystem(this.track);
    this.scene.add(this.itemBoxes.group);
    this.scene.add(
      this.projectiles.group,
      this.hazards.group,
      this.shockwave.group,
      this.prismaticVisual.group,
      this.prismaticFixture.group,
      this.seekerWarningVisual.group,
      this.apexPresentation.group,
    );
    this.kartMesh.add(this.nitroSurgeVisual.group);
    this.scene.add(new THREE.HemisphereLight(0xcbb7ff, 0x263822, 2.1));
    const sun = new THREE.DirectionalLight(0xffe8c5, 2.4);
    sun.position.set(-120, 180, -80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -340;
    sun.shadow.camera.right = 340;
    sun.shadow.camera.top = 340;
    sun.shadow.camera.bottom = -340;
    this.scene.add(sun);

    this.world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    this.world.timestep = 1 / 60;
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0).setFriction(1),
    );

    const spawn = this.track
      .checkpointPosition(0)
      .addScaledVector(this.track.checkpointTangent(0), 8);
    const spawnTangent = this.track.checkpointTangent(0);
    const yaw = Math.atan2(spawnTangent.x, spawnTangent.z);
    this.kart = new KartController(
      this.world,
      createKartTuning(options.character.stats),
      options.character.stats,
      spawn,
      yaw,
    );
    this.createOpponents(spawn, spawnTangent, yaw);
    this.lapTracker.reset(0);
    this.bindEvents();
    this.resize();
  }

  public start(): void {
    this.lastFrame = performance.now();
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.resize);
    this.itemBoxes.dispose();
    this.itemSystem.dispose();
    this.racerEffects.dispose();
    this.apex.dispose();
    this.apexPresentation.dispose();
    this.apexWarningAudio.dispose();
    this.aiHazardFixture.reset();
    for (const opponent of this.opponents) opponent.driver.reset();
    this.hazards.dispose();
    this.slickGround.dispose();
    this.projectiles.dispose();
    this.shockwaveCounterFixture.reset();
    this.shockwave.dispose();
    this.prismatic.dispose();
    this.prismaticVisual.dispose();
    this.prismaticFixture.dispose();
    this.prismaticMusic.dispose();
    this.seekerWarningVisual.dispose();
    this.seekerWarningAudio.dispose();
    this.spinoutCameraAnchor.clear();
    this.nitroSurgeVisual.dispose();
    this.renderer.dispose();
  }

  public setTouchControl(control: string, pressed: boolean): void {
    if (pressed) {
      void this.seekerWarningAudio.unlock();
      void this.apexWarningAudio.unlock();
      void this.prismaticMusic.unlock();
    }
    if (pressed) this.touchPressed.add(control);
    else this.touchPressed.delete(control);
    if (control === 'recover' && pressed) this.respawn();
    if (control === 'item' && pressed) this.requestPlayerItemUse();
  }

  private readonly frame = (now: number): void => {
    const frameSeconds = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    if (!this.paused) {
      this.fixedStep.advance(frameSeconds, this.simulate);
      this.elapsed = this.raceDirector.raceTime();
    }

    this.updateVisuals(frameSeconds);
    this.renderer.render(this.scene, this.camera);
    this.updateHud(frameSeconds);
    this.animationFrame = requestAnimationFrame(this.frame);
  };

  private readonly simulate = (dt: number): void => {
    this.raceDirector.advance(dt);
    if (this.raceDirector.phase(this.playerProgress.finished) === 'countdown') {
      this.world.step();
      return;
    }
    const position = this.kart.position(this.position);
    const projection = this.track.project(position);
    const driveModifiers = this.racerEffects.driveModifiers('player');
    const playerSpinout = this.racerEffects.spinoutState('player');
    const input: DriveInput = {
      throttle:
        this.isPressed('KeyW', 'ArrowUp') || this.touchPressed.has('accelerate')
          ? 1
          : this.isPressed('KeyS', 'ArrowDown') || this.touchPressed.has('brake')
            ? -1
            : 0,
      steering:
        this.isPressed('KeyA', 'ArrowLeft') || this.touchPressed.has('left')
          ? 1
          : this.isPressed('KeyD', 'ArrowRight') || this.touchPressed.has('right')
            ? -1
            : 0,
      brake: false,
      drift: this.isPressed('Space') || this.touchPressed.has('drift'),
      effectSpeedCapMultiplier: driveModifiers.speedCapMultiplier,
      effectAccelerationMultiplier: driveModifiers.accelerationMultiplier,
      ignoreOffRoadSpeedPenalty: driveModifiers.ignoreOffRoadSpeedPenalty,
      ignoreOffRoadAccelerationPenalty: driveModifiers.ignoreOffRoadAccelerationPenalty,
      effectSpinoutYawRateRadiansPerSecond: playerSpinout?.yawRateRadiansPerSecond,
      effectSpinoutPreserveMomentum: playerSpinout?.preserveMomentum,
    };
    this.playerSteering = playerSpinout === null ? input.steering : 0;
    this.driverHitSeconds = Math.max(0, this.driverHitSeconds - dt);

    this.kart.update(input, projection.surface, dt);
    this.updateOpponents(dt);
    this.world.step();
    this.resolveKartContacts(dt);
    this.resolveGuardrailContacts(dt);

    if (!this.kart.isFinite()) {
      this.respawn();
      return;
    }

    const forwardDot = this.kart.forward(this.forward).dot(projection.tangent);
    this.wrongWaySeconds = forwardDot < -0.35 ? this.wrongWaySeconds + dt : 0;
    this.outOfBoundsSeconds = projection.lateralDistance > 34 ? this.outOfBoundsSeconds + dt : 0;

    if (projection.lateralDistance < 10) this.lastRecoveryIndex = projection.index;
    if (this.outOfBoundsSeconds > 1 || position.y < -3) this.respawn();

    const checkpoint = this.nearestCheckpoint(position);
    if (checkpoint !== -1 && checkpoint !== this.lastCheckpointOverlap) {
      const accepted = this.lapTracker.enterCheckpoint(checkpoint, forwardDot, this.elapsed);
      if (accepted && checkpoint !== 0) {
        this.lastRecoveryIndex = this.track.checkpointIndices[checkpoint] ?? projection.index;
      }
      if (this.lapTracker.snapshot().finished)
        this.raceDirector.registerFinish(this.playerProgress);
    }
    this.lastCheckpointOverlap = checkpoint;
    const snapshot = this.lapTracker.snapshot();
    this.playerProgress.lap = snapshot.lap;
    this.playerProgress.trackProgress =
      snapshot.lap === 0 && snapshot.nextCheckpoint === 1 && projection.progress > 0.8
        ? 0
        : projection.progress;
    this.itemSystem.advance(dt);
    this.racerEffects.advance(dt, false, false);
    this.shockwave.advance(dt);
    this.incomingSeekerFixture.update(
      this.elapsed,
      this.playerProgress.finished,
      this.kart.position(),
      this.track,
      this.projectiles,
    );
    this.updateProjectiles(dt);
    // Protection uses the start-of-step state for drive, contact, and item impacts.
    // Advance its clock only after all three consumers; the next step sees expiry.
    this.racerEffects.advanceProtection(dt);
    if (this.playerProgress.finished) this.prismatic.clear('player');
    this.itemUseMessageSeconds = Math.max(0, this.itemUseMessageSeconds - dt);
    if (this.itemUseMessageSeconds === 0) this.itemUseMessage = null;
    this.updateItemBoxes(dt);
    if (this.playerProgress.finished && !this.finishReported) {
      this.finishReported = true;
      const standings = this.currentStandings();
      this.options.onFinish({
        time: this.playerProgress.finishTime ?? this.elapsed,
        place:
          this.playerProgress.finishPlace ?? standings.findIndex(({ id }) => id === 'player') + 1,
        standings: standings.map((racer) => ({
          name:
            racer.id === 'player'
              ? 'YOU'
              : (this.opponents.find(({ id }) => id === racer.id)?.name ?? racer.id),
          place: racer.finishPlace,
          time: racer.finishTime,
        })),
      });
    }
  };

  private nearestCheckpoint(position: THREE.Vector3): number {
    for (let index = 0; index < this.track.checkpointIndices.length; index += 1) {
      if (position.distanceToSquared(this.track.lapCheckpointPosition(index)) < 13 * 13)
        return index;
    }
    return -1;
  }

  private updateOpponents(dt: number): void {
    const hazardAwareness = observeAiHazards(this.track, this.hazards.activeSnapshots());
    const playerTotal = this.playerProgress.lap + this.playerProgress.trackProgress;
    const observeRacer = (id: string, controller: KartController) => {
      const position = controller.position();
      return {
        id,
        position,
        speed: controller.speedMetersPerSecond(),
        lateralOffset: this.track.project(position).lateralOffset,
      };
    };
    const racerAwareness = [
      observeRacer('player', this.kart),
      ...this.opponents.map(({ id, controller }) => observeRacer(id, controller)),
    ];
    for (const opponent of this.opponents) {
      opponent.recoveryCooldown = Math.max(0, opponent.recoveryCooldown - dt);
      opponent.driverHitSeconds = Math.max(0, opponent.driverHitSeconds - dt);
      const position = opponent.controller.position();
      const projection = this.track.project(position);
      const snapshot = opponent.lapTracker.snapshot();
      const opponentTotal = snapshot.lap + projection.progress;
      const spinout = this.racerEffects.spinoutState(opponent.id);
      const input: DriveInput =
        spinout !== null
          ? {
              throttle: 0,
              steering: 0,
              brake: false,
              drift: false,
              effectSpinoutYawRateRadiansPerSecond: spinout.yawRateRadiansPerSecond,
              effectSpinoutPreserveMomentum: spinout.preserveMomentum,
            }
          : opponent.progress.finished
            ? { throttle: 0, steering: 0, brake: true, drift: false }
            : opponent.driver.input(
                position,
                opponent.controller.forward(),
                opponent.controller.speedMetersPerSecond(),
                playerTotal - opponentTotal,
                racerAwareness.filter(({ id }) => id !== opponent.id),
                dt,
                hazardAwareness,
                opponent.id,
              );
      opponent.steering = spinout === null ? input.steering : 0;
      if (this.prismaticFixture.controlledRacer() === opponent.id) {
        input.throttle = 0;
        input.steering = 0;
        input.brake = false;
        input.drift = false;
      }
      opponent.controller.update(input, projection.surface, dt);

      const checkpoint = this.nearestCheckpoint(position);
      if (checkpoint !== -1 && checkpoint !== opponent.lastCheckpointOverlap) {
        const forwardDot = opponent.controller.forward().dot(projection.tangent);
        opponent.lapTracker.enterCheckpoint(checkpoint, forwardDot, this.raceDirector.raceTime());
      }
      opponent.lastCheckpointOverlap = checkpoint;
      const nextSnapshot = opponent.lapTracker.snapshot();
      opponent.progress.lap = nextSnapshot.lap;
      opponent.progress.trackProgress =
        nextSnapshot.lap === 0 && nextSnapshot.nextCheckpoint === 1 && projection.progress > 0.8
          ? 0
          : projection.progress;
      if (nextSnapshot.finished) {
        this.raceDirector.registerFinish(opponent.progress);
        this.prismatic.clear(opponent.id);
      }

      if ((projection.lateralDistance > 20 || position.y < -2) && opponent.recoveryCooldown === 0) {
        const tangent = projection.tangent;
        this.prismatic.clear(opponent.id);
        opponent.controller.respawn(
          projection.point.clone().addScaledVector(tangent, 3),
          Math.atan2(tangent.x, tangent.z),
        );
        opponent.recoveryCooldown = 1.5;
      }
    }
  }

  private resolveKartContacts(dt: number): void {
    const targets = this.projectileTargets();
    const victims = this.prismatic.contacts(targets);
    this.prismaticContactVictims.push(...victims);
    const fixtureRacer = this.prismaticFixture.controlledRacer();
    const fixtureTarget = targets.find((r) => r.id === fixtureRacer);
    const player = targets[0];
    if (
      fixtureTarget &&
      !fixtureTarget.finished &&
      player &&
      !player.finished &&
      player.position.clone().sub(fixtureTarget.position).setY(0).length() < PRISMATIC.contactRadius
    ) {
      this.prismaticFixtureContact = fixtureTarget.id;
    }

    for (const [key, remaining] of this.contactCooldowns) {
      const next = remaining - dt;
      if (next <= 0) this.contactCooldowns.delete(key);
      else this.contactCooldowns.set(key, next);
    }

    const racers = [
      { id: 'player', controller: this.kart },
      ...this.opponents.map(({ id, controller }) => ({ id, controller })),
    ];
    for (let first = 0; first < racers.length; first += 1) {
      for (let second = first + 1; second < racers.length; second += 1) {
        const a = racers[first];
        const b = racers[second];
        if (a === undefined || b === undefined) continue;
        const key = `${a.id}:${b.id}`;
        if (this.contactCooldowns.has(key)) continue;
        const delta = a.controller.position().sub(b.controller.position()).setY(0);
        if (delta.lengthSq() >= 2.35 * 2.35 || delta.lengthSq() < 0.001) continue;
        const direction = delta.normalize();
        const relativeVelocity = a.controller.velocity().sub(b.controller.velocity());
        const closingSpeed = Math.max(0, -relativeVelocity.dot(direction));
        const impulses = collisionImpulseShares(a.controller.mass(), b.controller.mass(), 55);
        a.controller.applyArcadeCollisionImpulse(direction, impulses.first);
        b.controller.applyArcadeCollisionImpulse(
          direction.clone().multiplyScalar(-1),
          impulses.second,
        );
        a.controller.applyCollisionSpeedRetention(
          collisionSpeedRetention(a.controller.weight(), b.controller.weight(), closingSpeed),
        );
        b.controller.applyCollisionSpeedRetention(
          collisionSpeedRetention(b.controller.weight(), a.controller.weight(), closingSpeed),
        );
        this.activateDriverHit(a.id);
        this.activateDriverHit(b.id);
        this.contactCooldowns.set(key, 0.18);
      }
    }
  }

  private activateDriverHit(racerId: string, seconds = 0.32): void {
    if (racerId === 'player') {
      this.driverHitSeconds = Math.max(this.driverHitSeconds, seconds);
      return;
    }
    const opponent = this.opponents.find(({ id }) => id === racerId);
    if (opponent !== undefined)
      opponent.driverHitSeconds = Math.max(opponent.driverHitSeconds, seconds);
  }

  private resolveGuardrailContacts(dt: number): void {
    for (const [racerId, remaining] of this.guardrailContactCooldowns) {
      const next = remaining - dt;
      if (next <= 0) this.guardrailContactCooldowns.delete(racerId);
      else this.guardrailContactCooldowns.set(racerId, next);
    }

    const racers = [
      { id: 'player', controller: this.kart },
      ...this.opponents.map(({ id, controller }) => ({ id, controller })),
    ];
    for (const racer of racers) {
      const contact = guardrailContact(
        this.track,
        racer.controller.position(),
        GUARDRAIL_KART_RADIUS_METERS,
      );
      if (contact === null) continue;

      const outwardSpeed = Math.max(0, -racer.controller.velocity().dot(contact.inwardNormal));
      racer.controller.resolveStaticBarrierCollision(
        contact.inwardNormal,
        contact.penetration + 0.02,
        this.guardrailContactCooldowns.has(racer.id) ? 1 : GUARDRAIL_TANGENTIAL_RETENTION,
        GUARDRAIL_RESTITUTION,
      );
      if (outwardSpeed > 1.5 && !this.guardrailContactCooldowns.has(racer.id)) {
        this.activateDriverHit(racer.id, 0.28);
      }
      if (!this.guardrailContactCooldowns.has(racer.id)) {
        this.guardrailContactCooldowns.set(racer.id, 0.24);
      }
    }
  }

  private projectileTargets() {
    return [
      {
        id: 'player',
        position: this.kart.position(),
        velocity: this.kart.velocity(),
        forward: this.kart.forward(),
        finished: this.playerProgress.finished,
        itemImmune: this.racerEffects.isItemImmune('player'),
        onItemContact: (
          itemId: import('./items/itemDefinitions').ItemId,
          blocked: boolean,
          objectId?: number,
        ) => {
          if (blocked) this.prismaticVisual.blocked();
          this.prismaticFixture.observe(itemId, blocked, 'player', objectId);
        },
      },
      ...this.opponents.map((opponent) => ({
        id: opponent.id,
        position: opponent.controller.position(),
        velocity: opponent.controller.velocity(),
        forward: opponent.controller.forward(),
        finished: opponent.progress.finished,
        itemImmune: this.racerEffects.isItemImmune(opponent.id),
      })),
    ];
  }

  private updateProjectiles(dt: number): void {
    const applied = new Set<string>();
    for (const id of this.prismaticContactVictims.splice(0)) {
      if (this.applyItemSpin(id, 'prismatic-invincibility', PRISMATIC.spinoutSeconds, 1))
        applied.add(id);
    }
    if (this.prismaticFixtureContact !== null) {
      const id = this.prismaticFixtureContact;
      // Verify the committed effect, not merely the planned contact victim.
      const spun = this.prismaticFixture.test?.expired
        ? this.racerEffects.spinoutState(id) !== null
        : applied.has(id);
      this.prismaticFixture.observe('prismatic-invincibility', !spun, id);
      this.prismaticFixtureContact = null;
    }
    let targets = this.projectileTargets();
    const racers = this.itemTargetingProgress();
    const playerItem = this.itemSystem.hudSnapshot('player');
    this.prismaticFixture.update(dt, {
      position: this.kart.position(),
      speed: this.kart.speedMetersPerSecond(),
      finished: this.playerProgress.finished,
      held: playerItem.phase === 'held' && playerItem.itemId === PRISMATIC.id,
      remaining: this.prismatic.remaining('player'),
      track: this.track,
      racers,
      projectiles: this.projectiles,
      hazards: this.hazards,
      apex: this.apex,
      shockwave: this.shockwave,
      placeRacer: (position, forward) => {
        const opponent = this.opponents.find((r) => !r.progress.finished);
        if (!opponent) return null;
        opponent.controller.respawn(position, Math.atan2(forward.x, forward.z));
        opponent.controller.addPlanarVelocityDelta(forward.clone().multiplyScalar(6));
        return opponent.id;
      },
    });
    this.shockwaveCounterFixture.update(
      this.playerProgress.finished,
      playerItem.phase === 'held' && playerItem.itemId === 'shockwave',
      this.kart.position(),
      this.track,
      this.projectiles,
      this.hazards,
      this.apex,
      racers,
      targets,
    );
    for (const pulse of this.shockwave.drainPulses()) {
      const pushes = this.shockwave.dispatch(pulse, {
        projectileSystem: this.projectiles,
        hazardSystem: this.hazards,
        apexSystem: this.apex,
        targets,
      });
      for (const push of pushes) {
        const controller =
          push.targetId === 'player'
            ? this.kart
            : this.opponents.find((opponent) => opponent.id === push.targetId)?.controller;
        controller?.addPlanarVelocityDelta(push.velocityDelta);
      }
    }
    // Shockwave changes racer velocity before projectile/hazard processing; refresh
    // detached target snapshots so same-step guidance/contact sees that new velocity.
    targets = this.projectileTargets();
    const impacts = [
      ...this.projectiles.update(dt, targets),
      ...this.apex.update(dt, racers, targets),
      ...this.hazards.update(dt, targets),
    ];
    this.incomingApexFixture.update(this.elapsed, this.track, this.apex, racers, targets);
    this.incomingBlastFixture.update(
      this.elapsed,
      this.playerProgress.finished,
      this.kart.position(),
      this.track,
      this.hazards,
    );
    this.incomingSlickFixture.update(
      this.elapsed,
      this.playerProgress.finished,
      this.kart.position(),
      this.track,
      this.hazards,
    );
    this.aiHazardFixture.update(
      this.elapsed,
      this.opponents.map((opponent) => ({
        id: opponent.id,
        name: opponent.name,
        position: opponent.controller.position(),
        finished: opponent.progress.finished,
      })),
      this.track,
      this.hazards,
    );
    for (const impact of impacts) {
      const definition = ITEM_DEFINITIONS[impact.itemId];
      const activated = this.racerEffects.activateSpinout(impact.targetId, {
        id: `${impact.itemId}-spinout`,
        label: definition.displayName,
        durationSeconds: impact.spinoutSeconds,
        direction: impact.spinDirection,
        turns: 1,
        preserveMomentum: impact.preserveSpinMomentum,
      });
      if (!activated) continue;
      if (impact.planarSpeedRetention !== undefined) {
        const controller =
          impact.targetId === 'player'
            ? this.kart
            : this.opponents.find((opponent) => opponent.id === impact.targetId)?.controller;
        controller?.retainPlanarVelocity(impact.planarSpeedRetention);
      }
      this.activateDriverHit(impact.targetId, impact.spinoutSeconds);
      if (impact.targetId === 'player') {
        this.spinoutCameraAnchor.capture(this.kart.forward(), this.kart.velocity());
      }
    }
  }

  private applyItemSpin(
    targetId: string,
    itemId: import('./items/itemDefinitions').ItemId,
    duration: number,
    direction: -1 | 1,
  ): boolean {
    const target = this.projectileTargets().find((racer) => racer.id === targetId);
    if (!target || target.finished || this.racerEffects.isItemImmune(targetId)) return false;
    this.racerEffects.activateSpinout(targetId, {
      id: itemId + '-spinout',
      label: ITEM_DEFINITIONS[itemId].displayName,
      durationSeconds: duration,
      direction,
      turns: 1,
    });
    this.activateDriverHit(targetId, duration);
    if (targetId === 'player')
      this.spinoutCameraAnchor.capture(this.kart.forward(), this.kart.velocity());
    return true;
  }

  private itemTargetingProgress(): RacerProgress[] {
    const finishProgress = this.track.startFinishDistance / this.trackLength;
    return [
      targetingProgressSnapshot(
        this.playerProgress,
        this.lapTracker.snapshot().nextCheckpoint,
        finishProgress,
      ),
      ...this.opponents.map((opponent) =>
        targetingProgressSnapshot(
          opponent.progress,
          opponent.lapTracker.snapshot().nextCheckpoint,
          finishProgress,
        ),
      ),
    ];
  }

  private currentStandings(): RacerProgress[] {
    return rankRacers([this.playerProgress, ...this.opponents.map(({ progress }) => progress)]);
  }

  private updateItemBoxes(dt: number): void {
    const racers = [
      {
        id: 'player',
        position: this.kart.position(),
        finished: this.playerProgress.finished,
        canCollect: this.itemSystem.canCollect('player'),
      },
      ...this.opponents.map((opponent) => ({
        id: opponent.id,
        position: opponent.controller.position(),
        finished: opponent.progress.finished,
        canCollect: this.itemSystem.canCollect(opponent.id),
      })),
    ];

    this.itemBoxes.update(dt, racers, ({ racerId }) => {
      if (!this.itemSystem.canCollect(racerId)) return false;

      const standings = this.currentStandings();
      const racerIndex = standings.findIndex(({ id }) => id === racerId);
      const racer = standings[racerIndex];
      const leader = standings[0];
      if (racerIndex < 0 || racer === undefined || leader === undefined || racer.finished)
        return false;

      const rank = Math.min(8, Math.max(1, racerIndex + 1)) as RaceRank;
      const racerTotal = racer.lap + racer.trackProgress;
      const leaderTotal = leader.lap + leader.trackProgress;
      const distanceBehindLeaderMeters = Math.max(0, (leaderTotal - racerTotal) * this.trackLength);
      const forcedItem = forcedItemForRacer(this.forcedTestItem, racerId);
      const apexAvailable = this.apex.available(racerId, this.itemTargetingProgress());
      const itemId =
        forcedItem ??
        selectItem({
          rank,
          distanceBehindLeaderMeters,
          apexAvailable,
          isRuntimeEligible: (id) =>
            (id !== 'slick-trap' || this.hazards.canPlaceSlick(racerId)) &&
            (id !== 'blast-orb' || this.itemPhysicsCapacity.count() < 40) &&
            (id !== 'seeker-drone' ||
              nearestRacerAhead(racerId, this.itemTargetingProgress()) !== null),
        });
      if (!this.itemSystem.acquire(racerId, itemId)) return false;
      return true;
    });
  }

  private requestPlayerItemUse(): void {
    if (
      this.paused ||
      this.playerProgress.finished ||
      this.raceDirector.phase(false) === 'countdown'
    )
      return;
    if (
      this.itemSystem.heldItem('player')?.itemId === PRISMATIC.id &&
      !this.prismaticFixture.activationAllowed(
        this.kart.position(),
        this.kart.speedMetersPerSecond(),
        this.track,
        this.itemTargetingProgress(),
      )
    )
      return;
    const reverseHeld = this.isPressed('KeyS', 'ArrowDown') || this.touchPressed.has('brake');
    const result = executeItemUse(
      this.itemSystem,
      this.racerEffects,
      'player',
      itemUseDirection(reverseHeld),
      {
        racers: this.itemTargetingProgress(),
        projectileSystem: this.projectiles,
        apexSystem: this.apex,
        hazardSystem: this.hazards,
        shockwaveSystem: this.shockwave,
        prismaticSystem: this.prismatic,
        projectileLaunch: {
          position: this.kart.position(),
          forward: this.kart.forward(),
          velocity: this.kart.velocity(),
        },
      },
    );
    if (this.itemSystem.heldItem('player')?.itemId === 'slick-trap' && result === 'rejected') {
      this.itemUseMessage = 'SLICK NOT READY · ITEM HELD';
      this.itemUseMessageSeconds = 1.5;
    }
    if (this.itemSystem.heldItem('player')?.itemId === 'blast-orb' && result === 'rejected') {
      this.itemUseMessage = 'BLAST ORB NOT READY · ITEM HELD';
      this.itemUseMessageSeconds = 1.5;
    }
    if (this.itemSystem.heldItem('player')?.itemId === 'apex-missile' && result === 'rejected') {
      this.itemUseMessage = 'APEX NOT READY · ITEM HELD';
      this.itemUseMessageSeconds = 1.5;
    }
    if (this.itemSystem.heldItem('player')?.itemId === 'seeker-drone' && result === 'rejected') {
      this.itemUseMessage =
        nearestRacerAhead('player', this.itemTargetingProgress()) === null
          ? 'NO RACER AHEAD · SEEKER HELD'
          : 'SEEKER NOT READY · ITEM HELD';
      this.itemUseMessageSeconds = 1.5;
    }
  }

  private respawn(): void {
    this.prismaticContactVictims.length = 0;
    this.prismaticFixtureContact = null;
    const index = this.lastRecoveryIndex % this.track.sampleCount;
    const point = this.track.samples[index]?.clone() ?? this.track.checkpointPosition(0);
    const tangent = this.track.tangents[index]?.clone() ?? this.track.checkpointTangent(0);
    this.kart.respawn(point.addScaledVector(tangent, 4), Math.atan2(tangent.x, tangent.z));
    this.racerEffects.clearSpinout('player');
    this.prismatic.clear('player');
    this.prismaticVisual.clear();
    this.prismaticMusic.update(0, 0, 0, false);
    this.spinoutCameraAnchor.clear();
    this.outOfBoundsSeconds = 0;
  }

  private updateVisuals(dt: number): void {
    const position = this.kart.position(this.position);
    const forward = this.kart.forward(this.forward);
    this.kartMesh.position.copy(position);
    this.kartMesh.rotation.y = Math.atan2(forward.x, forward.z);
    this.rearViewActive = this.pressed.has('KeyC') || this.touchPressed.has('rear');
    const cameraForward = this.spinoutCameraAnchor.resolve(
      forward,
      this.racerEffects.spinoutState('player') !== null,
    );
    this.chaseCamera.update(position, cameraForward, this.rearViewActive, dt);
    for (const opponent of this.opponents) {
      const opponentPosition = opponent.controller.position();
      const opponentForward = opponent.controller.forward();
      opponent.mesh.position.copy(opponentPosition);
      opponent.mesh.rotation.y = Math.atan2(opponentForward.x, opponentForward.z);
      if (opponent.driverVisual !== null) {
        this.applyDriverFrame(
          opponent.driverVisual,
          selectDriverFrame({
            finished: opponent.progress.finished,
            frontFacingCamera: isDriverFrontFacingCamera(
              opponentPosition,
              opponentForward,
              this.camera.position,
            ),
            hitSeconds: opponent.driverHitSeconds,
            spinoutSeconds: this.racerEffects.spinoutRemainingSeconds(opponent.id),
            steering: opponent.steering,
          }),
        );
      }
    }
    const feedback = this.kart.feedback();
    const color =
      feedback.driftTier === 'purple'
        ? 0xa855f7
        : feedback.driftTier === 'orange'
          ? 0xff8a28
          : 0x38bdf8;
    for (const light of this.driftLights) {
      light.visible = feedback.driftTier !== 'none';
      (light.material as THREE.MeshBasicMaterial).color.setHex(color);
      light.scale.setScalar(0.75 + feedback.chargeRatio * 1.4);
    }
    if (feedback.driftTier !== this.lastToneTier && feedback.driftTier !== 'none') {
      const context = (Howler as unknown as { ctx?: AudioContext | null }).ctx;
      playDriftTierTone(feedback.driftTier, context);
    }
    this.lastToneTier = feedback.driftTier;
    this.nitroSurgeVisual.update(
      this.racerEffects.remainingSeconds('player', 'nitro-surge') > 0,
      this.elapsed,
    );
    const targets = this.projectileTargets();
    const threats = seekerThreats(this.projectiles.snapshots(), targets);
    this.seekerWarning = threats.find((threat) => threat.targetId === 'player')?.level ?? null;
    this.seekerWarningVisual.update(threats, targets, this.elapsed);
    this.seekerWarningAudio.update(this.seekerWarning, dt, Howler.volume(), this.paused);
    const apexWarning = this.apex.warningFor('player');
    this.apexWarningAudio.update(
      apexWarning === null ? null : apexWarning === 'diving' ? 3 : 2,
      dt,
      Howler.volume(),
      this.paused,
    );
    this.apexPresentation.update(
      this.apex.snapshot(),
      targets,
      this.apex.drainBlasts(),
      this.paused ? 0 : dt,
    );
    this.prismaticFixture.updateMarker(
      targets.find((racer) => racer.id === this.prismaticFixture.controlledRacer())?.position,
    );
    this.prismaticVisual.update(this.prismatic.remaining('player'), position, this.paused ? 0 : dt);
    this.prismaticMusic.update(
      this.prismatic.remaining('player'),
      dt,
      Howler.volume(),
      this.paused,
    );
    this.updatePlayerDriverSprite();
  }

  private updateHud(frameSeconds: number): void {
    this.fpsAccumulator += frameSeconds;
    this.fpsFrames += 1;
    if (this.fpsAccumulator >= 0.5) {
      this.fps = this.fpsFrames / this.fpsAccumulator;
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
    }

    const projection = this.track.project(this.kart.position(this.position));
    const snapshot = this.lapTracker.snapshot();
    const feedback = this.kart.feedback();
    const driveModifiers = this.racerEffects.driveModifiers('player');
    this.options.onHud({
      lap: Math.min(snapshot.lap + 1, 3),
      speedKph: Math.round(this.kart.speedMetersPerSecond() * 3.6),
      elapsed: this.elapsed,
      surface: projection.surface,
      wrongWay: this.wrongWaySeconds > 0.55,
      fps: Math.round(this.fps),
      frameMs: frameSeconds * 1000,
      finished: snapshot.finished,
      driftTier: feedback.driftTier,
      driftCharge: feedback.chargeRatio,
      boostActive: feedback.boostActive,
      activeBoostLabel: driveModifiers.activeBoostLabel,
      airborne: feedback.airborne,
      position: this.currentStandings().findIndex(({ id }) => id === 'player') + 1,
      countdown: this.raceDirector.countdownLabel(),
      item: this.itemSystem.hudSnapshot('player'),
      seekerWarning: this.seekerWarning,
      apexWarning: this.apex.warningFor('player'),
      itemUseMessage: this.itemUseMessage,
      prismaticSeconds: this.prismatic.remaining('player'),
      testModeItemLabel:
        [
          this.forcedTestItem === null
            ? ''
            : `FORCED ${ITEM_DEFINITIONS[this.forcedTestItem].displayName}`,
          this.incomingSeekerTest ? 'INCOMING SEEKER EVERY 16s' : '',
          this.incomingApexTest ? 'APEX ATTACKS LEADER · DRIVE INTO FIRST' : '',
          this.aiHazardFixture.badge(),
          this.incomingSlickTest ? 'ONE SLICK AHEAD AFTER 5s' : '',
          this.incomingBlastTest ? 'ONE BLAST ORB AHEAD AFTER 5s' : '',
          this.shockwaveCounterFixture.badge(),
          this.prismaticFixture.badge(),
        ]
          .filter(Boolean)
          .join(' · ') || null,
      minimap: {
        track: this.minimapTrack,
        racers: [
          ...this.opponents.map((opponent) => ({
            id: opponent.id,
            name: opponent.name,
            progress: opponent.progress.trackProgress,
            portrait: opponent.portrait,
            isPlayer: false,
          })),
          {
            id: 'player',
            name: `YOU · ${this.options.character.displayName}`,
            progress: projection.progress,
            portrait: this.options.character.portrait ?? '',
            isPlayer: true,
          },
        ],
      },
    });
  }

  private async createKartVisual(): Promise<void> {
    if (this.options.character.kart !== undefined) {
      try {
        const gltf = await new GLTFLoader().loadAsync(this.options.character.kart);
        const model = gltf.scene;
        // Keep physics untouched and apply only the manifest's enforced
        // visual-axis correction. Production GLBs use `extras.forward: -Z`;
        // this visual root requires PI to face away from the chase camera.
        model.rotation.y = this.options.character.kartVisualYaw ?? 0;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const scale = 2.9 / Math.max(size.x, size.z, 0.001);
        model.scale.setScalar(scale);
        bounds.setFromObject(model);
        model.position.y = -bounds.min.y - 0.42;
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        this.kartMesh.add(model);
        this.addDriverSprite(model);
        this.addDriftLights();
        this.scene.add(this.kartMesh);
        return;
      } catch (error) {
        console.warn(
          `Could not load ${this.options.character.displayName}'s kart; using fallback.`,
          error,
        );
      }
    }
    this.createFallbackKartVisual();
    this.addDriverSprite();
  }

  private addDriverSprite(model?: THREE.Object3D): void {
    const visual = this.createDriverSpriteVisual(this.options.character);
    if (visual === null) return;
    visual.modeledSteeringControl = model?.getObjectByName('SteeringWheel') ?? null;
    if (visual.modeledSteeringControl !== null) {
      const { x, y, z } = visual.modeledSteeringControl.position;
      visual.modeledSteeringControlDefaultPosition = [x, y, z];
    }
    this.applyDriverFrame(visual, visual.activeFrame);
    this.kartMesh.add(visual.sprite);
    this.playerDriverVisual = visual;
  }

  private createDriverSpriteVisual(character: CharacterDefinition): DriverSpriteVisual | null {
    const driver = character.driver;
    if (driver === undefined) return null;
    const loader = new THREE.TextureLoader();
    const paths: Partial<Record<DriverFrame, string>> = {
      rear: driver.rear,
      front: driver.front,
      steerLeft: driver.steerLeft,
      steerRight: driver.steerRight,
      hit: driver.hit,
      victory: driver.victory,
      frontSteerLeft: driver.frontSteerLeft,
      frontSteerRight: driver.frontSteerRight,
      frontHit: driver.frontHit,
      frontVictory: driver.frontVictory,
    };
    const rearTexture = loader.load(driver.rear);
    rearTexture.colorSpace = THREE.SRGBColorSpace;
    const visual: DriverSpriteVisual = {
      character,
      sprite: new THREE.Sprite(
        new THREE.SpriteMaterial({ map: rearTexture, transparent: true, depthWrite: false }),
      ),
      textures: new Map([['rear', rearTexture]]),
      activeFrame: 'rear',
      modeledSteeringControl: null,
      modeledSteeringControlDefaultPosition: null,
    };
    for (const [frame, path] of Object.entries(paths) as [DriverFrame, string | undefined][]) {
      if (frame === 'rear' || path === undefined) continue;
      loader.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          visual.textures.set(frame, texture);
          if (visual.activeFrame === frame) this.applyDriverFrame(visual, frame);
        },
        undefined,
        () => {
          console.warn(`Could not load ${character.displayName}'s ${frame} driver frame.`);
        },
      );
    }
    visual.sprite.name = `${character.displayName}DriverSprite`;
    visual.sprite.scale.set(1.45, 1.45, 1);
    visual.sprite.position.set(...(character.driverSpritePosition ?? [0, 0.95, -0.12]));
    return visual;
  }

  private updatePlayerDriverSprite(): void {
    if (this.playerDriverVisual === null) return;
    this.applyDriverFrame(
      this.playerDriverVisual,
      selectDriverFrame({
        finished: this.playerProgress.finished,
        frontFacingCamera: isDriverFrontFacingCamera(
          this.kart.position(this.position),
          this.kart.forward(this.forward),
          this.camera.position,
        ),
        hitSeconds: this.driverHitSeconds,
        spinoutSeconds: this.racerEffects.spinoutRemainingSeconds('player'),
        steering: this.playerSteering,
      }),
    );
  }

  private applyDriverFrame(visual: DriverSpriteVisual, frame: DriverFrame): void {
    const texture = driverFrameFallbacks(frame)
      .map((candidate) => visual.textures.get(candidate))
      .find((candidate) => candidate !== undefined);
    if (texture === undefined) return;
    const material = visual.sprite.material;
    if (material.map !== texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
    const defaultPosition = visual.character.driverSpritePosition ?? [0, 0.95, -0.12];
    const position = driverSpritePosition(
      frame,
      defaultPosition,
      visual.character.frontDriverSpritePosition,
      visual.character.driverFramePositions,
    );
    visual.sprite.position.set(...position);
    if (visual.modeledSteeringControl !== null) {
      const defaultControlPosition = visual.modeledSteeringControlDefaultPosition;
      if (defaultControlPosition !== null) {
        visual.modeledSteeringControl.position.set(
          ...modeledSteeringControlPosition(
            frame,
            defaultControlPosition,
            visual.character.frontModeledSteeringControlPosition,
          ),
        );
      }
      visual.modeledSteeringControl.visible = shouldShowModeledSteeringControl(
        visual.character.driverSpriteIncludesSteeringControl ?? false,
        frame,
      );
    }
    visual.activeFrame = frame;
  }

  private addDriftLights(): void {
    for (const x of [-0.72, 0.72]) {
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      );
      spark.position.set(x, -0.08, -1.15);
      spark.visible = false;
      this.driftLights.push(spark);
      this.kartMesh.add(spark);
    }
  }

  private createFallbackKartVisual(): void {
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.55, 2.45),
      new THREE.MeshStandardMaterial({ color: 0x63328b, metalness: 0.42, roughness: 0.3 }),
    );
    chassis.position.y = 0.15;
    chassis.castShadow = true;
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.38, 0.85),
      new THREE.MeshStandardMaterial({ color: 0xe6b84f, metalness: 0.35, roughness: 0.32 }),
    );
    nose.position.set(0, 0.2, 1.18);
    nose.castShadow = true;
    this.kartMesh.add(chassis, nose);

    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x121216, roughness: 0.9 });
    for (const x of [-0.82, 0.82]) {
      for (const z of [-0.72, 0.72]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.31, 0.31, 0.25, 14),
          wheelMaterial,
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, -0.12, z);
        wheel.castShadow = true;
        this.kartMesh.add(wheel);
      }
    }
    this.addDriftLights();
    this.scene.add(this.kartMesh);
  }

  private createOpponents(spawn: THREE.Vector3, tangent: THREE.Vector3, yaw: number): void {
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const aiRoster = selectAiRoster(characterManifest, this.options.character.id, 7);
    for (let index = 0; index < 7; index += 1) {
      const character = aiRoster[index];
      if (character === undefined) continue;
      const row = Math.floor(index / 2) + 1;
      const side = index % 2 === 0 ? -1 : 1;
      const position = spawn
        .clone()
        .addScaledVector(tangent, -row * 3.2)
        .addScaledVector(right, side * 2.05);
      const stats = character.stats;
      const tuning = createKartTuning(stats);
      const controller = new KartController(this.world, tuning, stats, position, yaw);
      const visual = this.createOpponentVisual(character);
      this.scene.add(visual.group);
      this.opponents.push({
        id: `ai-${String(index + 1)}`,
        name: character.displayName,
        portrait: character.portrait ?? '',
        controller,
        driver: new AiDriver(
          this.track,
          {
            laneOffset: side * (0.7 + row * 0.35),
            pace: 0.28 + index * 0.09,
            aggression: 0.2 + (index % 4) * 0.2,
          },
          tuning.maxSpeed,
        ),
        mesh: visual.group,
        driverVisual: visual.driverVisual,
        driverHitSeconds: 0,
        steering: 0,
        lapTracker: new LapTracker(),
        progress: {
          id: `ai-${String(index + 1)}`,
          lap: 0,
          trackProgress: 0,
          finished: false,
          finishTime: null,
          finishPlace: null,
        },
        lastCheckpointOverlap: -1,
        recoveryCooldown: 0,
      });
    }
  }

  private createOpponentVisual(character: CharacterDefinition): OpponentVisual {
    const group = new THREE.Group();
    const driverVisual = this.createDriverSpriteVisual(character);
    if (character.kart !== undefined) {
      void new GLTFLoader().loadAsync(character.kart).then(
        (gltf) => {
          const model = gltf.scene;
          model.rotation.y = character.kartVisualYaw ?? 0;
          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          model.scale.setScalar(2.9 / Math.max(size.x, size.z, 0.001));
          bounds.setFromObject(model);
          model.position.y = -bounds.min.y - 0.42;
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });
          if (driverVisual !== null) {
            driverVisual.modeledSteeringControl = model.getObjectByName('SteeringWheel') ?? null;
            if (driverVisual.modeledSteeringControl !== null) {
              const { x, y, z } = driverVisual.modeledSteeringControl.position;
              driverVisual.modeledSteeringControlDefaultPosition = [x, y, z];
            }
            this.applyDriverFrame(driverVisual, driverVisual.activeFrame);
          }
          group.clear();
          group.add(model);
          if (driverVisual !== null) group.add(driverVisual.sprite);
        },
        () => {
          console.warn(`Could not load AI kart for ${character.displayName}; using fallback.`);
        },
      );
    }
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.52, 2.35),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(character.accent),
        metalness: 0.25,
        roughness: 0.38,
      }),
    );
    chassis.position.y = 0.15;
    chassis.castShadow = true;
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.42, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x201729, roughness: 0.5 }),
    );
    canopy.position.set(0, 0.55, -0.15);
    group.add(chassis, canopy);
    if (driverVisual !== null) group.add(driverVisual.sprite);
    return { group, driverVisual };
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('resize', this.resize);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    void this.seekerWarningAudio.unlock();
    void this.apexWarningAudio.unlock();
    void this.prismaticMusic.unlock();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if ((event.code === 'Escape' || event.code === 'KeyP') && !event.repeat) {
      this.paused = !this.paused;
    }
    if (event.code === 'KeyR' && !event.repeat) this.respawn();
    if (isItemUseKey(event.code) && !event.repeat) this.requestPlayerItemUse();
    this.pressed.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.code);
  };

  private isPressed(...codes: string[]): boolean {
    return codes.some((code) => this.pressed.has(code));
  }

  private readonly resize = (): void => {
    const width = this.options.canvas.clientWidth || window.innerWidth;
    const height = this.options.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };
}
