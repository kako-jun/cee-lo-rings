const Rule = {
  shuffle: array => {
    let n = array.length;
    while (n) {
      let i = Math.floor(Math.random() * n--);
      let t = array[n];
      array[n] = array[i];
      array[i] = t;
    }

    return array;
  },

  getReaches: (eyes1, eyes2) => {
    const reaches = [];

    _.times(11, i => {
      const alphabet = String.fromCharCode(97 + i);

      let eye1 = 0;
      let eye2 = 0;
      switch (alphabet) {
        case "a":
          eye1 = eyes1[0];
          eye2 = eyes2[0];
          break;
        case "b":
          eye1 = eyes1[1];
          eye2 = eyes2[1];
          break;
        case "c":
          eye1 = eyes1[2];
          eye2 = eyes2[2];
          break;
        case "d":
          eye1 = eyes1[3];
          eye2 = eyes2[3];
          break;
        case "e":
          eye1 = eyes1[4];
          eye2 = eyes2[4];
          break;
        case "f":
          eye1 = eyes1[2];
          eye2 = eyes2[1];
          break;
        case "g":
          eye1 = eyes1[3];
          eye2 = eyes2[2];
          break;
        case "h":
          eye1 = eyes1[4];
          eye2 = eyes2[3];
          break;
        case "i":
          eye1 = eyes1[0];
          eye2 = eyes2[1];
          break;
        case "j":
          eye1 = eyes1[1];
          eye2 = eyes2[2];
          break;
        case "k":
          eye1 = eyes1[2];
          eye2 = eyes2[3];
          break;
      }

      if (
        (eye1 === 1 && eye2 === 1) ||
        (eye1 === 3 && eye2 === 3) ||
        (eye1 === 6 && eye2 === 6) ||
        (eye1 === 7 && eye2 === 7) ||
        (eye1 === 0 && eye2 === 0) ||
        (eye1 === 2 && eye2 === 2) ||
        (eye1 === 4 && eye2 === 4) ||
        (eye1 === 5 && eye2 === 5) ||
        (eye1 === 8 && eye2 === 8) ||
        (eye1 === 9 && eye2 === 9) ||
        (eye1 === 4 && eye2 === 5) ||
        (eye1 === 5 && eye2 === 4) ||
        (eye1 === 4 && eye2 === 6) ||
        (eye1 === 6 && eye2 === 4) ||
        (eye1 === 5 && eye2 === 6) ||
        (eye1 === 6 && eye2 === 5) ||
        (eye1 === 1 && eye2 === 2) ||
        (eye1 === 2 && eye2 === 1) ||
        (eye1 === 1 && eye2 === 3) ||
        (eye1 === 3 && eye2 === 1) ||
        (eye1 === 2 && eye2 === 3) ||
        (eye1 === 3 && eye2 === 2)
      ) {
        reaches.push(alphabet);
      }
    });

    return reaches;
  },

  getZoneReaches: (eyes1, eyes2) => {
    const reaches = [];

    _.times(11, i => {
      const alphabet = String.fromCharCode(97 + i);

      let eye1 = 0;
      let eye2 = 0;
      switch (alphabet) {
        case "a":
          eye1 = eyes1[0];
          eye2 = eyes2[0];
          break;
        case "b":
          eye1 = eyes1[1];
          eye2 = eyes2[1];
          break;
        case "c":
          eye1 = eyes1[2];
          eye2 = eyes2[2];
          break;
        case "d":
          eye1 = eyes1[3];
          eye2 = eyes2[3];
          break;
        case "e":
          eye1 = eyes1[4];
          eye2 = eyes2[4];
          break;
        case "f":
          eye1 = eyes1[2];
          eye2 = eyes2[1];
          break;
        case "g":
          eye1 = eyes1[3];
          eye2 = eyes2[2];
          break;
        case "h":
          eye1 = eyes1[4];
          eye2 = eyes2[3];
          break;
        case "i":
          eye1 = eyes1[0];
          eye2 = eyes2[1];
          break;
        case "j":
          eye1 = eyes1[1];
          eye2 = eyes2[2];
          break;
        case "k":
          eye1 = eyes1[2];
          eye2 = eyes2[3];
          break;
      }

      if (eye1 === 1 && eye2 === 1) {
        reaches.push("110");
      } else if (eye1 === 3 && eye2 === 5) {
        reaches.push("359");
      } else if (eye1 === 4 && eye2 === 2) {
        reaches.push("427");
      } else if (eye1 === 4 && eye2 === 8) {
        reaches.push("488");
      } else if (eye1 === 5 && eye2 === 0) {
        reaches.push("501");
      } else if (eye1 === 5 && eye2 === 6) {
        reaches.push("564");
      } else if (eye1 === 7 && eye2 === 1) {
        reaches.push("712");
      } else if (eye1 === 8 && eye2 === 9) {
        reaches.push("893");
      } else if (eye1 === 9 && eye2 === 3) {
        reaches.push("931");
      }
    });

    return reaches;
  },

  calcTuples: (eyes1, eyes2, eyes3) => {
    const tuples = [
      [eyes1[0], eyes2[0], eyes3[0]],
      [eyes1[1], eyes2[1], eyes3[1]],
      [eyes1[2], eyes2[2], eyes3[2]],
      [eyes1[3], eyes2[3], eyes3[3]],
      [eyes1[4], eyes2[4], eyes3[4]],
      [eyes1[2], eyes2[1], eyes3[0]],
      [eyes1[3], eyes2[2], eyes3[1]],
      [eyes1[4], eyes2[3], eyes3[2]],
      [eyes1[0], eyes2[1], eyes3[2]],
      [eyes1[1], eyes2[2], eyes3[3]],
      [eyes1[2], eyes2[3], eyes3[4]]
    ];

    return tuples;
  },

  getZoneRolls: tuples => {
    const rolls = [];

    _.forEach(tuples, tuple => {
      if (tuple[0] === 1 && tuple[1] === 1 && tuple[2] === 0) {
        rolls.push("110");
      } else if (tuple[0] === 3 && tuple[1] === 5 && tuple[2] === 9) {
        rolls.push("359");
      } else if (tuple[0] === 4 && tuple[1] === 8 && tuple[2] === 8) {
        rolls.push("488");
      } else if (tuple[0] === 4 && tuple[1] === 2 && tuple[2] === 7) {
        rolls.push("427");
      } else if (tuple[0] === 5 && tuple[1] === 0 && tuple[2] === 1) {
        rolls.push("501");
      } else if (tuple[0] === 5 && tuple[1] === 6 && tuple[2] === 4) {
        rolls.push("564");
      } else if (tuple[0] === 7 && tuple[1] === 1 && tuple[2] === 2) {
        rolls.push("712");
      } else if (tuple[0] === 8 && tuple[1] === 9 && tuple[2] === 3) {
        rolls.push("893");
      } else if (tuple[0] === 9 && tuple[1] === 3 && tuple[2] === 1) {
        rolls.push("931");
      }
    });

    return rolls;
  },

  isAmbulance: tuples => {
    const founds = _.map(tuples, tuple => {
      const eye = "" + tuple[0] + tuple[1] + tuple[2];
      switch (eye) {
        case "119":
        case "911":
        case "120":
        case "112":
          return true;
      }

      return false;
    });

    return _.some(founds);
  },

  calcMods: tuples => {
    const mods = _.map(tuples, tuple => {
      return (tuple[0] + tuple[1] + tuple[2]) % 10;
    });

    return mods;
  },

  calcScores: (tuples, mods, revolution) => {
    const scores = [];
    _.times(11, i => {
      scores.push({
        id: String.fromCharCode(97 + i),
        eye: "" + tuples[i][0] + tuples[i][1] + tuples[i][2],
        tuple: tuples[i],
        mod: mods[i],
        won: false,
        roll: ""
      });
    });

    _.forEach(tuples, (tuple, i) => {
      const score = scores[i];
      const mod = mods[i];

      _.forEach(RollTableMulti, roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true;
            score.roll = roll;
          }
        }
      });
    });

    _.forEach(tuples, (tuple, i) => {
      const score = scores[i];
      const mod = mods[i];

      _.forEach(RollTableMe, roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true;
            score.roll = roll;
          }
        }
      });
    });

    _.forEach(tuples, (tuple, i) => {
      const score = scores[i];
      const mod = mods[i];

      _.forEach(RollTableKabu, roll => {
        if (!score.won) {
          if (roll.judge(tuple, mod)) {
            score.won = true;
            score.roll = roll;
          }
        }
      });
    });

    let sum = 0;
    _.forEach(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "me") {
          const gain = score.roll.calcGain(sum, score.tuple, score.mod);
          sum += gain;

          score.gain = gain;
          score.sum = sum;
        }
      }
    });

    _.forEach(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "kabu") {
          const gain = score.roll.calcGain(sum, score.tuple, score.mod);
          sum += gain;

          score.gain = gain;
          score.sum = sum;
        }
      }
    });

    if (sum === 0) {
      sum = 1;
    }

    _.forEach(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "multi") {
          let gain = score.roll.calcGain(sum, score.tuple, score.mod);

          if (gain > 9999) {
            gain = 9999;
          } else if (gain < -9999) {
            gain = -9999;
          }

          if (revolution) {
            gain *= -1;
          }

          sum = gain;

          score.gain = gain;
          score.sum = sum;
        }
      }
    });

    return scores;
  },

  calcCurrentScores: (scores, i_combo) => {
    const me_scores = _.filter(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "me") {
          return true;
        }
      }

      return false;
    });

    let me_sum = 0;
    if (me_scores.length > 0) {
      me_sum = _.max(me_scores, score => {
        return score.sum;
      }).sum;
    }

    const kabu_scores = _.filter(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "kabu") {
          return true;
        }
      }

      return false;
    });

    let kabu_sum = me_sum;
    if (kabu_scores.length > 0) {
      kabu_sum = _.max(kabu_scores, score => {
        return score.sum;
      }).sum;
    }

    const multi_scores = _.filter(scores, score => {
      if (score.won) {
        if (Rule.getStep(score) === "multi") {
          return true;
        }
      }

      return false;
    });

    let multi_sum = kabu_sum;
    if (multi_scores.length > 0) {
      multi_sum = _.last(multi_scores).sum;
    }

    return [me_sum, kabu_sum, multi_sum, 0];
  },

  addComboScore: (current_scores, i_combo) => {
    let combo_sum = current_scores[2];
    if (i_combo >= 2) {
      if (i_combo > 10) {
        combo_sum *= 10;
      } else {
        combo_sum *= i_combo;
      }

      if (combo_sum > 9999) {
        combo_sum = 9999;
      } else if (combo_sum < -9999) {
        combo_sum = -9999;
      }
    }

    return [current_scores[0], current_scores[1], current_scores[2], combo_sum];
  },

  calcTotalScore: (total_score, current_scores) => {
    return total_score + current_scores[3];
  },

  isMultiWon: scores => {
    const founds = _.map(scores, score => {
      if (score.won && score.roll.f === "multi") {
        return true;
      }

      return false;
    });

    return _.some(founds);
  },

  isTripleSeven: scores => {
    const rolls = _.map(scores, score => {
      return score.roll;
    });

    const found = _.find(rolls, roll => {
      return roll.name === "triple_seven";
    });

    if (found) {
      return true;
    }

    return false;
  },

  getTripleSevenEffect: (rollback_stock, stats) => {
    let ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let ring2_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let ring3_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const r = _.random(0, 99);
    if (r < 5) {
      // 5%
      ring1_ns = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      ring2_ns = ring1_ns;
      ring3_ns = ring1_ns;
      stats.triple_seven.all_1++;
    } else if (r < 10) {
      // 5%
      ring1_ns = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
      ring2_ns = ring1_ns;
      ring3_ns = ring1_ns;
      stats.triple_seven.all_6++;
    } else if (r < 15) {
      // 5%
      ring1_ns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      ring2_ns = ring1_ns;
      ring3_ns = ring1_ns;
      stats.triple_seven.triplets++;
    } else if (r < 20) {
      // 5%
      ring1_ns = Rule.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      ring2_ns = ring1_ns;
      ring3_ns = ring1_ns;
      stats.triple_seven.triplets++;
    } else if (r < 30) {
      // 10%
      ring1_ns = _.union(Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), [7, 8, 9]);
      ring2_ns = _.union(Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), [7, 8, 9]);
      ring3_ns = _.union(Rule.shuffle([0, 1, 2, 3, 4, 5, 6]), [7, 8, 9]);
      stats.triple_seven.others++;
    } else if (r < 40) {
      // 10%
      ring1_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1]);
      ring2_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1]);
      ring3_ns = Rule.shuffle([1, 2, 3, 1, 2, 3, 1, 2, 3, 1]);
      stats.triple_seven.all_123++;
    } else if (r < 50) {
      // 10%
      ring1_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6]);
      ring2_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6]);
      ring3_ns = Rule.shuffle([4, 5, 6, 4, 5, 6, 4, 5, 6, 6]);
      stats.triple_seven.all_456++;
    } else {
      // 50%
      rollback_stock++;
      if (rollback_stock > 3) {
        rollback_stock = 1;
      }
    }

    return {
      ring1_ns: ring1_ns,
      ring2_ns: ring2_ns,
      ring3_ns: ring3_ns,
      rollback_stock: rollback_stock,
      stats: stats
    };
  },

  isPinkRibbon: scores => {
    const rolls = _.map(scores, score => {
      return score.roll;
    });

    const found = _.find(rolls, roll => {
      return roll.name === "pink_ribbon";
    });

    if (found) {
      return true;
    }

    return false;
  },

  getStep: score => {
    if (score.roll.name === "pink_ribbon" || score.roll.name === "pinbasami" || score.roll.name === "me") {
      return "me";
    } else if (score.roll.f === "add") {
      return "kabu";
    } else {
      return "multi";
    }
  },

  getNextSpeed: (speed, current_score) => {
    let next_speed = speed;
    if (current_score < 0) {
      // -∞ - -1
      if (speed < 2) {
      } else if (speed >= 2 && speed < 4) {
        next_speed--;
      } else if (speed >= 4 && speed < 6) {
        next_speed--;
        next_speed--;
      } else if (speed >= 6 && speed < 8) {
        next_speed--;
        next_speed--;
        next_speed--;
      } else if (speed >= 8 && speed < 10) {
        next_speed--;
        next_speed--;
        next_speed--;
        next_speed--;
      } else if (speed >= 10) {
        next_speed--;
        next_speed--;
        next_speed--;
        next_speed--;
        next_speed--;
      }
    } else if (current_score < 50) {
      // 0 - 49
      if (speed < 2) {
        next_speed++;
      } else if (speed >= 2 && speed < 4) {
      } else if (speed >= 4 && speed < 6) {
        next_speed--;
      } else if (speed >= 6 && speed < 8) {
        next_speed--;
        next_speed--;
      } else if (speed >= 8 && speed < 10) {
        next_speed--;
        next_speed--;
        next_speed--;
      } else if (speed >= 10) {
        next_speed--;
        next_speed--;
        next_speed--;
        next_speed--;
      }
    } else if (current_score < 100) {
      // 50 - 99
      if (speed < 2) {
        next_speed++;
      } else if (speed >= 2 && speed < 4) {
        next_speed++;
      } else if (speed >= 4 && speed < 6) {
      } else if (speed >= 6 && speed < 8) {
        next_speed--;
      } else if (speed >= 8 && speed < 10) {
        next_speed--;
        next_speed--;
      } else if (speed >= 10) {
        next_speed--;
        next_speed--;
        next_speed--;
      }
    } else if (current_score >= 100) {
      // 100 - ∞
      if (speed < 2) {
        next_speed++;
      } else if (speed >= 2 && speed < 4) {
        next_speed++;
      } else if (speed >= 4 && speed < 6) {
        next_speed++;
      } else if (speed >= 6 && speed < 8) {
        next_speed++;
      } else if (speed >= 8 && speed < 10) {
        next_speed++;
      } else if (speed >= 10) {
      }
    }

    return next_speed;
  },

  getTime: (rule, i_second_1) => {
    let left = 0;
    switch (rule) {
      case "rule_1_2943":
      case "rule_1_8390":
      case "rule_1_37654":
      case "rule_2_2943":
      case "rule_2_8390":
      case "rule_2_37654":
        left = i_second_1;
        if (left < 0) {
          left = 0;
        }

        return left;
      case "rule_3_0409":
        left = 60 * 4 + 9 - i_second_1;
        if (left < 0) {
          left = 0;
        }

        return left;
      case "rule_3_2009":
        left = 60 * 20 + 9 - i_second_1;
        if (left < 0) {
          left = 0;
        }

        return left;
      case "rule_3_6819":
        left = 60 * 68 + 19 - i_second_1;
        if (left < 0) {
          left = 0;
        }

        return left;
    }
  },

  isAchieved: (rule, elapsed_time, total_score) => {
    switch (rule) {
      case "rule_1_2943":
      case "rule_2_2943":
        if (total_score >= 2943) {
          // if (total_score >= 1) {
          return true;
        }
        break;
      case "rule_1_8390":
      case "rule_2_8390":
        if (total_score >= 8390) {
          return true;
        }
        break;
      case "rule_1_37654":
      case "rule_2_37654":
        if (total_score >= 37654) {
          return true;
        }
        break;
      case "rule_3_0409":
        if (elapsed_time >= (60 * 4 + 9) * 1000) {
          // if (elapsed_time >= 1 * 1000) {
          return true;
        }
        break;
      case "rule_3_2009":
        if (elapsed_time >= (60 * 20 + 9) * 1000) {
          return true;
        }
        break;
      case "rule_3_6819":
        if (elapsed_time >= (60 * 68 + 19) * 1000) {
          return true;
        }
        break;
    }

    return false;
  },

  updateStats: (before, value) => {
    if (value > before) {
      before = value;
    }
  }
};
