// Audio management for Tin! Tilo! Rings!
// Matches original audio.js: se_rotate loops alongside main BGM, changeBGM cycles 1->2->3->4->1

export class AudioManager {
  private scene: Phaser.Scene
  private currentMainBGMId: string = 'bgm_1'
  private mainBGM: Phaser.Sound.BaseSound | null = null
  private seRotate: Phaser.Sound.BaseSound | null = null
  private resultBGM: Phaser.Sound.BaseSound | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  preload(): void {
    // BGM tracks
    this.scene.load.audio('bgm_1', 'assets/bgm/minimal_004.ogg')
    this.scene.load.audio('bgm_2', 'assets/bgm/minimal_008.ogg')
    this.scene.load.audio('bgm_3', 'assets/bgm/minimal_007.ogg')
    this.scene.load.audio('bgm_4', 'assets/bgm/minimal_016.ogg')
    this.scene.load.audio('bgm_result', 'assets/bgm/minimal2_001.ogg')

    // Sound effects
    this.scene.load.audio('se_start', 'assets/sound/se_start.ogg')
    this.scene.load.audio('se_rotate', 'assets/sound/se_rotate.ogg')
    this.scene.load.audio('se_stop', 'assets/sound/se_stop.ogg')
    this.scene.load.audio('se_select_rule', 'assets/sound/se_select_rule.ogg')
    this.scene.load.audio('se_zone_reach', 'assets/sound/se_zone_reach.ogg')
    this.scene.load.audio('se_ambulance', 'assets/sound/se_ambulance.ogg')
    this.scene.load.audio('se_mod', 'assets/sound/se_mod.ogg')
    this.scene.load.audio('se_win', 'assets/sound/se_win.ogg')
    this.scene.load.audio('se_buta', 'assets/sound/se_buta.ogg')
    this.scene.load.audio('se_multi', 'assets/sound/se_multi.ogg')
    this.scene.load.audio('se_hifumi', 'assets/sound/se_hifumi.ogg')
    this.scene.load.audio('se_speed_up', 'assets/sound/se_speed_up.ogg')
    this.scene.load.audio('se_speed_down', 'assets/sound/se_speed_down.ogg')
    this.scene.load.audio(
      'se_start_bullet_time',
      'assets/sound/se_start_bullet_time.ogg'
    )
    this.scene.load.audio(
      'se_start_revolution',
      'assets/sound/se_start_revolution.ogg'
    )
    this.scene.load.audio(
      'se_finish_revolution',
      'assets/sound/se_finish_revolution.ogg'
    )

    // Voice clips
    this.scene.load.audio('voice_chin', 'assets/sound/voice_chin.ogg')
    this.scene.load.audio('voice_chiro', 'assets/sound/voice_chiro.ogg')
    this.scene.load.audio('voice_rin', 'assets/sound/voice_rin.ogg')
    this.scene.load.audio('voice_info', 'assets/sound/voice_info.ogg')
    this.scene.load.audio('voice_back', 'assets/sound/voice_back.ogg')
    this.scene.load.audio('voice_rollback', 'assets/sound/voice_rollback.ogg')
    this.scene.load.audio('voice_combo', 'assets/sound/voice_combo.ogg')
    this.scene.load.audio('voice_result', 'assets/sound/voice_result.ogg')
    this.scene.load.audio(
      'voice_result_negi',
      'assets/sound/voice_result_negi.ogg'
    )
    this.scene.load.audio(
      'voice_result_high_score',
      'assets/sound/voice_result_high_score.ogg'
    )
    this.scene.load.audio('voice_one_more', 'assets/sound/voice_one_more.ogg')
    this.scene.load.audio('voice_ok', 'assets/sound/voice_ok.ogg')
    this.scene.load.audio('voice_ranking', 'assets/sound/voice_ranking.ogg')
    this.scene.load.audio('voice_rule_2943', 'assets/sound/voice_rule_2943.ogg')
    this.scene.load.audio('voice_rule_8390', 'assets/sound/voice_rule_8390.ogg')
    this.scene.load.audio(
      'voice_rule_37654',
      'assets/sound/voice_rule_37654.ogg'
    )
    this.scene.load.audio('voice_rule_0409', 'assets/sound/voice_rule_0409.ogg')
    this.scene.load.audio('voice_rule_2009', 'assets/sound/voice_rule_2009.ogg')
    this.scene.load.audio('voice_rule_6819', 'assets/sound/voice_rule_6819.ogg')
    this.scene.load.audio('voice_ready_1', 'assets/sound/voice_ready_1.ogg')
    this.scene.load.audio('voice_ready_2', 'assets/sound/voice_ready_2.ogg')
    this.scene.load.audio('voice_ready_3', 'assets/sound/voice_ready_3.ogg')
    this.scene.load.audio('voice_reach', 'assets/sound/voice_reach.ogg')
    this.scene.load.audio('voice_zone_110', 'assets/sound/voice_zone_110.ogg')
    this.scene.load.audio('voice_zone_359', 'assets/sound/voice_zone_359.ogg')
    this.scene.load.audio('voice_zone_427', 'assets/sound/voice_zone_427.ogg')
    this.scene.load.audio('voice_zone_488', 'assets/sound/voice_zone_488.ogg')
    this.scene.load.audio('voice_zone_501', 'assets/sound/voice_zone_501.ogg')
    this.scene.load.audio('voice_zone_564', 'assets/sound/voice_zone_564.ogg')
    this.scene.load.audio('voice_zone_712', 'assets/sound/voice_zone_712.ogg')
    this.scene.load.audio('voice_zone_893', 'assets/sound/voice_zone_893.ogg')
    this.scene.load.audio('voice_zone_931', 'assets/sound/voice_zone_931.ogg')
    this.scene.load.audio(
      'voice_bullet_time',
      'assets/sound/voice_bullet_time.ogg'
    )
    this.scene.load.audio(
      'voice_revolution',
      'assets/sound/voice_revolution.ogg'
    )
    this.scene.load.audio(
      'voice_triple_seven',
      'assets/sound/voice_triple_seven.ogg'
    )
  }

