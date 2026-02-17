const Network = {
  // serverRoot: 'http://localhost:4201/',
  serverRoot: "https://the-system.llll-ll.com/",

  getRank: (rule, score, time, bet_times) => {
    const dfd = $.Deferred();

    $.ajax({
      url: Network.serverRoot + "api/rankings/tin-tilo-rings/" + rule,
      type: "GET",
      cache: false,
      dataType: "json"
    })
      .done(res => {
        const entries = _.map(res, entry => {
          return {
            score: entry.score,
            time: entry.time,
            bet_times: entry.bet_times
          };
        });

        let rank = 0;
        if (entries.length > 0) {
          switch (rule) {
            case "rule_1_2943":
            case "rule_1_8390":
            case "rule_1_37654": {
              const sorted = _.sortBy(entries, "time");

              rank = _.findIndex(sorted, entry => {
                return time <= entry.time;
              });

              if (rank < 0) {
                if (time < _.min(sorted, "time").time) {
                  rank = 0;
                } else {
                  rank = sorted.length;
                }
              }
              break;
            }
            case "rule_2_2943":
            case "rule_2_8390":
            case "rule_2_37654": {
              const sorted = _.sortBy(entries, entry => {
                return Number(entry.bet_times);
              });

              rank = _.findIndex(sorted, entry => {
                return bet_times <= Number(entry.bet_times);
              });

              if (rank < 0) {
                const min = _.min(sorted, entry => {
                  return Number(entry.bet_times);
                });

                if (bet_times < Number(min.bet_times)) {
                  rank = 0;
                } else {
                  rank = sorted.length;
                }
              }
              break;
            }
            case "rule_3_0409":
            case "rule_3_2009":
            case "rule_3_6819": {
              const sorted = _.sortBy(entries, entry => {
                return Number(entry.score) * -1;
              });

              rank = _.findIndex(sorted, entry => {
                return score >= Number(entry.score);
              });

              if (rank < 0) {
                const max = _.max(sorted, entry => {
                  return Number(entry.score);
                });

                if (score > Number(max.score)) {
                  rank = 0;
                } else {
                  rank = sorted.length;
                }
              }
              break;
            }
          }
        }

        dfd.resolve(rank + 1);
      })
      .fail(res => {
        dfd.reject();
      })
      .always(res => {});

    return dfd.promise();
  },

  sendRank: (rule, param) => {
    const dfd = $.Deferred();

    const now = new Date();
    const year = now.getFullYear();
    const mon = ("00" + (now.getMonth() + 1)).slice(-2);
    const date = ("00" + now.getDate()).slice(-2);
    const hour = ("00" + now.getHours()).slice(-2);
    const min = ("00" + now.getMinutes()).slice(-2);
    const sec = ("00" + now.getSeconds()).slice(-2);
    const dt = year + "-" + mon + "-" + date + " " + hour + ":" + min + ":" + sec;

    $.ajax({
      url: "https://ipinfo.io",
      dataType: "jsonp"
    })
      .done(res => {
        $.ajax({
          url: Network.serverRoot + "api/rankings/tin-tilo-rings/" + rule + "/entries",
          data: {
            dt: dt,
            name: _.escape(param.name),
            score: _.escape(param.score),
            time: _.escape(param.time),
            bet_times: _.escape(param.bet_times),
            max_combo: _.escape(param.max_combo),
            max_gain: _.escape(param.max_gain),
            average_gain: _.escape(param.average_gain),
            stats: param.stats,
            userAgent: _.escape(param.userAgent),
            language: _.escape(param.language),
            info: res
          },
          type: "POST",
          cache: false,
          dataType: "json"
        })
          .done(res => {
            dfd.resolve();
          })
          .fail(res => {
            dfd.reject();
          })
          .always(res => {});
      })
      .fail(res => {
        dfd.reject();
      })
      .always(res => {});

    return dfd.promise();
  },

  shot: () => {
    const date = new Date();
    let format = "YYYY-MM-DD_hh-mm-ss";
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ("0" + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ("0" + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
    const filename = "screenshot_tin-tilo-rings_" + format + ".png";

    const canvas = document.getElementsByTagName("canvas")[0];
    const base64 = canvas.toDataURL("image/png");

    if (_.contains(navigator.userAgent, "Android")) {
      const savedir = $.getProcessPath();
      const fullpath = savedir + "/screenshots/" + filename;
      require("fs").writeFile(fullpath, base64, "base64", () => {});
    } else {
      const bin = atob(base64.replace(/^.*,/, ""));
      const buffer = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
      }

      const blob = new Blob([buffer.buffer], { type: "image/png" });
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        const a = document.createElement("a");
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.click();
      }
    }
  }
};
