/** get min, max, sum */
function minmaxsum(y) {
    var res = {};
    res.max = Number.MIN_VALUE;
    res.min = Number.MAX_VALUE;
    res.sum = 0;
    y.forEach(v => {
        if (v > res.max) {
            res.max = v;
        }
        if (v < res.min) {
            res.min = v;
        }
        res.sum += v;
    });
    res.mean = res.sum / y.length;
    return res;
}

/** calculate moments making use of pre-calculated characteristics */
function moment(t, c, moment) {
    var res = 0;
    t.forEach((v, idx) => {
        res += c.f[idx] * Math.pow(v, moment);
    });
    return res;
}

/** calculate autocorrelation for lag */
function autocorrelation(c, lag) {
    var res = 0;
    for (var i = 0; i < c.r.length - lag; i++) {
        res += (c.r_lift_avg[i]) * (c.r_lift_avg[i + lag]);
    }
    res /= c.sum_r_lifted_sq;
    return res;
}

/** indices of n largest / smallest values in array */
function indexOfNLargestSmallest(y, N) {

    if (N === undefined) N = 1;
    var tmp = y.concat().sort((a,b)=>a-b);
    // console.log("y  :", y);
    // console.log("tmp:", tmp);
    var res = {};
    res.lowest = [];
    var max = N;
    // console.log("max:", max);
    if (max > y.length) {
        max = y.length;
    }
    for (var i = 0; i < max; i++) {
        res.lowest.push(y.indexOf(tmp[i]));
    }
    res.highest = [];
    var min = y.length - N;
    if (min < 0) {
        min = 0;
    }
    // console.log("min:", min);
    for (var i = tmp.length - 1; i >= min; i--) {
        res.highest.push(y.indexOf(tmp[i]));
    }
    return res;
}



/** get base notions from time series (time t and observation r) */
function characteristics(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) "t must be non-null";
    if (t.length <= 0) "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) "r must be non-null";
    if (r.length <= 0) "r.length must be > 0";

    if (r.length !== t.length) "r and t must have same length";

    var res = {};

    /** document input */
    res.t = t;
    res.r = r;

    /** basic descriptive statistics */
    var mms = minmaxsum(r);
    res.r_min = mms.min;
    res.r_max = mms.max;
    res.r_sum = mms.sum;
    res.r_avg = mms.mean;

    /** lift into positive range */
    res.r_lift_min = [];
    r.forEach(v => { res.r_lift_min.push(v - res.r_min) });

    /** lift by mean */
    res.r_lift_avg = [];
    r.forEach(v => { res.r_lift_avg.push(v - res.r_avg) });
    res.sum_r_lifted_sq = 0;
    res.r_lift_avg.forEach(v => { res.sum_r_lifted_sq += v * v });

    /** distribution function */
    var sum_lifted = 0;
    res.r_lift_min.forEach(v => { sum_lifted += v; });
    res.f = [];
    res.r_lift_min.forEach(v => { res.f.push(v / sum_lifted); });

    /** moments 0 .. 3 */
    res.mon_0 = moment(t, res, 0);
    res.mon_1 = moment(t, res, 1);
    res.mon_2 = moment(t, res, 2);
    res.mon_3 = moment(t, res, 3);

    /** above / below avg count */
    res.r_above_avg_cnt = 0;
    res.r_below_avg_cnt = 0;
    res.r_lift_avg.forEach(v => {
        if (v >= res.r_avg) {
            res.r_above_avg_cnt++;
        } else {
            res.r_below_avg_cnt++;
        }
    });

    /** most important autocorrelation peaks */
    var ac = [];
    ac.push(1.0);
    for (var i = 1; i < r.length * 0.7; i++) {
        ac.push(autocorrelation(res, i));
    }
    res.ac = ac;
    var hlindex = indexOfNLargestSmallest(ac,3);
    res.ac_top_1 = hlindex.highest[0];
    res.ac_top_2 = hlindex.highest[1];
    res.ac_low_1 = hlindex.lowest[0];
    res.ac_low_2 = hlindex.lowest[1];
    return res;
}

export {
    minmaxsum, moment, autocorrelation, indexOfNLargestSmallest, characteristics
}