  /**
   * Play a BGM track. Matches original Audio.playBGM behavior:
   * - bgm_* tracks: stop other bgm_* first, then play with loop
   * - se_rotate: plays alongside bgm_* (doesn't stop main BGM)
   * - bgm_result: stops everything, plays result music
   */
  playBGM(key: string, volume: number = 0.2): void {
    if (key === 'se_rotate') {
      // se_rotate loops alongside main BGM (original: length=2000ms loop)
      if (this.seRotate) this.seRotate.stop()
      this.seRotate = this.scene.sound.add(key, { loop: true, volume })
      this.seRotate.play()
    } else if (key === 'bgm_result') {
      // Result BGM: stop everything first
      this.stopAllBGM()
      this.resultBGM = this.scene.sound.add(key, { loop: true, volume })
      this.resultBGM.play()
    } else if (key.startsWith('bgm_')) {
      // Main BGM: stop current main BGM, keep se_rotate
      if (this.mainBGM) this.mainBGM.stop()
      this.mainBGM = this.scene.sound.add(key, { loop: true, volume })
      this.mainBGM.play()
      this.currentMainBGMId = key
    }
  }

  /**
   * Stop a specific BGM or all BGMs.
   * Original: Audio.stopBGM(id) stops only that id.
   */
  stopBGM(key?: string): void {
    if (key === 'se_rotate') {
      if (this.seRotate) {
        this.seRotate.stop()
        this.seRotate = null
      }
    } else if (key) {
      // Stop a specific main BGM
      if (this.mainBGM && this.currentMainBGMId === key) {
        this.mainBGM.stop()
        this.mainBGM = null
      }
      if (this.resultBGM && key === 'bgm_result') {
        this.resultBGM.stop()
        this.resultBGM = null
      }
    } else {
      // Stop all
      this.stopAllBGM()
    }
  }

  /** Stop all BGM tracks. Matches original Audio.stopAllBGM. */
  stopAllBGM(): void {
    if (this.mainBGM) {
      this.mainBGM.stop()
      this.mainBGM = null
    }
    if (this.seRotate) {
      this.seRotate.stop()
      this.seRotate = null
    }
    if (this.resultBGM) {
      this.resultBGM.stop()
      this.resultBGM = null
    }
  }

  playSound(key: string, volume: number = 1): void {
    try {
      this.scene.sound.play(key, { volume })
    } catch {
      // Gracefully handle missing audio files
    }
  }

  /**
   * Cycle to next BGM. Original: increments 1->2->3->4->1.
   * Uses separate tracking (currentMainBGMId) independent of what's currently playing.
   */
  changeBGM(): void {
    let n = parseInt(this.currentMainBGMId.split('_')[1])
    n++
    if (n > 4) n = 1

    const id = `bgm_${n}`
    this.currentMainBGMId = id
    this.playBGM(id, 0.2)
  }

  /** Change volume of main BGM tracks only. Original: only affects bgm_1-4. */
  changeBGMVolume(volume: number): void {
    if (this.mainBGM && 'setVolume' in this.mainBGM) {
      ;(
        this.mainBGM as
          | Phaser.Sound.WebAudioSound
          | Phaser.Sound.HTML5AudioSound
      ).setVolume(volume)
    }
  }
}
