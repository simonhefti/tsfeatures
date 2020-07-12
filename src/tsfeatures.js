import LM from 'ml-levenberg-marquardt';

const IGREG2 = 2299161;
const IGREG1 = (15 + 31 * (10 + 12 * 1582));

/** get version info*/
function version() {
    return "v0.1.5";
}

function polynomial_1([p0, p1]) {
    return t => p0 + p1 * t;
}
function polynomial_2([p0, p1, p2]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2);
}
function polynomial_3([p0, p1, p2, p3]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3);
}
function polynomial_4([p0, p1, p2, p3, p4]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3) + p4 * Math.pow(t, 4);
}
function polynomial_5([p0, p1, p2, p3, p4, p5]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3) + p4 * Math.pow(t, 4) + p5 * Math.pow(t, 5);
}

function fit_polynomial(x, y, polynomial, options) {
    var res = LM({ x: x, y: y }, polynomial, options);
    return res;
}

function asym_lorentzian([A, t0, sigma1, sigma2]) {
    function f(t) {
        var res = 2.0 * A;
        var d = 1.0;
        if (t < t0) {
            d = Math.pow((t - t0) / sigma1, 2) + 1;
        } else {
            d = Math.pow((t - t0) / sigma2, 2) + 1;
        }
        res /= d;
        return res;
    }
    return f;
}

function gaussian([A, t0, sigma]) {
    return t => A * Math.exp(-Math.pow(t - t0, 2) / 2.0 / Math.pow(sigma, 2)) / sigma / Math.sqrt(2.0 * Math.PI);
}

// function gaussian([A, t0, sigma]) {
//     function f(t) {
//         return A
//             * Math.exp(
//                 -Math.pow(t - t0, 2)
//                 / 2.0
//                 / Math.pow(sigma, 2)
//             )
//             / sigma / Math.sqrt(2.0 * Math.PI);
//     };
//     return f;
// }


/** check correct array sizes and convert to number or throw error */
function checkconv(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) throw "t must be non-null";
    if (t.length <= 0) throw "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) throw "r must be non-null";
    if (r.length <= 0) throw "r.length must be > 0";

    if (r.length !== t.length) throw "r and t must have same length";

    var res = {};

    // convert to number
    res.t = [];
    t.forEach(v => { res.t.push(Number(v)) });
    res.r = [];
    r.forEach(v => { res.r.push(Number(v)) });

    return res;
}


/** get min, max, sum, avg (assumes number) */
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
        // console.log("res.sum: ", res.sum);
    });
    res.avg = res.sum / y.length;
    return res;
}

/** calculate moments making use of pre-calculated characteristics */
function moment(c, moment) {
    var res = 0;
    c.t.forEach((v, idx) => {
        res += c.f[idx] * Math.pow(v, moment);
    });
    return res;
}

/** calculate quantile q of given array y */
function quantile(y, q) {

    var res = -1;

    var sorted = y.concat().sort((a, b) => a - b);
    var pos = (sorted.length - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        res = sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        res = sorted[base];
    }
    return res;
};

/** calculate autocorrelation for lag */
function autocorrelation(c, lag) {
    var res = 0;
    for (var i = 0; i < c.r.length - lag; i++) {
        res += (c.r_lift_avg[i]) * (c.r_lift_avg[i + lag]);
    }
    res /= c.sum_r_lifted_sq;
    return res;
}

/** calculate derivative (assumes pre-check and conversion to numbers already done) */
function derivative(t, r) {

    var res = [];
    res.push(0);

    for (var i = 1; i < r.length; i++) {
        var dt = t[i] - t[i - 1];
        var dr = r[i] - r[i - 1];
        res.push(dr / dt);
    }

    return res;
}

/** calculate derivative (assumes pre-check and conversion to numbers already done) */
function derivative_s(t, r, delta_t) {

    var res = [];
    for (var i = 0; i < r.length; i++) {
        var r1 = smoothat(t, r, delta_t/2.0, t[i] - delta_t / 2.0);
        var r2 = smoothat(t, r, delta_t/2.0, t[i] + delta_t / 2.0);
        var dr = r2 - r1;
        var d = dr / delta_t;
        console.log(i, r1, r2, dr, d);
        res.push(d);
    }

    return res;
}

