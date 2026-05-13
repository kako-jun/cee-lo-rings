const InfoSprite = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprite = Sprite("button_info").addChildTo(this.ds);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.alpha = 0;
    this.sprite.setInteractive(true);

    this.sprite.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      this.ds.prevent_click = true;
      setTimeout(() => {
        this.ds.prevent_click = false;
      }, 100);

      // TODO:専用ボタンに
      Network.shot();

      let locale = "en";
      switch (navigator.language.split("-")[0]) {
        case "ja":
          locale = "ja";
          break;
      }

      window.open("https://llll-ll.com/" + locale + "/tin-tilo-rings", "_blank");
    };

    this.sprite.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      this.sprite.setImage("button_info_hover");
      Audio.playSound("voice_info");
    };

    this.sprite.onpointout = () => {
      this.sprite.setImage("button_info");
    };
  }

  show() {
    if (this.sprite) {
      this.sprite.tweener.fade(0.5, 200).play();
    }
  }

  hide() {
    if (this.sprite) {
      this.sprite.tweener.fadeOut(50).play();
    }
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }
};

const BackSprite = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprite = Sprite("button_back").addChildTo(this.ds);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.alpha = 0;
    this.sprite.setInteractive(true);

    this.sprite.onclick = () => {
      switch (this.ds.mode) {
        case "first":
        case "ready":
          return;
      }

      this.ds.prevent_click = true;
      setTimeout(() => {
        this.ds.prevent_click = false;
      }, 100);

      Audio.stopAllBGM();

      this.ds.exit({
        back: true
      });
    };

    this.sprite.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      this.sprite.setImage("button_back_hover");
      Audio.playSound("voice_back");
    };

    this.sprite.onpointout = () => {
      this.sprite.setImage("button_back_hover");
    };
  }

  show() {
    if (this.sprite) {
      this.sprite.tweener.fadeIn(0.5, 200).play();
    }
  }

  hide() {
    if (this.sprite) {
      this.sprite.tweener.fadeOut(50).play();
    }
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }
};

const TitleSprite = class {
  constructor(ds, x, y) {
    this.ds = ds;

    this.calc();
  }

  calc() {
    this.sprite = Sprite("bg_title").addChildTo(this.ds);
    this.sprite.x = 320;
    this.sprite.y = 480;
    this.sprite.alpha = 0;
  }

  show() {
    if (this.sprite) {
      this.sprite.tweener.fadeIn(200).play();
    }
  }

  hide() {
    if (this.sprite) {
      this.sprite.tweener.fadeOut(50).play();
    }
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }
};

const RulesSprite = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprites = [];

    const line_sprite_1 = Sprite("line_v_1").addChildTo(this.ds);
    line_sprite_1.x = this.x + 100;
    line_sprite_1.y = this.y + 200;
    line_sprite_1.alpha = 0;
    this.sprites.push(line_sprite_1);

    const line_sprite_2 = Sprite("line_v_1").addChildTo(this.ds);
    line_sprite_2.x = this.x + 100 + 200;
    line_sprite_2.y = this.y + 200;
    line_sprite_2.alpha = 0;
    this.sprites.push(line_sprite_2);

    const rule_sprite_1 = Sprite("rule_1").addChildTo(this.ds);
    rule_sprite_1.x = this.x;
    rule_sprite_1.y = this.y;
    rule_sprite_1.alpha = 0;
    this.sprites.push(rule_sprite_1);

    const rule_sprite_2 = Sprite("rule_2").addChildTo(this.ds);
    rule_sprite_2.x = this.x + 200;
    rule_sprite_2.y = this.y;
    rule_sprite_2.alpha = 0;
    this.sprites.push(rule_sprite_2);

    const rule_sprite_3 = Sprite("rule_3").addChildTo(this.ds);
    rule_sprite_3.x = this.x + 200 * 2;
    rule_sprite_3.y = this.y;
    rule_sprite_3.alpha = 0;
    this.sprites.push(rule_sprite_3);

    const rule_sprite_1_2943 = Sprite("rule_1_2943").addChildTo(this.ds);
    rule_sprite_1_2943.x = this.x;
    rule_sprite_1_2943.y = this.y + 120;
    rule_sprite_1_2943.alpha = 0;
    rule_sprite_1_2943.setInteractive(true);

    const rule_sprite_1_8390 = Sprite("rule_1_8390").addChildTo(this.ds);
    rule_sprite_1_8390.x = this.x;
    rule_sprite_1_8390.y = this.y + 120 + 140;
    rule_sprite_1_8390.alpha = 0;
    rule_sprite_1_8390.setInteractive(true);

    const rule_sprite_1_37654 = Sprite("rule_1_37654").addChildTo(this.ds);
    rule_sprite_1_37654.x = this.x;
    rule_sprite_1_37654.y = this.y + 120 + 140 * 2;
    rule_sprite_1_37654.alpha = 0;
    rule_sprite_1_37654.setInteractive(true);

    const rule_sprite_2_2943 = Sprite("rule_2_2943").addChildTo(this.ds);
    rule_sprite_2_2943.x = this.x + 200;
    rule_sprite_2_2943.y = this.y + 120;
    rule_sprite_2_2943.alpha = 0;
    rule_sprite_2_2943.setInteractive(true);

    const rule_sprite_2_8390 = Sprite("rule_2_8390").addChildTo(this.ds);
    rule_sprite_2_8390.x = this.x + 200;
    rule_sprite_2_8390.y = this.y + 120 + 140;
    rule_sprite_2_8390.alpha = 0;
    rule_sprite_2_8390.setInteractive(true);

    const rule_sprite_2_37654 = Sprite("rule_2_37654").addChildTo(this.ds);
    rule_sprite_2_37654.x = this.x + 200;
    rule_sprite_2_37654.y = this.y + 120 + 140 * 2;
    rule_sprite_2_37654.alpha = 0;
    rule_sprite_2_37654.setInteractive(true);

    const rule_sprite_3_0409 = Sprite("rule_3_0409").addChildTo(this.ds);
    rule_sprite_3_0409.x = this.x + 200 * 2;
    rule_sprite_3_0409.y = this.y + 120;
    rule_sprite_3_0409.alpha = 0;
    rule_sprite_3_0409.setInteractive(true);

    const rule_sprite_3_2009 = Sprite("rule_3_2009").addChildTo(this.ds);
    rule_sprite_3_2009.x = this.x + 200 * 2;
    rule_sprite_3_2009.y = this.y + 120 + 140;
    rule_sprite_3_2009.alpha = 0;
    rule_sprite_3_2009.setInteractive(true);

    const rule_sprite_3_6819 = Sprite("rule_3_6819").addChildTo(this.ds);
    rule_sprite_3_6819.x = this.x + 200 * 2;
    rule_sprite_3_6819.y = this.y + 120 + 140 * 2;
    rule_sprite_3_6819.alpha = 0;
    rule_sprite_3_6819.setInteractive(true);

    rule_sprite_1_2943.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_1_2943"
      });
    };

    rule_sprite_1_2943.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_1_2943.setImage("rule_1_2943_hover");
      Audio.playSound("voice_rule_2943");
    };

    rule_sprite_1_2943.onpointout = () => {
      rule_sprite_1_2943.setImage("rule_1_2943");
    };

    rule_sprite_1_8390.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_1_8390"
      });
    };

    rule_sprite_1_8390.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_1_8390.setImage("rule_1_8390_hover");
      Audio.playSound("voice_rule_8390");
    };

    rule_sprite_1_8390.onpointout = () => {
      rule_sprite_1_8390.setImage("rule_1_8390");
    };

    rule_sprite_1_37654.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_1_37654"
      });
    };

    rule_sprite_1_37654.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_1_37654.setImage("rule_1_37654_hover");
      Audio.playSound("voice_rule_37654");
    };

    rule_sprite_1_37654.onpointout = () => {
      rule_sprite_1_37654.setImage("rule_1_37654");
    };

    rule_sprite_2_2943.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_2_2943"
      });
    };

    rule_sprite_2_2943.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_2_2943.setImage("rule_2_2943_hover");
      Audio.playSound("voice_rule_2943");
    };

    rule_sprite_2_2943.onpointout = () => {
      rule_sprite_2_2943.setImage("rule_2_2943");
    };

    rule_sprite_2_8390.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_2_8390"
      });
    };

    rule_sprite_2_8390.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_2_8390.setImage("rule_2_8390_hover");
      Audio.playSound("voice_rule_8390");
    };

    rule_sprite_2_8390.onpointout = () => {
      rule_sprite_2_8390.setImage("rule_2_8390");
    };

    rule_sprite_2_37654.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_2_37654"
      });
    };

    rule_sprite_2_37654.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_2_37654.setImage("rule_2_37654_hover");
      Audio.playSound("voice_rule_37654");
    };

    rule_sprite_2_37654.onpointout = () => {
      rule_sprite_2_37654.setImage("rule_2_37654");
    };

    rule_sprite_3_0409.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_3_0409"
      });
    };

    rule_sprite_3_0409.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_3_0409.setImage("rule_3_0409_hover");
      Audio.playSound("voice_rule_0409");
    };

    rule_sprite_3_0409.onpointout = () => {
      rule_sprite_3_0409.setImage("rule_3_0409");
    };

    rule_sprite_3_2009.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_3_2009"
      });
    };

    rule_sprite_3_2009.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_3_2009.setImage("rule_3_2009_hover");
      Audio.playSound("voice_rule_2009");
    };

    rule_sprite_3_2009.onpointout = () => {
      rule_sprite_3_2009.setImage("rule_3_2009");
    };

    rule_sprite_3_6819.onclick = () => {
      if (this.ds.mode === "first") {
        return;
      }

      Audio.playSound("se_select_rule");
      this.ds.exit({
        rule: "rule_3_6819"
      });
    };

    rule_sprite_3_6819.onpointover = () => {
      if (this.ds.mode === "first") {
        return;
      }

      rule_sprite_3_6819.setImage("rule_3_6819_hover");
      Audio.playSound("voice_rule_6819");
    };

    rule_sprite_3_6819.onpointout = () => {
      rule_sprite_3_6819.setImage("rule_3_6819");
    };

    this.sprites.push(rule_sprite_1_2943);
    this.sprites.push(rule_sprite_1_8390);
    this.sprites.push(rule_sprite_1_37654);
    this.sprites.push(rule_sprite_2_2943);
    this.sprites.push(rule_sprite_2_8390);
    this.sprites.push(rule_sprite_2_37654);
    this.sprites.push(rule_sprite_3_0409);
    this.sprites.push(rule_sprite_3_2009);
    this.sprites.push(rule_sprite_3_6819);
  }

  show() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeIn(200).play();
    });
  }

  hide() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const BackgroundSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
    this.startAnime();
  }

  calc() {
    this.sprite = Sprite("dummy").addChildTo(this.ds);
    this.sprite.x = 320;
    this.sprite.y = 480;
    this.sprite.alpha = 0;
  }

  show(image) {
    this.sprite.setImage(image);
    this.sprite.width = 960 * 1.2;
    this.sprite.height = 960 * 1.2;
    this.sprite.alpha = 0;

    this.sprite.tweener.fadeIn(500).play();
  }

  change(i_score_1000, rule) {
    let n = i_score_1000 + 1;
    if (n > 37) {
      switch (rule) {
        case "rule_1_2943":
        case "rule_1_8390":
        case "rule_1_37654":
        case "rule_2_2943":
        case "rule_2_8390":
        case "rule_2_37654":
          n = 37;
          break;
        case "rule_3_0409":
        case "rule_3_2009":
        case "rule_3_6819":
          n = n % 37;
          break;
      }
    }

    this.show("bg_" + n);
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }

  startAnime() {
    const anime_1 = Tweener()
      .by({ rotation: -60 }, 80000, "easeInOutQuad")
      .by({ rotation: 90 }, 80000, "easeInOutQuad")
      .by({ rotation: 60 }, 40000, "easeInOutQuad")
      .by({ rotation: -90 }, 40000, "easeInOutQuad")
      .setLoop(true);

    const anime_2 = Tweener()
      .to({ scaleX: 1.5, scaleY: 1.5 }, 40000, "easeInOutQuad")
      .to({ scaleX: 1, scaleY: 1 }, 80000, "easeInOutQuad")
      .setLoop(true);

    const anime_3 = Tweener()
      .by({ x: -50, y: 0 }, 10000, "easeInOutQuad")
      .by({ x: 0, y: -50 }, 10000, "easeInOutQuad")
      .by({ x: 50, y: 0 }, 10000, "easeInOutQuad")
      .by({ x: 0, y: 50 }, 10000, "easeInOutQuad")
      .setLoop(true);

    this.sprite.attach(anime_1);
    this.sprite.attach(anime_2);
    this.sprite.attach(anime_3);
  }
};

const KanjiSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
    this.startAnime();
  }

  calc() {
    this.sprite = Sprite("dummy").addChildTo(this.ds);
    this.sprite.x = 0;
    this.sprite.y = 960;
    this.sprite.alpha = 0;
  }

  show(image) {
    this.sprite.setImage(image);
    this.sprite.width = 150 * 2;
    this.sprite.height = 150 * 2;
  }

  change() {
    this.show("kanji_" + _.random(1, 35));
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }

  startAnime() {
    const anime_1 = Tweener()
      .by({ rotation: 360 }, 100000, "easeInOutBack")
      .by({ rotation: -360 }, 120000, "easeInOutBack")
      .setLoop(true);

    const anime_2 = Tweener()
      .to({ scaleX: 2, scaleY: 2 }, 20000, "easeInOutQuad")
      .to({ scaleX: 3, scaleY: 3 }, 20000, "easeInOutQuad")
      .setLoop(true);

    const anime_3 = Tweener()
      .by({ x: 200, y: -100 }, 14000, "easeInOutSine")
      .by({ x: -100, y: -200 }, 14000, "easeInOutSine")
      .by({ x: 150, y: -100 }, 14000, "easeInOutSine")
      .by({ x: -100, y: -200 }, 14000, "easeInOutSine")
      .by({ x: 300, y: -300 }, 14000, "easeInOutSine")
      .by({ x: -450, y: -200 }, 14000, "easeInOutSine")
      .by({ x: 200, y: 100 }, 14000, "easeInOutSine")
      .by({ x: -100, y: 200 }, 14000, "easeInOutSine")
      .by({ x: 150, y: 100 }, 14000, "easeInOutSine")
      .by({ x: -100, y: 200 }, 14000, "easeInOutSine")
      .by({ x: 300, y: 300 }, 14000, "easeInOutSine")
      .by({ x: -450, y: 200 }, 14000, "easeInOutSine")
      .setLoop(true);

    const anime_4 = Tweener()
      .fade(0.5, 4000)
      .fade(1, 8000)
      .fade(0, 8000)
      .call(() => {
        this.change();
      })
      .wait(4000)
      .fade(1, 10000)
      .setLoop(true);

    this.sprite.attach(anime_1);
    this.sprite.attach(anime_2);
    this.sprite.attach(anime_3);
    this.sprite.attach(anime_4);
  }
};

const MonSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
    this.startAnime();
  }

  calc() {
    this.sprite = Sprite("dummy").addChildTo(this.ds);
    this.sprite.x = 640;
    this.sprite.y = 0;
    this.sprite.alpha = 0;
  }

  show(image) {
    this.sprite.setImage(image);
  }

  change() {
    this.show("mon_" + _.random(1, 14));
  }

  remove() {
    if (this.sprite) {
      this.sprite.remove();
    }
  }

  startAnime() {
    const anime_1 = Tweener()
      .by({ rotation: 360 }, 10000, "easeInOutElastic")
      .by({ rotation: -360 }, 10000, "easeInOutElastic")
      .setLoop(true);

    const anime_2 = Tweener()
      .to({ scaleX: 1.5, scaleY: 1.5 }, 5000, "easeInOutQuad")
      .to({ scaleX: 1, scaleY: 1 }, 10000, "easeInOutQuad")
      .setLoop(true);

    const anime_3 = Tweener()
      .by({ x: -200, y: 100 }, 10000, "easeInOutSine")
      .by({ x: 100, y: 200 }, 10000, "easeInOutSine")
      .by({ x: -150, y: 100 }, 10000, "easeInOutSine")
      .by({ x: 100, y: 200 }, 10000, "easeInOutSine")
      .by({ x: -300, y: 300 }, 10000, "easeInOutSine")
      .by({ x: 450, y: 200 }, 10000, "easeInOutSine")
      .by({ x: -200, y: -100 }, 10000, "easeInOutSine")
      .by({ x: 100, y: -200 }, 10000, "easeInOutSine")
      .by({ x: -150, y: -100 }, 10000, "easeInOutSine")
      .by({ x: 100, y: -200 }, 10000, "easeInOutSine")
      .by({ x: -300, y: -300 }, 10000, "easeInOutSine")
      .by({ x: 450, y: -200 }, 10000, "easeInOutSine")
      .setLoop(true);

    const anime_4 = Tweener()
      .fade(0.5, 4000)
      .fade(1, 8000)
      .fade(0, 7000)
      .call(() => {
        this.change();
      })
      .wait(4000)
      .fade(1, 10000)
      .setLoop(true);

    this.sprite.attach(anime_1);
    this.sprite.attach(anime_2);
    this.sprite.attach(anime_3);
    this.sprite.attach(anime_4);
  }
};

const EffectSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
  }

  calc() {
    this.sprites = [];

    const sprite1 = Sprite("bg_bullet_time").addChildTo(this.ds);
    sprite1.x = 320;
    sprite1.y = 480;
    sprite1.alpha = 0;
    this.sprites.push(sprite1);

    const sprite2 = Sprite("bg_revolution").addChildTo(this.ds);
    sprite2.x = 320;
    sprite2.y = 480;
    sprite2.alpha = 0;
    this.sprites.push(sprite2);

    const sprite3 = Sprite("effect_hand").addChildTo(this.ds);
    sprite3.x = 320;
    sprite3.y = 480;
    sprite3.alpha = 0;
    this.sprites.push(sprite3);

    const sprite4 = Sprite("bg_triple_seven").addChildTo(this.ds);
    sprite4.x = 320;
    sprite4.y = 480;
    sprite4.width = 960 * 1.2;
    sprite4.height = 960 * 1.2;
    sprite4.alpha = 0;
    this.sprites.push(sprite4);
  }

  show(effect) {
    switch (effect) {
      case "bullet_time":
        this.sprites[0].tweener.fadeIn(200).play();
        this.sprites[2].tweener
          .fade(0.5, 200)
          .by({ rotation: 360 }, 29000, "linear")
          .play();
        break;
      case "revolution":
        this.sprites[1].tweener.fadeIn(200).play();
        this.sprites[2].tweener
          .fade(0.5, 200)
          .by({ rotation: 360 }, 29000, "linear")
          .play();
        break;
      case "triple_seven":
        const anime_1 = Tweener().fade(0.2, 200);
        const anime_2 = Tweener().by({ rotation: 360 }, 2000, "linear");

        this.sprites[3].attach(anime_1);
        this.sprites[3].attach(anime_2);
        break;
    }
  }

  hide(effect) {
    if (effect) {
      switch (effect) {
        case "triple_seven":
          this.sprites[3].tweener.fadeOut(50).play();
          break;
      }
    } else {
      _.forEach(this.sprites, sprite => {
        sprite.tweener.fadeOut(50).play();
      });
    }
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const LinesSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
  }

  calc() {
    this.sprites = [];

    const sprite1 = Sprite("line_v_1").addChildTo(this.ds);
    sprite1.x = 122;
    sprite1.y = 450;
    sprite1.alpha = 0;
    this.sprites.push(sprite1);

    const sprite2 = Sprite("line_v_1").addChildTo(this.ds);
    sprite2.x = 164;
    sprite2.y = 450;
    sprite2.alpha = 0;
    this.sprites.push(sprite2);

    const sprite3 = Sprite("line_h_1").addChildTo(this.ds);
    sprite3.x = 142;
    sprite3.y = 278;
    sprite3.alpha = 0;
    this.sprites.push(sprite3);

    const sprite4 = Sprite("line_h_1").addChildTo(this.ds);
    sprite4.x = 142;
    sprite4.y = 488;
    sprite4.alpha = 0;
    this.sprites.push(sprite4);

    const sprite5 = Sprite("line_h_2").addChildTo(this.ds);
    sprite5.x = 142;
    sprite5.y = 320;
    sprite5.alpha = 0;
    this.sprites.push(sprite5);

    const sprite6 = Sprite("line_h_2").addChildTo(this.ds);
    sprite6.x = 142;
    sprite6.y = 362;
    sprite6.alpha = 0;
    this.sprites.push(sprite6);

    const sprite7 = Sprite("line_h_2").addChildTo(this.ds);
    sprite7.x = 142;
    sprite7.y = 404;
    sprite7.alpha = 0;
    this.sprites.push(sprite7);

    const sprite8 = Sprite("line_h_2").addChildTo(this.ds);
    sprite8.x = 142;
    sprite8.y = 446;
    sprite8.alpha = 0;
    this.sprites.push(sprite8);
  }

  show() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeIn(200).play();
    });
  }

  hide() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const RingSprites = class {
  constructor(ds, x, y, align) {
    this.ds = ds;
    this.x = x;
    this.y = y;
    this.align = align;

    this.ns = [];
    this.color = "white";

    this.basic_alpha = 1;
    this.i_transform = 0;
    this.transformed = false;

    this.ring_pattern_new = {
      top: {
        x_ratio: 0,
        width_ratio: 1
      },
      bottom: {
        x_ratio: 0,
        width_ratio: 1
      }
    };

    this.ring_pattern = this.ring_pattern_new;
    this.ring_pattern_old = this.ring_pattern;

    this.calc();
  }

  calc() {
    this.sprites = [];
    _.times(10, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x;
      sprite.y = this.y - 42 * 10 + 42 * i;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });

    _.times(10, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x;
      sprite.y = this.y + 42 * i;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });

    _.times(10, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x;
      sprite.y = this.y + 42 * 10 + 42 * i;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });

    _.times(10, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x;
      sprite.y = this.y + 42 * 20 + 42 * i;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });
  }

  redraw(ns, color) {
    this.ns = ns;
    this.color = color;

    _.forEach(this.sprites, (sprite, i) => {
      const i2 = i % 10;
      const n = ns[i2];

      sprite.setImage(color + "_n_" + n);
      sprite.alpha = 0;
      sprite.my_n = n;
    });

    this.show();
  }

  show() {
    _.forEach(this.sprites, sprite => {
      if (sprite.y >= -40 && sprite.y <= 200) {
        const delta = (sprite.y + 40) / 240;
        sprite.alpha = delta * this.basic_alpha;
      } else if (sprite.y >= 700 && sprite.y <= 1000) {
        const delta = (300 - (1000 - sprite.y)) / 300;
        sprite.alpha = (1 - delta) * this.basic_alpha;
      } else {
        sprite.alpha = this.basic_alpha;
      }
    });
  }

  hide() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }

  changeOpacity(opacity) {
    if (opacity === "normal") {
      this.basic_alpha = 1;
    } else {
      this.basic_alpha = 0.2;
    }

    _.forEach(this.sprites, sprite => {
      if (sprite.y >= -40 && sprite.y <= 200) {
        const delta = (sprite.y + 40) / 240;
        sprite.alpha = delta * this.basic_alpha;
      } else if (sprite.y >= 700 && sprite.y <= 1000) {
        const delta = (300 - (1000 - sprite.y)) / 300;
        sprite.alpha = (1 - delta) * this.basic_alpha;
      } else {
        sprite.alpha = this.basic_alpha;
      }
    });
  }

  changeRingPattern() {
    const ring_pattern = {
      top: {
        x_ratio: _.random(-5, 5),
        width_ratio: _.random(5, 30) / 10
      },
      bottom: {
        x_ratio: _.random(-5, 5),
        width_ratio: _.random(5, 30) / 10
      }
    };

    this.i_transform = 0;
    this.transformed = false;

    this.ring_pattern_old = this.ring_pattern;
    this.ring_pattern_new = ring_pattern;
    this.ring_pattern = this.calcRingPattern();
  }

  calcRingPattern() {
    if (this.transformed) {
      return this.ring_pattern;
    } else {
      this.i_transform++;
      if (this.i_transform > 10000) {
        this.i_transform = 0;
        this.transformed = true;
        this.ring_pattern_old = this.ring_pattern;
      }

      const delta_top_x = (this.ring_pattern_new.top.x_ratio - this.ring_pattern_old.top.x_ratio) / 10000;
      const delta_top_width = (this.ring_pattern_new.top.width_ratio - this.ring_pattern_old.top.width_ratio) / 10000;
      const delta_bottom_x = (this.ring_pattern_new.bottom.x_ratio - this.ring_pattern_old.bottom.x_ratio) / 10000;
      const delta_bottom_width =
        (this.ring_pattern_new.bottom.width_ratio - this.ring_pattern_old.bottom.width_ratio) / 10000;

      const ring_pattern = {
        top: {
          x_ratio: this.ring_pattern_old.top.x_ratio + delta_top_x * this.i_transform,
          width_ratio: this.ring_pattern_old.top.width_ratio + delta_top_width * this.i_transform
        },
        bottom: {
          x_ratio: this.ring_pattern_old.bottom.x_ratio + delta_bottom_x * this.i_transform,
          width_ratio: this.ring_pattern_old.bottom.width_ratio + delta_bottom_width * this.i_transform
        }
      };

      return ring_pattern;
    }
  }

  transform(sprite) {
    this.ring_pattern = this.calcRingPattern();

    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240;
      sprite.alpha = delta * this.basic_alpha;
      sprite.x = this.x + (1 - delta) * (1 - delta) * 100 * this.ring_pattern.top.x_ratio;
      sprite.width = 42 * this.ring_pattern.top.width_ratio - (42 * this.ring_pattern.top.width_ratio - 42) * delta;
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300;
      sprite.alpha = (1 - delta) * this.basic_alpha;
      sprite.x = this.x + delta * delta * 100 * this.ring_pattern.bottom.x_ratio;
      sprite.width = 42 + (42 * this.ring_pattern.bottom.width_ratio - 42) * delta;
    } else {
      sprite.alpha = this.basic_alpha;
      sprite.x = this.x;
      sprite.width = 42;
    }
  }

  rotate(speed) {
    _.forEach(this.sprites, (sprite, i) => {
      sprite.y -= speed;

      let initial_y = 0;
      if (i < 10) {
        initial_y = this.y - 42 * 10 + 42 * i;
      } else if (i < 20) {
        initial_y = this.y + 42 * (i - 10);
      } else if (i < 30) {
        initial_y = this.y + 42 * 10 + 42 * (i - 20);
      } else if (i < 40) {
        initial_y = this.y + 42 * 20 + 42 * (i - 30);
      }

      if (sprite.y <= initial_y - 42 * 10) {
        sprite.y = initial_y;
      }

      this.transform(sprite);
    });
  }

  brake(speed, cb) {
    let dt = 0;
    _.forEach(this.sprites, (sprite, i) => {
      let initial_y = 0;
      if (i < 10) {
        initial_y = this.y - 42 * 10 + 42 * i;
      } else if (i < 20) {
        initial_y = this.y + 42 * (i - 10);
      } else if (i < 30) {
        initial_y = this.y + 42 * 10 + 42 * (i - 20);
      } else if (i < 40) {
        initial_y = this.y + 42 * 20 + 42 * (i - 30);
      }

      const dy = sprite.y - initial_y;
      const dn = Math.floor(dy / 42);
      const dest_y = initial_y + 42 * dn;
      const dest_dy = dest_y - sprite.y;

      // if (initial_y - dest_y >= 42 * 10) {
      //   dest_y = initial_y;
      // }

      // sprite.y = dest_y;
      dt = 10 * Math.abs(dest_dy);
      sprite.tweener.by({ y: dest_dy }, dt, "easeOutExpo").play();

      this.transform(sprite);
    });

    if (cb) {
      setTimeout(cb(), dt);
    }
  }

  stop(zone) {
    const start_y = this.y;
    const end_y = this.y + 42 * 10;

    this.eyes = [];
    _.forEach(this.sprites, sprite => {
      if (sprite.y >= start_y && sprite.y < end_y) {
        const eye = sprite.my_n;
        this.eyes.push(eye);
      }
    });

    if (zone) {
      switch (this.align) {
        case "left":
          SoundManager.playMusic("voice_chin", null, false);
          break;
        case "center":
          SoundManager.playMusic("voice_chiro", null, false);
          break;
        case "right":
          SoundManager.playMusic("voice_rin", null, false);
          break;
      }
    } else {
      SoundManager.playMusic("se_stop", null, false);
    }
  }
};

const GuidesSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc(guide) {
    this.reach_sprites = [];
    _.times(11, i => {
      const alphabet = String.fromCharCode(97 + i);

      const sprite = Sprite("guide_reach_" + alphabet).addChildTo(this.ds);
      sprite.x = this.x;
      sprite.y = this.y;
      sprite.alpha = 0;

      this.reach_sprites.push(sprite);
    });

    this.mod_sprites = [];

    const mod_sprite_a = Sprite("guide_mod_a").addChildTo(this.ds);
    const mod_sprite_f = Sprite("guide_mod_f").addChildTo(this.ds);
    const mod_sprite_i = Sprite("guide_mod_i").addChildTo(this.ds);

    mod_sprite_a.x = this.x;
    mod_sprite_a.y = this.y;
    mod_sprite_a.alpha = 0;

    mod_sprite_f.x = this.x;
    mod_sprite_f.y = this.y;
    mod_sprite_f.alpha = 0;

    mod_sprite_i.x = this.x;
    mod_sprite_i.y = this.y;
    mod_sprite_i.alpha = 0;

    this.mod_sprites.push(mod_sprite_a);
    this.mod_sprites.push(mod_sprite_f);
    this.mod_sprites.push(mod_sprite_i);
  }

  show(guide) {
    switch (guide) {
      case "a":
        this.reach_sprites[0].tweener.fadeIn(200).play();
        break;
      case "b":
        this.reach_sprites[1].tweener.fadeIn(200).play();
        break;
      case "c":
        this.reach_sprites[2].tweener.fadeIn(200).play();
        break;
      case "d":
        this.reach_sprites[3].tweener.fadeIn(200).play();
        break;
      case "e":
        this.reach_sprites[4].tweener.fadeIn(200).play();
        break;
      case "f":
        this.reach_sprites[5].tweener.fadeIn(200).play();
        break;
      case "g":
        this.reach_sprites[6].tweener.fadeIn(200).play();
        break;
      case "h":
        this.reach_sprites[7].tweener.fadeIn(200).play();
        break;
      case "i":
        this.reach_sprites[8].tweener.fadeIn(200).play();
        break;
      case "j":
        this.reach_sprites[9].tweener.fadeIn(200).play();
        break;
      case "k":
        this.reach_sprites[10].tweener.fadeIn(200).play();
        break;
      case "mod":
        this.mod_sprites[0].tweener.fadeIn(50).play();
        this.mod_sprites[1].tweener
          .wait(400)
          .fadeIn(50)
          .play();
        this.mod_sprites[2].tweener
          .wait(800)
          .fadeIn(50)
          .play();
        break;
    }
  }

  hide() {
    _.forEach(this.reach_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });

    _.forEach(this.mod_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.reach_sprites, sprite => {
      sprite.remove();
    });

    _.forEach(this.mod_sprites, sprite => {
      sprite.remove();
    });

    this.reach_sprites = [];
    this.mod_sprites = [];
  }
};

const ModsSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprites = [];
    _.times(11, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      if (i >= 0 && i <= 4) {
        sprite.x = this.x - 100;
        sprite.y = this.y - 82 + 42 * i;
      } else if (i >= 5 && i <= 7) {
        sprite.x = this.x + 72;
        sprite.y = this.y - 128 + 47 * (i - 5);
      } else if (i >= 8 && i <= 10) {
        sprite.x = this.x + 72;
        sprite.y = this.y + 38 + 47 * (i - 8);
      }

      sprite.alpha = 0;
      this.sprites.push(sprite);
    });
  }

  redraw(mods) {
    _.forEach(this.sprites, (sprite, i) => {
      const mod = mods[i];
      sprite.setImage("mod_n_" + mod);
      sprite.alpha = 0;
    });

    this.show();
  }

  show() {
    this.sprites[0].tweener.fadeIn(50).play();
    this.sprites[1].tweener.fadeIn(50).play();
    this.sprites[2].tweener.fadeIn(50).play();
    this.sprites[3].tweener.fadeIn(50).play();
    this.sprites[4].tweener.fadeIn(50).play();
    Audio.playSound("se_mod");
    // SoundManager.playMusic('se_mod', null, false);

    this.sprites[5].tweener
      .wait(400)
      .fadeIn(50)
      .play();
    this.sprites[6].tweener
      .wait(400)
      .fadeIn(50)
      .play();
    this.sprites[7].tweener
      .wait(400)
      .fadeIn(50)
      .call(() => {
        // Audio.playSound('se_mod');
        SoundManager.playMusic("se_mod", null, false);
      })
      .play();

    this.sprites[8].tweener
      .wait(800)
      .fadeIn(50)
      .play();
    this.sprites[9].tweener
      .wait(800)
      .fadeIn(50)
      .play();
    this.sprites[10].tweener
      .wait(800)
      .fadeIn(50)
      .call(() => {
        // Audio.playSound('se_mod');
        SoundManager.playMusic("se_mod", null, false);
      })
      .play();
  }

  hide() {
    _.forEach(this.sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const AlphabetsSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprite_group = [];
    _.times(11, i => {
      const alphabet = String.fromCharCode(97 + i);
      const alphabet_sprite = Sprite("alphabet_" + alphabet).addChildTo(this.ds);
      alphabet_sprite.x = this.x;
      alphabet_sprite.y = this.y + 42 * i;
      alphabet_sprite.alpha = 0;

      const tuple_sprite_1 = Sprite("dummy").addChildTo(this.ds);
      tuple_sprite_1.x = this.x + 28;
      tuple_sprite_1.y = this.y + 42 * i;
      tuple_sprite_1.width = 35;
      tuple_sprite_1.height = 35;
      tuple_sprite_1.alpha = 0;

      const tuple_sprite_2 = Sprite("dummy").addChildTo(this.ds);
      tuple_sprite_2.x = this.x + 53;
      tuple_sprite_2.y = this.y + 42 * i;
      tuple_sprite_2.width = 35;
      tuple_sprite_2.height = 35;
      tuple_sprite_2.alpha = 0;

      const tuple_sprite_3 = Sprite("dummy").addChildTo(this.ds);
      tuple_sprite_3.x = this.x + 78;
      tuple_sprite_3.y = this.y + 42 * i;
      tuple_sprite_3.width = 35;
      tuple_sprite_3.height = 35;
      tuple_sprite_3.alpha = 0;

      const mod_sprite = Sprite("dummy").addChildTo(this.ds);
      mod_sprite.x = this.x + 112;
      mod_sprite.y = this.y + 42 * i;
      mod_sprite.width = 30;
      mod_sprite.height = 30;
      mod_sprite.alpha = 0;

      this.sprite_group.push([alphabet_sprite, tuple_sprite_1, tuple_sprite_2, tuple_sprite_3, mod_sprite]);
    });

    this.line_sprite = Sprite("line_h_3").addChildTo(this.ds);
    this.line_sprite.x = this.x + 140;
    this.line_sprite.y = this.y + 445;
    this.line_sprite.alpha = 0;
  }

  redraw(tuples, mods) {
    _.forEach(this.sprite_group, (sprites, i) => {
      const tuple = tuples[i];
      const mod = mods[i];

      const alphabet_sprite = sprites[0];
      alphabet_sprite.alpha = 0;

      const tuple_sprite_1 = sprites[1];
      tuple_sprite_1.setImage("gray_n_" + tuple[0]);
      tuple_sprite_1.width = 35;
      tuple_sprite_1.height = 35;
      tuple_sprite_1.alpha = 0;

      const tuple_sprite_2 = sprites[2];
      tuple_sprite_2.setImage("gray_n_" + tuple[1]);
      tuple_sprite_2.width = 35;
      tuple_sprite_2.height = 35;
      tuple_sprite_2.alpha = 0;

      const tuple_sprite_3 = sprites[3];
      tuple_sprite_3.setImage("gray_n_" + tuple[2]);
      tuple_sprite_3.width = 35;
      tuple_sprite_3.height = 35;
      tuple_sprite_3.alpha = 0;

      const mod_sprite = sprites[4];
      mod_sprite.setImage("mod_n_" + mod);
      mod_sprite.width = 30;
      mod_sprite.height = 30;
      mod_sprite.alpha = 0;
    });

    this.line_sprite.alpha = 0;

    this.show();
  }

  show() {
    _.forEach(this.sprite_group, sprites => {
      _.forEach(sprites, sprite => {
        sprite.tweener
          .wait(800)
          .fadeIn(50)
          .play();
      });
    });

    if (this.line_sprite) {
      this.line_sprite.tweener
        .wait(800)
        .fadeIn(50)
        .play();
    }
  }

  hide() {
    _.forEach(this.sprite_group, sprites => {
      _.forEach(sprites, sprite => {
        sprite.tweener.fadeOut(50).play();
      });
    });

    if (this.line_sprite) {
      this.line_sprite.tweener.fadeOut(50).play();
    }
  }

  remove() {
    _.forEach(this.sprite_group, sprites => {
      _.forEach(sprites, sprite => {
        sprite.remove();
      });
    });

    this.sprite_group = [];

    if (this.line_sprite) {
      this.line_sprite.remove();
    }
  }
};

const ScoresSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprite_group = [];
    _.times(11, i => {
      const roll_sprite = Sprite("dummy").addChildTo(this.ds);
      roll_sprite.x = this.x;
      roll_sprite.y = this.y + 42 * i;
      roll_sprite.alpha = 0;

      const odds_sprite = Sprite("dummy").addChildTo(this.ds);
      odds_sprite.x = this.x + 85;
      odds_sprite.y = this.y + 42 * i;
      odds_sprite.alpha = 0;

      this.sprite_group.push([roll_sprite, odds_sprite]);
    });
  }

  redraw(scores, revolution) {
    _.forEach(this.sprite_group, (sprites, i) => {
      const score = scores[i];

      let roll_image = "";
      let odds_image = "";
      if (score.won) {
        roll_image = "roll_" + score.roll.name;

        let odds = 0;
        if (score.roll.odds) {
          odds = score.roll.odds;
        } else {
          odds = score.roll.calcGain(score.sum, score.tuple, score.mod);
        }

        if (score.roll.f === "multi") {
          if (revolution) {
            odds *= -1;
          }
        }

        odds_image = "odds_" + score.roll.f + "_" + odds;
      } else {
        roll_image = "roll_buta";
        odds_image = "dummy";
      }

      const roll_sprite = sprites[0];
      roll_sprite.setImage(roll_image);
      roll_sprite.alpha = 0;

      const odds_sprite = sprites[1];
      odds_sprite.setImage(odds_image);
      odds_sprite.alpha = 0;
    });

    this.show(scores);
  }

  show(scores) {
    _.forEach(this.sprite_group, (sprites, i) => {
      const score = scores[i];

      const roll_sprite = sprites[0];
      const odds_sprite = sprites[1];

      if (score.won) {
        switch (Rule.getStep(score)) {
          case "me":
            roll_sprite.tweener.fadeIn(50).play();
            odds_sprite.tweener.fadeIn(50).play();
            break;
          case "kabu":
            roll_sprite.tweener
              .wait(500)
              .fadeIn(50)
              .play();
            odds_sprite.tweener
              .wait(500)
              .fadeIn(50)
              .play();
            break;
          case "multi":
            roll_sprite.tweener
              .wait(1000)
              .fadeIn(50)
              .play();
            odds_sprite.tweener
              .wait(1000)
              .fadeIn(50)
              .play();
            break;
        }
      } else {
        roll_sprite.tweener
          .wait(1000)
          .fadeIn(50)
          .play();
        odds_sprite.tweener
          .wait(1000)
          .fadeIn(50)
          .play();
      }
    });
  }

  hide() {
    _.forEach(this.sprite_group, sprites => {
      _.forEach(sprites, sprite => {
        sprite.tweener.fadeOut(50).play();
      });
    });
  }

  remove() {
    _.forEach(this.sprite_group, sprites => {
      _.forEach(sprites, sprite => {
        sprite.remove();
      });
    });

    this.sprite_group = [];
  }
};

const ComboSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.combo_sprite = Sprite("dummy").addChildTo(this.ds);
    this.combo_sprite.x = this.x + 39;
    this.combo_sprite.y = this.y + 12;
    this.combo_sprite.alpha = 0;

    this.text_sprite = Sprite("text_combo").addChildTo(this.ds);
    this.text_sprite.x = this.x;
    this.text_sprite.y = this.y;
    this.text_sprite.alpha = 0;
  }

  redraw(i_combo) {
    if (i_combo > 10) {
      this.combo_sprite.setImage("odds_multi_" + 10);
    } else {
      this.combo_sprite.setImage("odds_multi_" + i_combo);
    }

    this.combo_sprite.alpha = 0;

    this.text_sprite.alpha = 0;

    this.show();
  }

  show() {
    if (this.text_sprite) {
      this.text_sprite.tweener
        .wait(1500)
        .fadeIn(50)
        .play();
    }

    if (this.combo_sprite) {
      this.combo_sprite.tweener
        .wait(1500)
        .fadeIn(50)
        .play();
    }
  }

  hide() {
    if (this.text_sprite) {
      this.text_sprite.tweener.fadeOut(50).play();
    }

    if (this.combo_sprite) {
      this.combo_sprite.tweener.fadeOut(50).play();
    }
  }

  remove() {
    if (this.text_sprite) {
      this.text_sprite.remove();
    }

    if (this.combo_sprite) {
      this.combo_sprite.remove();
    }
  }
};

const CurrentScoreSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.me_sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x - 70 * 0.7 * (8 - i);
      sprite.y = this.y;
      sprite.alpha = 0;
      this.me_sprites.push(sprite);
    });

    this.kabu_sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x - 70 * 0.7 * (8 - i);
      sprite.y = this.y;
      sprite.alpha = 0;
      this.kabu_sprites.push(sprite);
    });

    this.multi_sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x - 70 * 0.7 * (8 - i);
      sprite.y = this.y;
      sprite.alpha = 0;
      this.multi_sprites.push(sprite);
    });

    this.combo_sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x - 70 * 0.7 * (8 - i);
      sprite.y = this.y;
      sprite.alpha = 0;
      this.combo_sprites.push(sprite);
    });
  }

  redraw(current_scores) {
    const me_digits = String(current_scores[0]).split("");
    const kabu_digits = String(current_scores[1]).split("");
    const multi_digits = String(current_scores[2]).split("");
    const combo_digits = String(current_scores[3]).split("");

    const me_start_i = 8 - me_digits.length;
    _.forEach(this.me_sprites, (sprite, i) => {
      if (i < me_start_i) {
        sprite.setImage("dummy");
      } else {
        const digit = me_digits[i - me_start_i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 70;
        sprite.height = 70;
        sprite.alpha = 0;
      }
    });

    const kabu_start_i = 8 - kabu_digits.length;
    _.forEach(this.kabu_sprites, (sprite, i) => {
      if (i < kabu_start_i) {
        sprite.setImage("dummy");
      } else {
        const digit = kabu_digits[i - kabu_start_i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 70;
        sprite.height = 70;
        sprite.alpha = 0;
      }
    });

    const multi_start_i = 8 - multi_digits.length;
    _.forEach(this.multi_sprites, (sprite, i) => {
      if (i < multi_start_i) {
        sprite.setImage("dummy");
      } else {
        const digit = multi_digits[i - multi_start_i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 70;
        sprite.height = 70;
        sprite.alpha = 0;
      }
    });

    const combo_start_i = 8 - combo_digits.length;
    _.forEach(this.combo_sprites, (sprite, i) => {
      if (i < combo_start_i) {
        sprite.setImage("dummy");
      } else {
        const digit = combo_digits[i - combo_start_i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 70;
        sprite.height = 70;
        sprite.alpha = 0;
      }
    });

    this.show(current_scores);
  }

  show(current_scores) {
    _.forEach(this.me_sprites, sprite => {
      sprite.tweener
        .fadeIn(50)
        .wait(500)
        .fadeOut(50)
        .play();
    });

    _.forEach(this.kabu_sprites, sprite => {
      sprite.tweener
        .wait(500)
        .fadeIn(50)
        .wait(500)
        .fadeOut(50)
        .play();
    });

    if (current_scores[3] !== current_scores[2]) {
      _.forEach(this.multi_sprites, sprite => {
        sprite.tweener
          .wait(1000)
          .fadeIn(50)
          .wait(500)
          .fadeOut(50)
          .play();
      });

      _.forEach(this.combo_sprites, sprite => {
        sprite.tweener
          .wait(1500)
          .fadeIn(50)
          .play();
      });
    } else {
      _.forEach(this.multi_sprites, sprite => {
        sprite.tweener
          .wait(1000)
          .fadeIn(50)
          .play();
      });
    }

    if (current_scores[0] > 0) {
      SoundManager.playMusic("se_win", null, false);
    } else {
      SoundManager.playMusic("se_buta", null, false);
    }

    if (current_scores[1] > current_scores[0]) {
      setTimeout(() => {
        SoundManager.playMusic("se_win", null, false);
      }, 500);
    } else {
      setTimeout(() => {
        SoundManager.playMusic("se_buta", null, false);
      }, 500);
    }

    if (current_scores[2] > current_scores[1]) {
      setTimeout(() => {
        SoundManager.playMusic("se_multi", null, false);
      }, 1000);
    } else if (current_scores[2] === current_scores[1]) {
      setTimeout(() => {
        SoundManager.playMusic("se_buta", null, false);
      }, 1000);
    } else {
      setTimeout(() => {
        SoundManager.playMusic("se_hifumi", null, false);
      }, 1000);
    }

    if (current_scores[3] !== current_scores[2]) {
      setTimeout(() => {
        SoundManager.playMusic("voice_combo", null, false);
      }, 1500);
    }
  }

  hide() {
    _.forEach(this.me_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });

    _.forEach(this.kabu_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });

    _.forEach(this.multi_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });

    _.forEach(this.combo_sprites, sprite => {
      sprite.tweener.fadeOut(50).play();
    });
  }

  remove() {
    _.forEach(this.me_sprites, sprite => {
      sprite.remove();
    });

    _.forEach(this.kabu_sprites, sprite => {
      sprite.remove();
    });

    _.forEach(this.multi_sprites, sprite => {
      sprite.remove();
    });

    _.forEach(this.combo_sprites, sprite => {
      sprite.remove();
    });

    this.me_sprites = [];
    this.kabu_sprites = [];
    this.multi_sprites = [];
    this.combo_sprites = [];
  }
};

const TotalScoreSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x + 100 * 0.7 * i;
      sprite.y = this.y;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });
  }

  redraw(total_score) {
    const digits = String(total_score).split("");

    _.forEach(this.sprites, (sprite, i) => {
      if (i < digits.length) {
        const digit = digits[i];
        sprite.setImage("fude_n_" + digit);
      } else {
        sprite.setImage("dummy");
      }

      sprite.tweener.fadeIn(100).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const TimeSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x + 50 * 0.7 * i;
      sprite.y = this.y;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });
  }

  redraw(time) {
    const h = Math.floor(time / 60 / 60);
    const m = Math.floor(time / 60) % 60;
    const s = time % 60;

    const time_str = ("00" + h).slice(-2) + "c" + ("00" + m).slice(-2) + "c" + ("00" + s).slice(-2);
    const digits = String(time_str).split("");

    _.forEach(this.sprites, (sprite, i) => {
      if (i < digits.length) {
        const digit = digits[i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 50;
        sprite.height = 50;
      } else {
        sprite.setImage("dummy");
      }

      sprite.tweener.fadeIn(100).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const BetTimesSprites = class {
  constructor(ds, x, y) {
    this.ds = ds;
    this.x = x;
    this.y = y;

    this.calc();
  }

  calc() {
    this.sprites = [];
    _.times(8, i => {
      const sprite = Sprite("dummy").addChildTo(this.ds);
      sprite.x = this.x + 50 * 0.7 * i;
      sprite.y = this.y;
      sprite.alpha = 0;
      this.sprites.push(sprite);
    });
  }

  redraw(bet_times) {
    const digits = String(bet_times).split("");

    _.forEach(this.sprites, (sprite, i) => {
      if (i < digits.length) {
        const digit = digits[i];
        sprite.setImage("fude_n_" + digit);
        sprite.width = 50;
        sprite.height = 50;
      } else {
        sprite.setImage("dummy");
      }

      sprite.tweener.fadeIn(100).play();
    });
  }

  remove() {
    _.forEach(this.sprites, sprite => {
      sprite.remove();
    });

    this.sprites = [];
  }
};

const ResultSprites = class {
  constructor(ds) {
    this.ds = ds;

    this.calc();
  }

  calc() {
    this.bg_sprite = Sprite("bg_result").addChildTo(this.ds);
    this.bg_sprite.x = 320;
    this.bg_sprite.y = 480;
    this.bg_sprite.alpha = 0;

    this.rule_sprite = Sprite("dummy").addChildTo(this.ds);
    this.rule_sprite.x = 320;
    this.rule_sprite.y = 200;
    this.rule_sprite.alpha = 0;

    this.high_score_sprite = Sprite("high_score").addChildTo(this.ds);
    this.high_score_sprite.x = 550;
    this.high_score_sprite.y = 400;
    this.high_score_sprite.width = 400;
    this.high_score_sprite.height = 400;
    this.high_score_sprite.alpha = 0;

    this.score_sprite = Label("").addChildTo(this.ds);
    this.score_sprite.x = 120;
    this.score_sprite.y = 280;
    this.score_sprite.fontSize = 21;
    // this.score_sprite.fill = 'black';
    this.score_sprite.alpha = 0;

    this.time_sprite = Label("").addChildTo(this.ds);
    this.time_sprite.x = 320;
    this.time_sprite.y = 280;
    this.time_sprite.fontSize = 21;
    this.time_sprite.alpha = 0;

    this.bet_times_sprite = Label("").addChildTo(this.ds);
    this.bet_times_sprite.x = 420;
    this.bet_times_sprite.y = 280;
    this.bet_times_sprite.fontSize = 21;
    this.bet_times_sprite.alpha = 0;

    this.rank_sprite = Label("").addChildTo(this.ds);
    this.rank_sprite.x = 320;
    this.rank_sprite.y = 310;
    this.rank_sprite.fontSize = 21;
    this.rank_sprite.alpha = 0;

    this.line_sprite_1 = Sprite("line_h_3").addChildTo(this.ds);
    this.line_sprite_1.x = 320;
    this.line_sprite_1.y = 320;
    this.line_sprite_1.alpha = 0;

    this.max_combo_sprite = Label("").addChildTo(this.ds);
    this.max_combo_sprite.x = 120;
    this.max_combo_sprite.y = 340;
    this.max_combo_sprite.fontSize = 21;
    this.max_combo_sprite.alpha = 0;

    this.max_gain_sprite = Label("").addChildTo(this.ds);
    this.max_gain_sprite.x = 320;
    this.max_gain_sprite.y = 340;
    this.max_gain_sprite.fontSize = 21;
    this.max_gain_sprite.alpha = 0;

    this.average_gain_sprite = Label("").addChildTo(this.ds);
    this.average_gain_sprite.x = 420;
    this.average_gain_sprite.y = 340;
    this.average_gain_sprite.fontSize = 21;
    this.average_gain_sprite.alpha = 0;

    this.line_sprite_2 = Sprite("line_h_3").addChildTo(this.ds);
    this.line_sprite_2.x = 320;
    this.line_sprite_2.y = 360;
    this.line_sprite_2.alpha = 0;

    this.roll_pinzoro_sprite = Label("").addChildTo(this.ds);
    this.roll_pinzoro_sprite.x = 200;
    this.roll_pinzoro_sprite.y = 380;
    this.roll_pinzoro_sprite.fontSize = 21;
    this.roll_pinzoro_sprite.align = "left";
    this.roll_pinzoro_sprite.alpha = 0;

    this.roll_arashikabu_sprite = Label("").addChildTo(this.ds);
    this.roll_arashikabu_sprite.x = 250;
    this.roll_arashikabu_sprite.y = 380;
    this.roll_arashikabu_sprite.fontSize = 21;
    this.roll_arashikabu_sprite.align = "left";
    this.roll_arashikabu_sprite.alpha = 0;

    this.roll_kemono_sprite = Label("").addChildTo(this.ds);
    this.roll_kemono_sprite.x = 300;
    this.roll_kemono_sprite.y = 380;
    this.roll_kemono_sprite.fontSize = 21;
    this.roll_kemono_sprite.align = "left";
    this.roll_kemono_sprite.alpha = 0;

    this.roll_triple_seven_sprite = Label("").addChildTo(this.ds);
    this.roll_triple_seven_sprite.x = 350;
    this.roll_triple_seven_sprite.y = 380;
    this.roll_triple_seven_sprite.fontSize = 21;
    this.roll_triple_seven_sprite.align = "left";
    this.roll_triple_seven_sprite.alpha = 0;

    this.roll_zorome_sprite = Label("").addChildTo(this.ds);
    this.roll_zorome_sprite.x = 400;
    this.roll_zorome_sprite.y = 380;
    this.roll_zorome_sprite.fontSize = 21;
    this.roll_zorome_sprite.align = "left";
    this.roll_zorome_sprite.alpha = 0;

    this.roll_shigoro_sprite = Label("").addChildTo(this.ds);
    this.roll_shigoro_sprite.x = 450;
    this.roll_shigoro_sprite.y = 380;
    this.roll_shigoro_sprite.fontSize = 21;
    this.roll_shigoro_sprite.align = "left";
    this.roll_shigoro_sprite.alpha = 0;

    this.roll_hifumi_sprite = Label("").addChildTo(this.ds);
    this.roll_hifumi_sprite.x = 500;
    this.roll_hifumi_sprite.y = 380;
    this.roll_hifumi_sprite.fontSize = 21;
    this.roll_hifumi_sprite.align = "left";
    this.roll_hifumi_sprite.alpha = 0;

    this.roll_pinbasami_sprite = Label("").addChildTo(this.ds);
    this.roll_pinbasami_sprite.x = 200;
    this.roll_pinbasami_sprite.y = 410;
    this.roll_pinbasami_sprite.fontSize = 21;
    this.roll_pinbasami_sprite.align = "left";
    this.roll_pinbasami_sprite.alpha = 0;

    this.roll_me_sprite = Label("").addChildTo(this.ds);
    this.roll_me_sprite.x = 250;
    this.roll_me_sprite.y = 410;
    this.roll_me_sprite.fontSize = 21;
    this.roll_me_sprite.align = "left";
    this.roll_me_sprite.alpha = 0;

    this.roll_pin_sprite = Label("").addChildTo(this.ds);
    this.roll_pin_sprite.x = 300;
    this.roll_pin_sprite.y = 410;
    this.roll_pin_sprite.fontSize = 21;
    this.roll_pin_sprite.align = "left";
    this.roll_pin_sprite.alpha = 0;

    this.roll_nizou_sprite = Label("").addChildTo(this.ds);
    this.roll_nizou_sprite.x = 350;
    this.roll_nizou_sprite.y = 410;
    this.roll_nizou_sprite.fontSize = 21;
    this.roll_nizou_sprite.align = "left";
    this.roll_nizou_sprite.alpha = 0;

    this.roll_santa_sprite = Label("").addChildTo(this.ds);
    this.roll_santa_sprite.x = 400;
    this.roll_santa_sprite.y = 410;
    this.roll_santa_sprite.fontSize = 21;
    this.roll_santa_sprite.align = "left";
    this.roll_santa_sprite.alpha = 0;

    this.roll_yotsuya_sprite = Label("").addChildTo(this.ds);
    this.roll_yotsuya_sprite.x = 450;
    this.roll_yotsuya_sprite.y = 410;
    this.roll_yotsuya_sprite.fontSize = 21;
    this.roll_yotsuya_sprite.align = "left";
    this.roll_yotsuya_sprite.alpha = 0;

    this.roll_goke_sprite = Label("").addChildTo(this.ds);
    this.roll_goke_sprite.x = 500;
    this.roll_goke_sprite.y = 410;
    this.roll_goke_sprite.fontSize = 21;
    this.roll_goke_sprite.align = "left";
    this.roll_goke_sprite.alpha = 0;

    this.roll_roppou_sprite = Label("").addChildTo(this.ds);
    this.roll_roppou_sprite.x = 200;
    this.roll_roppou_sprite.y = 440;
    this.roll_roppou_sprite.fontSize = 21;
    this.roll_roppou_sprite.align = "left";
    this.roll_roppou_sprite.alpha = 0;

    this.roll_shichiken_sprite = Label("").addChildTo(this.ds);
    this.roll_shichiken_sprite.x = 250;
    this.roll_shichiken_sprite.y = 440;
    this.roll_shichiken_sprite.fontSize = 21;
    this.roll_shichiken_sprite.align = "left";
    this.roll_shichiken_sprite.alpha = 0;

    this.roll_oicho_sprite = Label("").addChildTo(this.ds);
    this.roll_oicho_sprite.x = 300;
    this.roll_oicho_sprite.y = 440;
    this.roll_oicho_sprite.fontSize = 21;
    this.roll_oicho_sprite.align = "left";
    this.roll_oicho_sprite.alpha = 0;

    this.roll_kabu_sprite = Label("").addChildTo(this.ds);
    this.roll_kabu_sprite.x = 350;
    this.roll_kabu_sprite.y = 440;
    this.roll_kabu_sprite.fontSize = 21;
    this.roll_kabu_sprite.align = "left";
    this.roll_kabu_sprite.alpha = 0;

    this.roll_pink_ribbon_sprite = Label("").addChildTo(this.ds);
    this.roll_pink_ribbon_sprite.x = 400;
    this.roll_pink_ribbon_sprite.y = 440;
    this.roll_pink_ribbon_sprite.fontSize = 21;
    this.roll_pink_ribbon_sprite.align = "left";
    this.roll_pink_ribbon_sprite.alpha = 0;

    this.roll_buta_sprite = Label("").addChildTo(this.ds);
    this.roll_buta_sprite.x = 450;
    this.roll_buta_sprite.y = 440;
    this.roll_buta_sprite.fontSize = 21;
    this.roll_buta_sprite.align = "left";
    this.roll_buta_sprite.alpha = 0;

    this.line_sprite_3 = Sprite("line_h_3").addChildTo(this.ds);
    this.line_sprite_3.x = 320;
    this.line_sprite_3.y = 470;
    this.line_sprite_3.alpha = 0;

    this.zone_bullet_time_sprite = Label("").addChildTo(this.ds);
    this.zone_bullet_time_sprite.x = 200;
    this.zone_bullet_time_sprite.y = 490;
    this.zone_bullet_time_sprite.fontSize = 21;
    this.zone_bullet_time_sprite.align = "left";
    this.zone_bullet_time_sprite.alpha = 0;

    this.zone_revolution_sprite = Label("").addChildTo(this.ds);
    this.zone_revolution_sprite.x = 400;
    this.zone_revolution_sprite.y = 490;
    this.zone_revolution_sprite.fontSize = 21;
    this.zone_revolution_sprite.align = "left";
    this.zone_revolution_sprite.alpha = 0;

    this.triple_seven_all_1_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_all_1_sprite.x = 200;
    this.triple_seven_all_1_sprite.y = 520;
    this.triple_seven_all_1_sprite.fontSize = 21;
    this.triple_seven_all_1_sprite.align = "left";
    this.triple_seven_all_1_sprite.alpha = 0;

    this.triple_seven_all_6_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_all_6_sprite.x = 300;
    this.triple_seven_all_6_sprite.y = 520;
    this.triple_seven_all_6_sprite.fontSize = 21;
    this.triple_seven_all_6_sprite.align = "left";
    this.triple_seven_all_6_sprite.alpha = 0;

    this.triple_seven_all_123_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_all_123_sprite.x = 400;
    this.triple_seven_all_123_sprite.y = 520;
    this.triple_seven_all_123_sprite.fontSize = 21;
    this.triple_seven_all_123_sprite.align = "left";
    this.triple_seven_all_123_sprite.alpha = 0;

    this.triple_seven_all_456_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_all_456_sprite.x = 500;
    this.triple_seven_all_456_sprite.y = 520;
    this.triple_seven_all_456_sprite.fontSize = 21;
    this.triple_seven_all_456_sprite.align = "left";
    this.triple_seven_all_456_sprite.alpha = 0;

    this.triple_seven_triplets_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_triplets_sprite.x = 200;
    this.triple_seven_triplets_sprite.y = 550;
    this.triple_seven_triplets_sprite.fontSize = 21;
    this.triple_seven_triplets_sprite.align = "left";
    this.triple_seven_triplets_sprite.alpha = 0;

    this.triple_seven_others_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_others_sprite.x = 300;
    this.triple_seven_others_sprite.y = 550;
    this.triple_seven_others_sprite.fontSize = 21;
    this.triple_seven_others_sprite.align = "left";
    this.triple_seven_others_sprite.alpha = 0;

    this.triple_seven_rollback_sprite = Label("").addChildTo(this.ds);
    this.triple_seven_rollback_sprite.x = 400;
    this.triple_seven_rollback_sprite.y = 550;
    this.triple_seven_rollback_sprite.fontSize = 21;
    this.triple_seven_rollback_sprite.align = "left";
    this.triple_seven_rollback_sprite.alpha = 0;

    this.egg_ambulance_sprite = Label("").addChildTo(this.ds);
    this.egg_ambulance_sprite.x = 500;
    this.egg_ambulance_sprite.y = 550;
    this.egg_ambulance_sprite.fontSize = 21;
    this.egg_ambulance_sprite.align = "left";
    this.egg_ambulance_sprite.alpha = 0;

    this.button_sprite_change_rule = Sprite("button_change_rule").addChildTo(this.ds);
    this.button_sprite_change_rule.x = 170;
    this.button_sprite_change_rule.y = 770;
    this.button_sprite_change_rule.alpha = 0;
    this.button_sprite_change_rule.setInteractive(true);

    this.button_sprite_change_rule.onclick = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      Audio.stopAllBGM();

      this.ds.exit({
        back: true
      });
    };

    this.button_sprite_change_rule.onpointover = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      this.button_sprite_change_rule.setImage("button_change_rule_hover");
      Audio.playSound("voice_back");
    };

    this.button_sprite_change_rule.onpointout = () => {
      this.button_sprite_change_rule.setImage("button_change_rule");
    };

    this.button_sprite_one_more = Sprite("button_one_more").addChildTo(this.ds);
    this.button_sprite_one_more.x = 320;
    this.button_sprite_one_more.y = 770;
    this.button_sprite_one_more.alpha = 0;
    this.button_sprite_one_more.setInteractive(true);

    this.button_sprite_one_more.onclick = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      Audio.stopAllBGM();

      this.ds.exit({
        rule: this.ds.rule
      });
    };

    this.button_sprite_one_more.onpointover = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      this.button_sprite_one_more.setImage("button_one_more_hover");
      Audio.playSound("voice_one_more");
    };

    this.button_sprite_one_more.onpointout = () => {
      this.button_sprite_one_more.setImage("button_one_more");
    };

    this.button_sprite_send = Sprite("button_send").addChildTo(this.ds);
    this.button_sprite_send.x = 470;
    this.button_sprite_send.y = 770;
    this.button_sprite_send.alpha = 0;
    this.button_sprite_send.setInteractive(true);

    this.button_sprite_send.onclick = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      const param = {
        name: name,
        score: this.score_sprite.text,
        time: this.time_sprite.text,
        bet_times: this.bet_times_sprite.text,
        max_combo: this.max_combo_sprite.text,
        max_gain: this.max_gain_sprite.text,
        average_gain: this.average_gain_sprite.text,
        stats: this.ds.stats,
        userAgent: navigator.userAgent,
        language: navigator.language
      };

      this.ds.inputNameSprites = new InputNameSprites(this.ds, param);
      this.ds.inputNameSprites.redraw();
      this.ds.mode = "input_name";
    };

    this.button_sprite_send.onpointover = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      this.button_sprite_send.setImage("button_send_hover");
      Audio.playSound("voice_ok");
    };

    this.button_sprite_send.onpointout = () => {
      this.button_sprite_send.setImage("button_send");
    };

    this.button_sprite_ranking = Sprite("button_ranking").addChildTo(this.ds);
    this.button_sprite_ranking.x = 470;
    this.button_sprite_ranking.y = 700;
    this.button_sprite_ranking.alpha = 0;
    this.button_sprite_ranking.setInteractive(true);

    this.button_sprite_ranking.onclick = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      let locale = "en";
      switch (navigator.language.split("-")[0]) {
        case "ja":
          locale = "ja";
          break;
      }

      window.open("https://llll-ll.com/" + locale + "/tin-tilo-rings_ranking.html", "_blank");
    };

    this.button_sprite_ranking.onpointover = () => {
      if (this.ds.mode !== "shown_result") {
        return;
      }

      this.button_sprite_ranking.setImage("button_ranking_hover");
      Audio.playSound("voice_ranking");
    };

    this.button_sprite_ranking.onpointout = () => {
      this.button_sprite_ranking.setImage("button_ranking");
    };
  }

  redraw(rule, elapsed_time, bet_times, total_score, stats, is_high_score) {
    this.rule_sprite.setImage(rule);
    this.rule_sprite.alpha = 0;

    this.score_sprite.text = total_score;

    const second = Math.floor(elapsed_time / 1000);
    const i_second_1 = Math.floor(second);
    const time = Rule.getTime(rule, i_second_1);
    const h = Math.floor(time / 60 / 60);
    const m = Math.floor(time / 60) % 60;
    const s = time % 60;
    const ms = elapsed_time % 1000;
    const time_str =
      ("00" + h).slice(-2) + ":" + ("00" + m).slice(-2) + ":" + ("00" + s).slice(-2) + "." + ("000" + ms).slice(-3);
    this.time_sprite.text = time_str;

    this.bet_times_sprite.text = bet_times;

    this.max_combo_sprite.text = stats.max_combo;
    this.max_gain_sprite.text = stats.max_gain;
    this.average_gain_sprite.text = Math.floor((total_score / bet_times) * 10) / 10;

    this.roll_pinzoro_sprite.text = stats.roll.pinzoro;
    this.roll_arashikabu_sprite.text = stats.roll.arashikabu;
    this.roll_kemono_sprite.text = stats.roll.kemono;
    this.roll_triple_seven_sprite.text = stats.roll.triple_seven;
    this.roll_zorome_sprite.text = stats.roll.zorome;
    this.roll_shigoro_sprite.text = stats.roll.shigoro;
    this.roll_hifumi_sprite.text = stats.roll.hifumi;
    this.roll_pinbasami_sprite.text = stats.roll.pinbasami;
    this.roll_me_sprite.text = stats.roll.me;
    this.roll_pin_sprite.text = stats.roll.pin;
    this.roll_nizou_sprite.text = stats.roll.nizou;
    this.roll_santa_sprite.text = stats.roll.santa;
    this.roll_yotsuya_sprite.text = stats.roll.yotsuya;
    this.roll_goke_sprite.text = stats.roll.goke;
    this.roll_roppou_sprite.text = stats.roll.roppou;
    this.roll_shichiken_sprite.text = stats.roll.shichiken;
    this.roll_oicho_sprite.text = stats.roll.oicho;
    this.roll_kabu_sprite.text = stats.roll.kabu;
    this.roll_pink_ribbon_sprite.text = stats.roll.pink_ribbon;
    this.roll_buta_sprite.text = stats.roll.buta;
    this.zone_bullet_time_sprite.text = stats.zone.bullet_time;
    this.zone_revolution_sprite.text = stats.zone.revolution;
    this.triple_seven_all_1_sprite.text = stats.triple_seven.all_1;
    this.triple_seven_all_6_sprite.text = stats.triple_seven.all_6;
    this.triple_seven_all_123_sprite.text = stats.triple_seven.all_123;
    this.triple_seven_all_456_sprite.text = stats.triple_seven.all_456;
    this.triple_seven_triplets_sprite.text = stats.triple_seven.triplets;
    this.triple_seven_others_sprite.text = stats.triple_seven.others;
    this.triple_seven_rollback_sprite.text = stats.triple_seven.rollback;
    this.egg_ambulance_sprite.text = stats.egg.ambulance;

    this.show(is_high_score);

    Network.getRank(rule, this.score_sprite.text, this.time_sprite.text, this.bet_times_sprite.text)
      .done(res => {
        this.rank_sprite.text = res;
      })
      .fail(res => {})
      .always(res => {});
  }

  show(is_high_score) {
    this.bg_sprite.tweener.fadeIn(200).play();
    this.rule_sprite.tweener.fadeIn(200).play();

    if (is_high_score) {
      const anime_1 = Tweener().by({ rotation: -30 }, 1000, "easeOutExpo");

      const anime_2 = Tweener().to({ scaleX: 0.5, scaleY: 0.5 }, 1000, "easeOutExpo");

      const anime_3 = Tweener().by({ x: -100, y: -100 }, 1000, "easeOutExpo");

      const anime_4 = Tweener().fade(0.8, 1200, "easeOutExpo");

      this.high_score_sprite.attach(anime_1);
      this.high_score_sprite.attach(anime_2);
      this.high_score_sprite.attach(anime_3);
      this.high_score_sprite.attach(anime_4);
    }

    this.score_sprite.tweener.fadeIn(200).play();
    this.time_sprite.tweener.fadeIn(200).play();
    this.bet_times_sprite.tweener.fadeIn(200).play();
    this.rank_sprite.tweener.fadeIn(200).play();
    this.line_sprite_1.tweener.fadeIn(200).play();
    this.max_combo_sprite.tweener.fadeIn(200).play();
    this.max_gain_sprite.tweener.fadeIn(200).play();
    this.average_gain_sprite.tweener.fadeIn(200).play();
    this.line_sprite_2.tweener.fadeIn(200).play();
    this.roll_pinzoro_sprite.tweener.fadeIn(200).play();
    this.roll_arashikabu_sprite.tweener.fadeIn(200).play();
    this.roll_kemono_sprite.tweener.fadeIn(200).play();
    this.roll_triple_seven_sprite.tweener.fadeIn(200).play();
    this.roll_zorome_sprite.tweener.fadeIn(200).play();
    this.roll_shigoro_sprite.tweener.fadeIn(200).play();
    this.roll_hifumi_sprite.tweener.fadeIn(200).play();
    this.roll_pinbasami_sprite.tweener.fadeIn(200).play();
    this.roll_me_sprite.tweener.fadeIn(200).play();
    this.roll_pin_sprite.tweener.fadeIn(200).play();
    this.roll_nizou_sprite.tweener.fadeIn(200).play();
    this.roll_santa_sprite.tweener.fadeIn(200).play();
    this.roll_yotsuya_sprite.tweener.fadeIn(200).play();
    this.roll_goke_sprite.tweener.fadeIn(200).play();
    this.roll_roppou_sprite.tweener.fadeIn(200).play();
    this.roll_shichiken_sprite.tweener.fadeIn(200).play();
    this.roll_oicho_sprite.tweener.fadeIn(200).play();
    this.roll_kabu_sprite.tweener.fadeIn(200).play();
    this.roll_pink_ribbon_sprite.tweener.fadeIn(200).play();
    this.roll_buta_sprite.tweener.fadeIn(200).play();
    this.line_sprite_3.tweener.fadeIn(200).play();
    this.zone_bullet_time_sprite.tweener.fadeIn(200).play();
    this.zone_revolution_sprite.tweener.fadeIn(200).play();
    this.triple_seven_all_1_sprite.tweener.fadeIn(200).play();
    this.triple_seven_all_6_sprite.tweener.fadeIn(200).play();
    this.triple_seven_all_123_sprite.tweener.fadeIn(200).play();
    this.triple_seven_all_456_sprite.tweener.fadeIn(200).play();
    this.triple_seven_triplets_sprite.tweener.fadeIn(200).play();
    this.triple_seven_others_sprite.tweener.fadeIn(200).play();
    this.triple_seven_rollback_sprite.tweener.fadeIn(200).play();
    this.egg_ambulance_sprite.tweener.fadeIn(200).play();

    this.button_sprite_change_rule.tweener.fadeIn(200).play();
    this.button_sprite_one_more.tweener.fadeIn(200).play();
    this.button_sprite_send.tweener.fadeIn(200).play();
    this.button_sprite_ranking.tweener.fadeIn(200).play();

    Audio.playSound("voice_result");
    setTimeout(() => {
      if (is_high_score) {
        Audio.playSound("voice_result_high_score");
      } else {
        Audio.playSound("voice_result_negi");
      }
    }, 1500);
  }

  hide() {
    this.bg_sprite.tweener.fadeOut(50).play();
    this.rule_sprite.tweener.fadeOut(50).play();
    this.high_score_sprite.tweener.fadeOut(50).play();
    this.score_sprite.tweener.fadeOut(50).play();
    this.time_sprite.tweener.fadeOut(50).play();
    this.bet_times_sprite.tweener.fadeOut(50).play();
    this.rank_sprite.tweener.fadeOut(50).play();
    this.line_sprite_1.tweener.fadeOut(50).play();
    this.max_combo_sprite.tweener.fadeOut(50).play();
    this.max_gain_sprite.tweener.fadeOut(50).play();
    this.average_gain_sprite.tweener.fadeOut(50).play();
    this.line_sprite_2.tweener.fadeOut(50).play();
    this.roll_pinzoro_sprite.tweener.fadeOut(50).play();
    this.roll_arashikabu_sprite.tweener.fadeOut(50).play();
    this.roll_kemono_sprite.tweener.fadeOut(50).play();
    this.roll_triple_seven_sprite.tweener.fadeOut(50).play();
    this.roll_zorome_sprite.tweener.fadeOut(50).play();
    this.roll_shigoro_sprite.tweener.fadeOut(50).play();
    this.roll_hifumi_sprite.tweener.fadeOut(50).play();
    this.roll_pinbasami_sprite.tweener.fadeOut(50).play();
    this.roll_me_sprite.tweener.fadeOut(50).play();
    this.roll_pin_sprite.tweener.fadeOut(50).play();
    this.roll_nizou_sprite.tweener.fadeOut(50).play();
    this.roll_santa_sprite.tweener.fadeOut(50).play();
    this.roll_yotsuya_sprite.tweener.fadeOut(50).play();
    this.roll_goke_sprite.tweener.fadeOut(50).play();
    this.roll_roppou_sprite.tweener.fadeOut(50).play();
    this.roll_shichiken_sprite.tweener.fadeOut(50).play();
    this.roll_oicho_sprite.tweener.fadeOut(50).play();
    this.roll_kabu_sprite.tweener.fadeOut(50).play();
    this.roll_pink_ribbon_sprite.tweener.fadeOut(50).play();
    this.roll_buta_sprite.tweener.fadeOut(50).play();
    this.line_sprite_3.tweener.fadeOut(50).play();
    this.zone_bullet_time_sprite.tweener.fadeOut(50).play();
    this.zone_revolution_sprite.tweener.fadeOut(50).play();
    this.triple_seven_all_1_sprite.tweener.fadeOut(50).play();
    this.triple_seven_all_6_sprite.tweener.fadeOut(50).play();
    this.triple_seven_all_123_sprite.tweener.fadeOut(50).play();
    this.triple_seven_all_456_sprite.tweener.fadeOut(50).play();
    this.triple_seven_triplets_sprite.tweener.fadeOut(50).play();
    this.triple_seven_others_sprite.tweener.fadeOut(50).play();
    this.triple_seven_rollback_sprite.tweener.fadeOut(50).play();
    this.egg_ambulance_sprite.tweener.fadeOut(50).play();

    this.button_sprite_change_rule.tweener.fadeOut(50).play();
    this.button_sprite_one_more.tweener.fadeOut(50).play();
    this.button_sprite_send.tweener.fadeOut(50).play();
    this.button_sprite_ranking.tweener.fadeOut(50).play();
  }

  remove() {
    this.bg_sprite.remove();
    this.rule_sprite.remove();
    this.high_score_sprite.remove();
    this.score_sprite.remove();
    this.time_sprite.remove();
    this.bet_times_sprite.remove();
    this.rank_sprite.remove();
    this.line_sprite_1.remove();
    this.max_combo_sprite.remove();
    this.max_gain_sprite.remove();
    this.average_gain_sprite.remove();
    this.line_sprite_2.remove();
    this.roll_pinzoro_sprite.remove();
    this.roll_arashikabu_sprite.remove();
    this.roll_kemono_sprite.remove();
    this.roll_triple_seven_sprite.remove();
    this.roll_zorome_sprite.remove();
    this.roll_shigoro_sprite.remove();
    this.roll_hifumi_sprite.remove();
    this.roll_pinbasami_sprite.remove();
    this.roll_me_sprite.remove();
    this.roll_pin_sprite.remove();
    this.roll_nizou_sprite.remove();
    this.roll_santa_sprite.remove();
    this.roll_yotsuya_sprite.remove();
    this.roll_goke_sprite.remove();
    this.roll_roppou_sprite.remove();
    this.roll_shichiken_sprite.remove();
    this.roll_oicho_sprite.remove();
    this.roll_kabu_sprite.remove();
    this.roll_pink_ribbon_sprite.remove();
    this.roll_buta_sprite.remove();
    this.line_sprite_3.remove();
    this.zone_bullet_time_sprite.remove();
    this.zone_revolution_sprite.remove();
    this.triple_seven_all_1_sprite.remove();
    this.triple_seven_all_6_sprite.remove();
    this.triple_seven_all_123_sprite.remove();
    this.triple_seven_all_456_sprite.remove();
    this.triple_seven_triplets_sprite.remove();
    this.triple_seven_others_sprite.remove();
    this.triple_seven_rollback_sprite.remove();
    this.egg_ambulance_sprite.remove();

    this.button_sprite_change_rule.remove();
    this.button_sprite_one_more.remove();
    this.button_sprite_send.remove();
    this.button_sprite_ranking.remove();
  }
};

