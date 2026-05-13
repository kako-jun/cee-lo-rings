// const _g = this;

const _g = {
  high_score: {
    rule_1_2943: null,
    rule_1_8390: null,
    rule_1_37654: null,
    rule_2_2943: null,
    rule_2_8390: null,
    rule_2_37654: null,
    rule_3_0409: null,
    rule_3_2009: null,
    rule_3_6819: null
  }
};

phina.define("MainScene", {
  superClass: "DisplayScene",
  init: function(param) {
    this.superInit();

    this.backgroundColor = "#732121";

    this.rule = param.rule;

    this.mode = "first";
    this.elapsed_time = 0;
    this.bet_times = 0;
    this.total_score = 0;
    this.stats = {
      max_combo: 0,
      max_gain: 0,
      roll: {
        pinzoro: 0,
        arashikabu: 0,
        kemono: 0,
        triple_seven: 0,
        zorome: 0,
        shigoro: 0,
        hifumi: 0,
        pinbasami: 0,
        me: 0,
        pin: 0,
        nizou: 0,
        santa: 0,
        yotsuya: 0,
        goke: 0,
        roppou: 0,
        shichiken: 0,
        oicho: 0,
        kabu: 0,
        pink_ribbon: 0,
        buta: 0
      },
      zone: {
        bullet_time: 0,
        revolution: 0
      },
      triple_seven: {
        all_1: 0,
        all_6: 0,
        all_123: 0,
        all_456: 0,
        triplets: 0,
        others: 0,
        rollback: 0
      },
      egg: {
        ambulance: 0
      }
    };

    this.prevent_click = false;
    this.key_wait = false;

    this.speed = 4;
    this.speed_bk = this.speed;

    this.i_combo = 0;
    this.i_score_1000 = 0;
    this.i_second_1 = 0;
    this.i_minute_1 = 0;

    this.reserve_change_BGM = false;
    this.reserve_start_zone = false;
    this.reserve_finish_zone = false;
    this.zone_seconds = 0;
    this.bullet_time = false;
    this.revolution = false;
    this.rollback_stock = 0;

    this.backgroundSprites = new BackgroundSprites(this);
    this.kanjiSprites = new KanjiSprites(this);
    this.monSprites = new MonSprites(this);
    this.effectSprites = new EffectSprites(this);
    this.linesSprites = new LinesSprites(this);
    this.guidesSprites = new GuidesSprites(this, 155, 382);
    this.modsSprites = new ModsSprites(this, 155, 382);
    this.ringSprites1 = new RingSprites(this, 100, 300, "left");
    this.ringSprites2 = new RingSprites(this, 142, 300, "center");
    this.ringSprites3 = new RingSprites(this, 184, 300, "right");
    this.alphabetsSprites = new AlphabetsSprites(this, 335, 300);
    this.scoresSprites = new ScoresSprites(this, 520, 300);
    this.comboSprites = new ComboSprites(this, 350, 783);
    this.currentScoreSprites = new CurrentScoreSprites(this, 645, 790);
    this.totalScoreSprites = new TotalScoreSprites(this, 245, 925);
    this.timeSprites = new TimeSprites(this, 245, 17);
    this.betTimesSprites = new BetTimesSprites(this, 245, 60);
    this.infoSprite = new InfoSprite(this, 606, 30);
    this.backSprite = new BackSprite(this, 34, 30);

    this.backgroundSprites.change(0, this.rule);
    this.kanjiSprites.change();
    this.monSprites.change();

    setTimeout(() => {
      this.changeMode();
    }, 1000);
  },

  update: function(app) {
    switch (this.mode) {
      case "first":
      case "ready":
      case "shown_result":
      case "input_name":
        break;
      default:
        this.elapsed_time += app.deltaTime;

        const second = Math.floor(this.elapsed_time / 1000);
        const i_second_1 = Math.floor(second);
        if (i_second_1 !== this.i_second_1) {
          this.i_second_1 = i_second_1;
          this.timeSprites.redraw(Rule.getTime(this.rule, this.i_second_1));

          if (this.bullet_time || this.revolution) {
            if (this.zone_seconds > 0) {
              this.zone_seconds--;

              if (this.zone_seconds <= 0) {
                this.reserve_finish_zone = true;
              }
            }
          }
        }

        const i_minute_1 = Math.floor(second / 60);
        if (i_minute_1 > this.i_minute_1) {
          this.i_minute_1 = i_minute_1;
          this.reserve_change_BGM = true;
        }
        break;
    }

    const key = app.keyboard;
    if (key.getKey("space")) {
      if (!this.key_wait) {
        this.key_wait = true;
        setTimeout(() => {
          this.key_wait = false;
        }, 200);

        this.changeMode();
      }
    }

    switch (this.mode) {
      case "first":
        break;
      case "ready":
        break;
      case "rotate_3":
        this.ringSprites1.rotate(this.speed);
        this.ringSprites2.rotate(this.speed + 1);
        this.ringSprites3.rotate(this.speed + 2);
        break;
      case "braking_3":
        this.ringSprites2.rotate(this.speed + 1);
        this.ringSprites3.rotate(this.speed + 2);
        break;
      case "braked_3":
        break;
      case "rotate_2":
        this.ringSprites2.rotate(this.speed);
        this.ringSprites3.rotate(this.speed + 1);
        break;
      case "braking_2":
        this.ringSprites3.rotate(this.speed + 1);
        break;
      case "braked_2":
        break;
      case "rotate_1":
        this.ringSprites3.rotate(this.speed);
        break;
      case "braking_1":
        break;
      case "braked_1":
        break;
      case "showing_mods":
        break;
      case "showing_scores":
        break;
      case "shown_scores":
        break;
      case "shown_result":
        break;
      case "input_name":
        break;
    }
  },

  onclick: function() {
    if (this.prevent_click) {
      return;
    }

    switch (this.mode) {
      case "first":
      case "ready":
      case "braking_3":
      case "braked_3":
      case "braking_2":
      case "braked_2":
      case "braking_1":
      case "braked_1":
      case "showing_mods":
      case "showing_scores":
      case "shown_result":
      case "input_name":
        return;
    }

    this.changeMode();
  },

  changeMode: function() {
    switch (this.mode) {
      case "first":
        this.infoSprite.show();
        this.backSprite.show();
        this.linesSprites.show();

        const ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        this.ringSprites1.redraw(ring1_ns, "white");
        this.ringSprites2.redraw(ring2_ns, "white");
        this.ringSprites3.redraw(ring3_ns, "white");

        this.totalScoreSprites.redraw(this.total_score);
        this.timeSprites.redraw(Rule.getTime(this.rule, this.i_second_1));

        switch (this.rule) {
          case "rule_2_2943":
          case "rule_2_8390":
          case "rule_2_37654":
            this.betTimesSprites.redraw(this.bet_times);
            break;
        }

        setTimeout(() => {
          Audio.playSound("voice_ready_1");
          setTimeout(() => {
            Audio.playSound("voice_ready_2");
            setTimeout(() => {
              Audio.playSound("voice_ready_3");
              setTimeout(() => {
                this.mode = "ready";
                this.changeMode();
              }, 700);
            }, 1300);
          }, 1700);
        }, 500);
        break;
      case "ready":
        this.elapsed_time = 0;
        Audio.playBGM("bgm_1");

        this.ringSprites1.changeOpacity("normal");
        this.ringSprites2.changeOpacity("light");
        this.ringSprites3.changeOpacity("light");

        Audio.playBGM("se_rotate");
        this.bet_times++;
        switch (this.rule) {
          case "rule_2_2943":
          case "rule_2_8390":
          case "rule_2_37654":
            this.betTimesSprites.redraw(this.bet_times);
            break;
        }

        this.mode = "rotate_3";
        break;
      case "rotate_3":
        this.mode = "braking_3";
        this.changeMode();
        break;
      case "braking_3":
        this.ringSprites1.brake(this.speed, () => {
          this.ringSprites1.stop(this.bullet_time || this.revolution);
          this.mode = "braked_3";
          this.changeMode();
        });
        break;
      case "braked_3":
        this.ringSprites1.changeOpacity("normal");
        this.ringSprites2.changeOpacity("normal");
        this.ringSprites3.changeOpacity("light");
        this.mode = "rotate_2";
        break;
      case "rotate_2":
        this.mode = "braking_2";
        this.changeMode();
        break;
      case "braking_2":
        this.ringSprites2.brake(this.speed, () => {
          this.ringSprites2.stop(this.bullet_time || this.revolution);
          this.mode = "braked_2";
          this.changeMode();
        });
        break;
      case "braked_2":
        this.ringSprites1.changeOpacity("normal");
        this.ringSprites2.changeOpacity("normal");
        this.ringSprites3.changeOpacity("normal");

        const reaches = Rule.getReaches(this.ringSprites1.eyes, this.ringSprites2.eyes);
        _.forEach(reaches, reach => {
          this.guidesSprites.show(reach);
        });

        if (reaches.length > 0) {
          Audio.playSound("voice_reach");
        }

        if (!this.bullet_time && !this.revolution) {
          const zoneReaches = Rule.getZoneReaches(this.ringSprites1.eyes, this.ringSprites2.eyes);
          if (zoneReaches.length > 0) {
            Audio.playSound("se_zone_reach");
          }
        }

        this.mode = "rotate_1";
        break;
      case "rotate_1":
        Audio.stopBGM("se_rotate");
        this.mode = "braking_1";
        this.changeMode();
        break;
      case "braking_1":
        this.ringSprites3.brake(this.speed, () => {
          this.ringSprites3.stop(this.bullet_time || this.revolution);
          this.mode = "braked_1";
          this.changeMode();
        });
        break;
      case "braked_1":
        this.ringSprites1.changeOpacity("normal");
        this.ringSprites2.changeOpacity("normal");
        this.ringSprites3.changeOpacity("normal");

        this.guidesSprites.hide();

        this.tuples = Rule.calcTuples(this.ringSprites1.eyes, this.ringSprites2.eyes, this.ringSprites3.eyes);

        // if (!this.bullet_time && !this.revolution) {
        if (this.zone_seconds <= 0) {
          const zoneRolls = Rule.getZoneRolls(this.tuples);
          if (zoneRolls.length > 0) {
            this.reserve_start_zone = true;
          }

          _.forEach(zoneRolls, roll => {
            Audio.playSound("voice_zone_" + roll);
          });
        }

        if (Rule.isAmbulance(this.tuples)) {
          this.elapsed_time -= 10 * 1000;
          Audio.playSound("se_ambulance");
          this.stats.egg.ambulance++;
        }

        this.mods = Rule.calcMods(this.tuples);
        this.mode = "showing_mods";

        setTimeout(() => {
          this.guidesSprites.show("mod");
          this.modsSprites.redraw(this.mods);
          this.alphabetsSprites.redraw(this.tuples, this.mods);

          setTimeout(() => {
            this.scores = Rule.calcScores(this.tuples, this.mods, this.revolution);

            let rollback = false;
            if (this.rollback_stock > 0) {
              const reaches = Rule.getReaches(this.ringSprites1.eyes, this.ringSprites2.eyes);
              if (reaches.length > 0) {
                if (!Rule.isMultiWon(this.scores)) {
                  this.guidesSprites.hide();
                  this.modsSprites.hide();
                  this.alphabetsSprites.hide();

                  _.forEach(reaches, reach => {
                    this.guidesSprites.show(reach);
                  });

                  rollback = true;
                }
              }
            }

            if (rollback) {
              this.rollback_stock--;

              if (this.rollback_stock === 0) {
                const ns = this.ringSprites3.ns;
                const color = this.ringSprites2.color;
                this.ringSprites3.redraw(ns, color);
              }

              this.effectSprites.show("triple_seven");
              setTimeout(() => {
                this.effectSprites.hide("triple_seven");
              }, 1000);

              Audio.playSound("voice_rollback");
              this.stats.triple_seven.rollback++;
              this.mode = "rotate_1";
            } else {
              _.forEach(this.scores, score => {
                if (score.roll.won) {
                  this.stats.roll[score.roll.name]++;
                } else {
                  this.stats.roll.buta++;
                }
              });

              this.current_scores = Rule.calcCurrentScores(this.scores);

              if (this.current_scores[2] >= 100) {
                this.i_combo++;
                this.stats.max_combo = _.max([this.stats.max_combo, this.i_combo]);
              } else {
                this.i_combo = 0;
              }

              this.current_scores = Rule.addComboScore(this.current_scores, this.i_combo);
              this.total_score = Rule.calcTotalScore(this.total_score, this.current_scores);

              this.stats.max_gain = _.max([this.stats.max_gain, this.current_scores[3]]);

              this.mode = "showing_scores";
              this.scoresSprites.redraw(this.scores, this.revolution);

              if (this.i_combo >= 2) {
                this.comboSprites.redraw(this.i_combo);
              }

              this.currentScoreSprites.redraw(this.current_scores);

              let wait = 1000;
              if (this.current_scores[3] !== this.current_scores[2]) {
                wait = 1500;
              }

              setTimeout(() => {
                this.totalScoreSprites.redraw(this.total_score);
                this.mode = "shown_scores";
              }, wait);
            }
          }, 1400);
        }, 300);
        break;
      case "showing_mods":
        break;
      case "showing_scores":
        break;
      case "shown_scores":
        if (Rule.isAchieved(this.rule, this.elapsed_time, this.total_score)) {
          Audio.stopAllBGM();
          Audio.playBGM("bgm_result");

          let is_high_score = false;
          switch (this.rule) {
            case "rule_1_2943":
            case "rule_1_8390":
            case "rule_1_37654":
              if (_g.high_score[this.rule] === null || this.elapsed_time < _g.high_score[this.rule]) {
                is_high_score = true;
                _g.high_score[this.rule] = this.elapsed_time;
              }
              break;
            case "rule_2_2943":
            case "rule_2_8390":
            case "rule_2_37654":
              if (_g.high_score[this.rule] === null || this.bet_times < _g.high_score[this.rule]) {
                is_high_score = true;
                _g.high_score[this.rule] = this.bet_times;
              }
              break;
            case "rule_3_0409":
            case "rule_3_2009":
            case "rule_3_6819":
              if (_g.high_score[this.rule] === null || this.total_score > _g.high_score[this.rule]) {
                is_high_score = true;
                _g.high_score[this.rule] = this.total_score;
              }
              break;
          }

          this.resultSprites = new ResultSprites(this);
          this.resultSprites.redraw(
            this.rule,
            this.elapsed_time,
            this.bet_times,
            this.total_score,
            this.stats,
            is_high_score
          );

          this.mode = "shown_result";
        } else {
          this.guidesSprites.hide();
          this.modsSprites.hide();
          this.alphabetsSprites.hide();
          this.scoresSprites.hide();
          this.comboSprites.hide();
          this.currentScoreSprites.hide();

          const current_score = this.current_scores[3];

          if (!this.bullet_time) {
            const speed_bk = this.speed;
            this.speed = Rule.getNextSpeed(this.speed, current_score);

            if (this.speed > speed_bk) {
              Audio.playSound("se_speed_up");
            } else if (this.speed < speed_bk) {
              Audio.playSound("se_speed_down");
            }
          }

          if (this.reserve_finish_zone) {
            this.reserve_finish_zone = false;
            this.zone_seconds = 0;
            Audio.changeBGMVolume(0.2);

            if (this.bullet_time) {
              this.speed = this.speed_bk;
              Audio.playSound("se_speed_up");
            }

            if (this.revolution) {
              Audio.playSound("se_finish_revolution");
            }

            this.bullet_time = false;
            this.revolution = false;
            this.effectSprites.hide();
          }

          if (this.reserve_start_zone) {
            this.reserve_start_zone = false;
            this.zone_seconds = 30;
            Audio.changeBGMVolume(0.1);

            if (_.random(0, 1) > 0) {
              this.bullet_time = true;
              this.speed_bk = this.speed;
              this.speed = 2;
              this.effectSprites.show("bullet_time");
              Audio.playSound("se_start_bullet_time");
              Audio.playSound("voice_bullet_time");
              this.stats.zone.bullet_time++;
            } else {
              this.revolution = true;
              this.effectSprites.show("revolution");
              Audio.playSound("se_start_revolution");
              Audio.playSound("voice_revolution");
              this.stats.zone.revolution++;
            }
          }

          let color = "white";
          if (Rule.isPinkRibbon(this.scores)) {
            color = "pink";
          }

          let ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
          let ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
          let ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

          if (Rule.isTripleSeven(this.scores)) {
            this.effectSprites.show("triple_seven");
            setTimeout(() => {
              this.effectSprites.hide("triple_seven");
            }, 1000);

            Audio.playSound("voice_triple_seven");

            const effect = Rule.getTripleSevenEffect(this.rollback_stock, this.stats);
            ring1_ns = effect.ring1_ns;
            ring2_ns = effect.ring2_ns;
            ring3_ns = effect.ring3_ns;
            this.rollback_stock = effect.rollback_stock;
            this.stats = effect.stats;
          }

          this.ringSprites1.redraw(ring1_ns, color);
          this.ringSprites2.redraw(ring2_ns, color);

          if (this.rollback_stock === 0) {
            this.ringSprites3.redraw(ring3_ns, color);
          } else {
            this.ringSprites3.redraw(ring3_ns, "yellow");
          }

          this.ringSprites1.changeOpacity("normal");
          this.ringSprites2.changeOpacity("light");
          this.ringSprites3.changeOpacity("light");

          this.ringSprites1.changeRingPattern();
          this.ringSprites2.changeRingPattern();
          this.ringSprites3.changeRingPattern();

          const i_score_1000 = Math.floor(this.total_score / 1000);
          if (i_score_1000 !== this.i_score_1000) {
            this.i_score_1000 = i_score_1000;
            if (this.i_score_1000 < 0) {
              this.i_score_1000 = 0;
            }

            this.backgroundSprites.change(this.i_score_1000, this.rule);
          }

          if (this.reserve_change_BGM) {
            this.reserve_change_BGM = false;
            Audio.changeBGM();
          }

          SoundManager.playMusic("se_start", null, false);
          Audio.playBGM("se_rotate");
          this.bet_times++;
          switch (this.rule) {
            case "rule_2_2943":
            case "rule_2_8390":
            case "rule_2_37654":
              this.betTimesSprites.redraw(this.bet_times);
              break;
          }

          this.mode = "rotate_3";
        }
        break;
      case "shown_result":
        break;
      case "input_name":
        break;
    }
  }
});