/** get derivative and indicative roots (Nullstellen) (pre-check and conversion to numbers already done) */
function roots(t, r) {
    // smooth
    var s = smooth(t, r, 1);
    // get first derivative
    var d = derivative(t, s);
    // min, max, ...
    var d_mms = minmaxsum(d);
    // find roots (values)
    var d_limit = d_mms.max * 0.1;
    var peaks = d.filter(v => v > -d_limit && v < d_limit);
    // from root values to root indices
    var locs = [];
    peaks.forEach(v => {
        locs.push(d.indexOf(v));
    });
    // remove duplicates
    locs = locs.filter((v, i, a) => a.indexOf(v) === i);

    // check for multiple consecutive entries
    var groups = [];
    var group = [];
    if (locs.length > 0) {
        group.push(locs[0]);
        for (var i = 1; i < locs.length; i++) {
            if (locs[i] - locs[i - 1] === 1) {
                group.push(locs[i]);
            } else {
                groups.push(group);
                group = [];
                group.push(locs[i]);
            }
        }
    }
    // get value for center of each group
    var peak_vals = [];
    var peak_idxs = [];
    groups.forEach(group => {
        var idx = Math.floor(group.length / 2 + group[0]);
        peak_idxs.push(idx);
        peak_vals.push(r[idx]);
    });

    var res = {};
    res.d = d;
    res.d_mms = d_mms;
    res.d_limit = d_limit;
    res.peak_vals = peak_vals;
    res.peak_idxs = peak_idxs;
    res.groups = groups;
    return res;
}

/** exponential smoothing with sigma as in 1/sigma/sqrt(2 pi) exp(-(x-x0)^2/2/sigma^2) */
function smooth(t, r, sigma) {
    var s = r.map(v => 0);
    for (var i = 0; i < r.length; i++) {
        var t0 = t[i];
        s[i] = smoothat(t, r, sigma, t0);
        // var lb = t0 - 3.0 * sigma;
        // var ub = t0 + 3.0 * sigma;
        // var f = r.map(v => 0); // filter function
        // var sum = 0;
        // var sum_f = 0;
        // for (var j = 0; j < r.length; j++) {
        //     if (t[j] >= lb && t[j] <= ub) {
        //         f[j] =
        //             Math.exp(
        //                 -Math.pow(t[j] - t0, 2)
        //                 / 2.0
        //                 / Math.pow(sigma, 2)
        //             )
        //             / sigma / Math.sqrt(2.0 * Math.PI);
        //         sum += f[j] * r[j];
        //         sum_f += f[j];
        //     }
        // }
        // s[i] = sum / sum_f;
    }
    return s;
}

/** create new t array from t_start to t_stop with t_increment; time unit is expressed in ints (seconds or minutes or days etc) */
function t_array_from_to(t_start, t_stop, t_increment) {
    var res = [];
    for (var i = t_start; i <= t_stop; i += t_increment) {
        res.push(i);
    }
}

/** exponential smoothing at specific t0 */
function smoothat(t, r, sigma, t0) {

    var res = 0;

    var lb = t0 - 6.0 * sigma;
    var ub = t0 + 6.0 * sigma;
    // console.log(t0, lb, ub);

    var f = t.map(v => 0); // filter function
    var sum = 0;
    var sum_f = 0;
    for (var j = 0; j < r.length; j++) {
        if (t[j] >= lb && t[j] <= ub) {
            f[j] =
                Math.exp(
                    -Math.pow(t[j] - t0, 2)
                    / 2.0
                    / Math.pow(sigma, 2)
                )
                / sigma / Math.sqrt(2.0 * Math.PI);
            sum += f[j] * r[j];
            sum_f += f[j];
            // console.log(sum);
            // console.log(sum_f);
        }
    }
    if( 0 === sum_f ) {
        throw new "not enough data within +- 6 sigma to smooth";
    }
    res = sum / sum_f;
    // console.log(res);
    return res;
}

/** exponential smoothing on target time array t_new */
function smoothto(t, r, sigma, t_new) {

    var s = t_new.map(v => 0);

    for (var i = 0; i < t_new.length; i++) {

        var t0 = t_new[i];
        var lb = t0 - 3.0 * sigma;
        var ub = t0 + 3.0 * sigma;

        // var f = t.map(v => 0); // filter function
        // var sum = 0;
        // var sum_f = 0;
        // for (var j = 0; j < r.length; j++) {
        //     if (t[j] >= lb && t[j] <= ub) {
        //         f[j] =
        //             Math.exp(
        //                 -Math.pow(t[j] - t0, 2)
        //                 / 2.0
        //                 / Math.pow(sigma, 2)
        //             )
        //             / sigma / Math.sqrt(2.0 * Math.PI);
        //         sum += f[j] * r[j];
        //         sum_f += f[j];
        //     }
        // }
        // s[i] = sum / sum_f;
        s[i] = smoothat(t, r, sigma, t0);
    }

    var res = {};
    res.t = t_new;
    res.r = s;

    return res;
}

