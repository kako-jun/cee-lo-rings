const RollTableMulti = [
  {
    name: "pinzoro",
    desc: "111",
    rule: "chinchirorin",
    f: "multi",
    odds: 5,
    judge: (tuple, mod) => {
      if (tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 1) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * 5;
    }
  },
  {
    name: "arashikabu",
    desc: "333",
    rule: "kabu",
    f: "multi",
    odds: 5,
    judge: (tuple, mod) => {
      if (tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 3) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * 3;
    }
  },
  {
    name: "kemono",
    desc: "666",
    rule: "imported",
    f: "multi",
    odds: -6,
    judge: (tuple, mod) => {
      if (tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 6) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * -6;
    }
  },
  {
    name: "triple_seven",
    desc: "777",
    rule: "imported",
    f: "multi",
    odds: 3,
    judge: (tuple, mod) => {
      if (tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] === 7) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * 3;
    }
  },
  {
    name: "zorome",
    desc: "000, 222, 444, 555, 888, 999",
    rule: "chinchirorin",
    f: "multi",
    odds: 3,
    judge: (tuple, mod) => {
      if (tuple[0] === tuple[1] && tuple[1] === tuple[2] && tuple[0] !== 1 && tuple[0] !== 3) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * 3;
    }
  },
  {
    name: "shigoro",
    desc: "456",
    rule: "chinchirorin",
    f: "multi",
    odds: 2,
    judge: (tuple, mod) => {
      tuple = _.sortBy(tuple, n => {
        return n;
      });
      if (tuple[0] === 4 && tuple[1] === 5 && tuple[2] === 6) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * 2;
    }
  },
  {
    name: "hifumi",
    desc: "",
    rule: "chinchirorin",
    f: "multi",
    odds: -2,
    judge: (tuple, mod) => {
      tuple = _.sortBy(tuple, n => {
        return n;
      });
      if (tuple[0] === 1 && tuple[1] === 2 && tuple[2] === 3) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return src * -2;
    }
  }
];

const RollTableMe = [
  {
    name: "pink_ribbon",
    desc: "101",
    rule: "imported",
    f: "add",
    odds: 10,
    judge: (tuple, mod) => {
      if (tuple[0] === 1 && tuple[1] === 0 && tuple[2] === 1) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 10;
    }
  },
  {
    name: "pinbasami",
    desc: "1X1",
    rule: "kabu",
    f: "add",
    odds: null,
    judge: (tuple, mod) => {
      if (tuple[0] === 1 && tuple[1] !== 1 && tuple[2] === 1) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return tuple[1];
    }
  },
  {
    name: "me",
    desc: "",
    rule: "chinchirorin",
    f: "add",
    odds: null,
    judge: (tuple, mod) => {
      tuple = _.sortBy(tuple, n => {
        return n;
      });
      if (tuple[0] === tuple[1] && tuple[1] !== tuple[2] && tuple[2] >= 2) {
        return true;
      } else if (tuple[0] !== tuple[1] && tuple[1] === tuple[2] && tuple[0] >= 2) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      tuple = _.sortBy(tuple, n => {
        return n;
      });
      if (tuple[0] === tuple[1] && tuple[1] !== tuple[2]) {
        return tuple[2];
      } else if (tuple[0] !== tuple[1] && tuple[1] === tuple[2]) {
        return tuple[0];
      }
    }
  }
];

const RollTableKabu = [
  {
    name: "pin",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 1,
    judge: (tuple, mod) => {
      if (mod === 1) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 1;
    }
  },
  {
    name: "nizou",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 2,
    judge: (tuple, mod) => {
      if (mod === 2) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 2;
    }
  },
  {
    name: "santa",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 3,
    judge: (tuple, mod) => {
      if (mod === 3) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 3;
    }
  },
  {
    name: "yotsuya",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 4,
    judge: (tuple, mod) => {
      if (mod === 4) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 4;
    }
  },
  {
    name: "goke",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 5,
    judge: (tuple, mod) => {
      if (mod === 5) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 5;
    }
  },
  {
    name: "roppou",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 6,
    judge: (tuple, mod) => {
      if (mod === 6) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 6;
    }
  },
  {
    name: "shichiken",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 7,
    judge: (tuple, mod) => {
      if (mod === 7) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 7;
    }
  },
  {
    name: "oicho",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 8,
    judge: (tuple, mod) => {
      if (mod === 8) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 8;
    }
  },
  {
    name: "kabu",
    desc: "",
    rule: "kabu",
    f: "add",
    odds: 9,
    judge: (tuple, mod) => {
      if (mod === 9) {
        return true;
      }

      return false;
    },
    calcGain: (src, tuple, mod) => {
      return 9;
    }
  }
];
