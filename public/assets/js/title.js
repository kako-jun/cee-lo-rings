
phina.globalize();

phina.main(() => {
  const app = GameApp({
    fps: 60,
    startLabel: 'title',
    assets: Assets,
    scenes: Scenes,
    width: 640,
    height: 960,
  });

  // app.enableStats();
  app.run();
});

phina.define('TitleScene', {
  superClass: 'DisplayScene',
  init: function (param) {
    this.superInit();

    this.backgroundColor = '#732121';

    this.mode = 'first';

    if (param.rule) {
      setTimeout(() => {
        this.exit({
          rule: param.rule,
        });
      }, 500);
    } else {
      this.titleSprite = new TitleSprite(this);
      this.titleSprite.show();

      if (param.back) {
        setTimeout(() => {
          this.infoSprite = new InfoSprite(this, 606, 30);
          this.infoSprite.show();
          this.rulesSprite = new RulesSprite(this, 120, 480);
          this.rulesSprite.show();
          this.mode = 'select_rule';
        }, 500);
      } else {
        setTimeout(() => {
          SoundManager.playMusic('voice_chin', null, false);
          setTimeout(() => {
            SoundManager.playMusic('voice_chiro', null, false);
            setTimeout(() => {
              SoundManager.playMusic('voice_rin', null, false);
            }, 600);
          }, 600);
        }, 500);
      }
    }
  },

  update: function (app) {
    switch (this.mode) {
      case 'first':
        break;
      case 'select_rule':
        break;
    }
  },

  onclick: function () {
    this.changeMode();
  },

  changeMode: function () {
    switch (this.mode) {
      case 'first':
        this.infoSprite = new InfoSprite(this, 606, 30);
        this.infoSprite.show();
        this.rulesSprite = new RulesSprite(this, 120, 480);
        this.rulesSprite.show();
        this.mode = 'select_rule';
        break;
      case 'select_rule':
        break;
    }
  },
});