/** helper, find unique entries in array */
function unique(a) {
    return a.filter((v, i, a) => a.indexOf(v) === i);
}

/** test if objects is undefined, null, or 0 length, or full of empty values */
function isEmpty(val) {
    if (val === undefined) return true;
    if (val === null) return true;
    if (val.length <= 0) return true;
    if (Array.isArray(val)) {
        var cnt = 0;
        val.forEach(el => {
            if (isEmpty(el)) cnt++;
        });
        if (cnt === val.length) return true;
    }
    return false;
}

/** get day of year (1 for Jan first) */
function dayofyear(date) {
    var jd1 = julianday(new Date(date.getFullYear(), 0, 1), { includeTime: false });
    var jd2 = julianday(date, { includeTime: false });
    return jd2 - jd1 + 1;
}

/** calculate julian day (including time as fraction of day) for given date */
function juliandayf(date) {
    return julianday(date, {includeTime: true});
}

/** calculate julian day (without time) for given date */
function juliandayi(date) {
    return julianday(date, {includeTime: false});
}

/** calculate julian day for given date */
function julianday(date, options = {}) {
    if (isEmpty(date)) {
        return 0;
    }
    var includeTime = true;
    if (!isEmpty(options)) {
        if (!isEmpty(options.includeTime)) {
            includeTime = options.includeTime;
        }
    }
    var res = 0,
        ja = 0,
        jy = 0,
        jm = 0;

    var year = date.getFullYear();

    jy = year;

    if (jy < 0) ++jy;
    var mm = date.getMonth() + 1;
    if (mm > 2) {
        jm = mm + 1;
    } else {
        --jy;
        jm = mm + 13;
    }

    var id = date.getDate();
    res = Math.floor(365.25 * jy) + Math.floor(30.6001 * jm) + id + 1720995;
    if (id + 31 * (mm + 12 * year) >= IGREG1) {
        ja = Math.floor(0.01 * jy);
        res += 2 - ja + Math.floor(0.25 * ja);
    }

    if (includeTime) {
        res += (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 24 / 3600;
    }

    return res;
}

/** convert julian day number (with time fraction) to date (after Numerical Recipies) */
function fromJulianDayf(julianday) {
    return fromJulianDay(julianday, {includeTime: true});
}

/** convert julian day number (without time fraction) to date (after Numerical Recipies) */
function fromJulianDayi(julianday) {
    return fromJulianDay(julianday, {includeTime: false});
}

/** convert julian day number to date (after Numerical Recipies) */
function fromJulianDay(julianday, options = {}) {
    var ja = 0,
        jalpha = 0,
        jb = 0,
        jc = 0,
        jd = 0,
        je = 0;

    var includeTime = true;
    if (!isEmpty(options)) {
        if (!isEmpty(options.includeTime)) {
            includeTime = options.includeTime;
        }
    }
    var fraction = (julianday - Math.floor(julianday)) * 24 * 3600;

    if (julianday >= IGREG2) {
        jalpha = Math.floor((julianday - 1867216 - 0.25) / 36524.25);
        ja = julianday + 1 + jalpha - Math.floor(0.25 * jalpha);
    } else {
        ja = jd;
    }

    jb = ja + 1524;
    jc = Math.floor(6680.0 + (jb - 2439870 - 122.1) / 365.25);
    jd = Math.floor(365 * jc + 0.25 * jc);
    je = Math.floor((jb - jd) / 30.6001);
    var day = jb - jd - Math.floor(30.6001 * je);
    var mm = je - 1;
    if (mm > 12) mm -= 12;
    var year = jc - 4715;
    if (mm > 2) --year;
    if (year <= 0) --year;

    var res = new Date(year, mm - 1, day, 0, 0, 0, 0);

    if (includeTime) {
        var hr = Math.floor(fraction / 3600);
        fraction -= hr * 3600;
        var min = Math.floor(fraction / 60);
        var sec = Math.round(fraction - min * 60);

        res = new Date(year, mm - 1, day, hr, min, sec, 0);
    }
    return res;
}

/** get base notions from time series (time t and observation r) */
function characteristics(t, r) {

    var res = checkconv(t, r);

    /** basic descriptive statistics */
    var mms = minmaxsum(res.r);
    res.r_mms = mms;

    /** lift into positive range */
    res.r_lift_min = [];
    res.r.forEach(v => { res.r_lift_min.push(v - res.r_mms.min) });

    /** lift by mean */
    res.r_lift_avg = [];
    res.r.forEach(v => { res.r_lift_avg.push(v - res.r_mms.avg) });
    res.sum_r_lifted_sq = 0;
    res.r_lift_avg.forEach(v => { res.sum_r_lifted_sq += v * v });

    /** distribution function */
    var sum_lifted = 0;
    res.r_lift_min.forEach(v => { sum_lifted += v; });
    res.f = [];
    res.r_lift_min.forEach(v => { res.f.push(v / sum_lifted); });

    /** moments 0 .. 5 */
    res.mon_0 = moment(res, 0);
    res.mon_1 = moment(res, 1);
    res.mon_2 = moment(res, 2);
    res.mon_3 = moment(res, 3);
    res.mon_4 = moment(res, 4);
    res.mon_5 = moment(res, 5);

    /** above / below avg count */
    res.r_above_avg_cnt = 0;
    res.r_below_avg_cnt = 0;
    res.r.forEach(v => {
        if (v >= res.r_mms.avg) {
            res.r_above_avg_cnt++;
        } else {
            res.r_below_avg_cnt++;
        }
    });

    /** autocorrelation */
    res.ac = [];
    res.ac_t = [];
    res.ac.push(1.0);
    res.ac_t.push(res.t[0]);
    for (var i = 1; i < res.r.length * 0.9; i++) {
        res.ac.push(autocorrelation(res, i));
        res.ac_t.push(res.t[i]);
    }

    /** derivative of autocorrelation */
    res.ac_roots = roots(res.ac_t, res.ac);

    /** derivative of time series */
    res.roots = roots(res.t, res.r);

    /** add polynomials */
    res.lm1 = fit_polynomial(res.t, res.r, polynomial_1, {
        damping: 1.5,
        initialValues: [1, 1]
    });
    res.lm2 = fit_polynomial(res.t, res.r, polynomial_2, {
        damping: 1.5,
        initialValues: [res.lm1.parameterValues[0], res.lm1.parameterValues[1], 1]
    });
    res.lm3 = fit_polynomial(res.t, res.r, polynomial_3, {
        damping: 1.5,
        initialValues: [1, 1, 1, 1]
    });

    var _t0 = res.mon_1;
    var _s = Math.sqrt(res.mon_2 - Math.pow(res.mon_1, 2));

    res.lm_gaussian = LM({ x: res.t, y: res.r }, gaussian, {
        damping: 1.5,
        initialValues: [res.r_mms.max, _t0, _s]
    });

    res.lm_asym_lorentzian = LM({ x: res.t, y: res.r }, asym_lorentzian, {
        damping: 1.5,
        initialValues: [res.r_mms.max, _t0, _s, _s]
    });



    /** add quantiles */
    res.r_q_1 = quantile(res.r, 0.25);
    res.r_q_2 = quantile(res.r, 0.50);
    res.r_q_3 = quantile(res.r, 0.75);

    /** binning */
    var lims = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    for (var i = 0; i < lims.length - 1; i++) {
        var lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * lims[i];
        var hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * lims[i + 1];
        var featurename = "r_bin_" + (i + 1);
        if (i < lims.length - 2) {
            res[featurename] = res.r.filter(v => v >= lb && v < hb).length;
        } else {
            res[featurename] = res.r.filter(v => v >= lb && v <= hb).length;
        }
        // console.log(featurename);
        // console.log(res);
    }


    // // console.log("r2", r2);
    // // console.log("min", res.r_min, "max", res.r_max);
    // var lb = res.r_mms.min;
    // var hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
    // res.r_bin_1 = res.r.filter(v => v >= lb && v < hb).length; //count of values in first 25%
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_1);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
    // res.r_bin_2 = res.r.filter(v => v >= lb && v < hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_2);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
    // res.r_bin_3 = res.r.filter(v => v >= lb && v < hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_3);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 1.0;
    // res.r_bin_4 = res.r.filter(v => v >= lb && v <= hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v <= hb), "res", res.r_bin_4);

    return res;
}

export {
    version
    , minmaxsum
    , moment
    , autocorrelation
    , characteristics
    , polynomial_1, polynomial_2, polynomial_3, polynomial_4, polynomial_5
    , fit_polynomial
    , derivative
    , derivative_s
    , roots
    , quantile
    , checkconv
    , smooth
    , gaussian
    , asym_lorentzian
    // helper
    , isEmpty
    , unique
    // julian day
    , julianday
    , juliandayf
    , juliandayi
    , fromJulianDay
    , fromJulianDayf
    , fromJulianDayi
    , dayofyear
    // smoothing to new tine array
    , t_array_from_to
    , smoothto
    , smoothat
}