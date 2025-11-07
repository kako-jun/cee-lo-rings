
const Audio = {

  audios: {},
  current_BGM_id: 'bgm_1',

  loopPlay: (id, audio, length) => {
    audio.play();
    audio.currentTime = 0;
    setTimeout(() => {
      if (Audio.audios[id]) {
        Audio.loopPlay(id, audio, length);
      }
    }, length);
  },

  playBGM: (id) => {
    const audio = BGMs[id].audio;
    const length = BGMs[id].length;

    audio.volume = BGMs[id].volume;

    if (id.split('_')[0] === 'bgm') {
      Audio.stopBGM('bgm_1');
      Audio.stopBGM('bgm_2');
      Audio.stopBGM('bgm_3');
      Audio.stopBGM('bgm_4');
    }

    Audio.audios[id] = audio;
    Audio.loopPlay(id, audio, length);
  },

  stopBGM: (id) => {
    if (Audio.audios[id]) {
      Audio.audios[id].pause();
      delete Audio.audios[id];
    }
  },

  stopAllBGM: () => {
    Audio.stopBGM('bgm_1');
    Audio.stopBGM('bgm_2');
    Audio.stopBGM('bgm_3');
    Audio.stopBGM('bgm_4');
    Audio.stopBGM('bgm_result');
    Audio.stopBGM('se_rotate');
  },

  changeBGM: () => {
    let n = Number(Audio.current_BGM_id.split('_')[1]);
    n++;
    if (n > 4) {
      n = 1;
    }

    const id = 'bgm_' + n;
    Audio.current_BGM_id = id;
    Audio.playBGM(id);
  },

  changeBGMVolume: (volume) => {
    BGMs['bgm_1'].audio.volume = volume;
    BGMs['bgm_2'].audio.volume = volume;
    BGMs['bgm_3'].audio.volume = volume;
    BGMs['bgm_4'].audio.volume = volume;
  },

  playSound: (id) => {
    const audio = BGMs[id].audio;
    audio.volume = BGMs[id].volume;
    audio.play();
  },

};
