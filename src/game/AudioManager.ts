// Audio management for Tin! Tilo! Rings!

export class AudioManager {
  private scene: Phaser.Scene
  private bgmTracks: Map<string, Phaser.Sound.BaseSound>
  private sounds: Map<string, Phaser.Sound.BaseSound>
  private currentBGM: string | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.bgmTracks = new Map()
    this.sounds = new Map()
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
    this.scene.load.audio('se_select_rule', 'assets/sound/se_select_rule.ogg')
    this.scene.load.audio('se_zone_reach', 'assets/sound/se_zone_reach.ogg')
    this.scene.load.audio('se_ambulance', 'assets/sound/se_ambulance.ogg')
    this.scene.load.audio('se_mod', 'assets/sound/se_mod.ogg')
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

    // Additional sound effects
    this.scene.load.audio('se_stop', 'assets/sound/se_stop.ogg')

    // Voice clips
    this.scene.load.audio('voice_chin', 'assets/sound/voice_chin.ogg')
    this.scene.load.audio('voice_chiro', 'assets/sound/voice_chiro.ogg')
    this.scene.load.audio('voice_rin', 'assets/sound/voice_rin.ogg')
    this.scene.load.audio('voice_info', 'assets/sound/voice_info.ogg')
    this.scene.load.audio('voice_back', 'assets/sound/voice_back.ogg')
    this.scene.load.audio('voice_rollback', 'assets/sound/voice_rollback.ogg')
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

  playBGM(key: string, volume: number = 0.2): void {
    // Stop current BGM
    if (this.currentBGM && this.bgmTracks.has(this.currentBGM)) {
      const current = this.bgmTracks.get(this.currentBGM)
      if (current) {
        current.stop()
      }
    }

    // Play new BGM
    if (!this.bgmTracks.has(key)) {
      const bgm = this.scene.sound.add(key, { loop: true, volume })
      this.bgmTracks.set(key, bgm)
    }

    const bgm = this.bgmTracks.get(key)
    if (bgm) {
      bgm.play()
      this.currentBGM = key
    }
  }

  stopBGM(key?: string): void {
    if (key) {
      const bgm = this.bgmTracks.get(key)
      if (bgm) {
        bgm.stop()
      }
      if (this.currentBGM === key) {
        this.currentBGM = null
      }
    } else {
      // Stop all BGM
      this.bgmTracks.forEach(bgm => bgm.stop())
      this.currentBGM = null
    }
  }

  playSound(key: string, volume: number = 1): void {
    if (!this.sounds.has(key)) {
      const sound = this.scene.sound.add(key, { volume })
      this.sounds.set(key, sound)
    }

    const sound = this.sounds.get(key)
    if (sound) {
      sound.play()
    }
  }

  changeBGM(): void {
    if (!this.currentBGM) return

    const match = this.currentBGM.match(/bgm_(\d+)/)
    if (!match) return

    let num = parseInt(match[1])
    num = (num % 4) + 1

    this.playBGM(`bgm_${num}`, 0.2)
  }

  changeBGMVolume(volume: number): void {
    // Change volume of current BGM
    if (this.currentBGM && this.bgmTracks.has(this.currentBGM)) {
      const bgm = this.bgmTracks.get(this.currentBGM)
      if (bgm && 'setVolume' in bgm) {
        ;(
          bgm as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound
        ).setVolume(volume)
      }
    }

    // Change volume for all BGM tracks
    this.bgmTracks.forEach(bgm => {
      if ('setVolume' in bgm) {
        ;(
          bgm as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound
        ).setVolume(volume)
      }
    })
  }
}