const InputNameSprites = class {
  constructor(ds, param) {
    this.ds = ds;
    this.param = param;

    this.calc();
  }

  calc() {
    this.bg_sprite = Sprite("bg_result").addChildTo(this.ds);
    this.bg_sprite.x = 320;
    this.bg_sprite.y = 480;
    this.bg_sprite.alpha = 0;

    this.back_sprite = Sprite("button_back").addChildTo(this.ds);
    this.back_sprite.x = 100;
    this.back_sprite.y = 100;
    this.back_sprite.alpha = 0;
    this.back_sprite.setInteractive(true);

    this.back_sprite.onclick = () => {
      if (this.ds.mode !== "input_name") {
        return;
      }

      this.ds.prevent_click = true;
      setTimeout(() => {
        this.ds.prevent_click = false;
      }, 100);

      this.ds.mode = "shown_result";
    };

    this.back_sprite.onpointover = () => {
      if (this.ds.mode !== "input_name") {
        return;
      }

      this.sprite.setImage("button_back_hover");
      Audio.playSound("voice_back");
    };

    this.back_sprite.onpointout = () => {
      this.back_sprite.setImage("button_back_hover");
    };

    // TODO:名前入力

    this.button_sprite_send = Sprite("button_send").addChildTo(this.ds);
    this.button_sprite_send.x = 320;
    this.button_sprite_send.y = 770;
    this.button_sprite_send.alpha = 0;
    this.button_sprite_send.setInteractive(true);

    this.button_sprite_send.onclick = () => {
      if (this.ds.mode !== "input_name") {
        return;
      }

      this.param.name = "xyz";

      Network.sendRank(this.ds.rule, this.param).always(res => {
        Audio.stopAllBGM();

        this.ds.exit({
          rule: this.ds.rule
        });
      });
    };

    this.button_sprite_send.onpointover = () => {
      if (this.ds.mode !== "input_name") {
        return;
      }

      this.button_sprite_send.setImage("button_send_hover");
      Audio.playSound("voice_ok");
    };

    this.button_sprite_send.onpointout = () => {
      this.button_sprite_send.setImage("button_send");
    };
  }

  redraw() {
    this.show();
  }

  show() {
    this.bg_sprite.tweener.fadeIn(200).play();

    this.button_sprite_send.tweener.fadeIn(200).play();
  }

  hide() {
    this.bg_sprite.tweener.fadeOut(50).play();

    this.button_sprite_send.tweener.fadeOut(50).play();
  }

  remove() {
    this.bg_sprite.remove();

    this.button_sprite_send.remove();
  }
};
