var color = {
    hsbFromRgb: function(rgb) {
        r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max === min){
            h = 0;
        }else{
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
    },
    rgbFromHsb: function(hsv) {
        var r, g, b;
        h = hsv[0]/360; s = hsv[1]/100; v = hsv[2]/100;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch(i % 6){
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    rgbFromHex: function(hex){
        if(hex.length === 3){
            return [
                parseInt(hex.substring(0,1)+hex.substring(0,1), 16),
                parseInt(hex.substring(1,2)+hex.substring(1,2), 16),
                parseInt(hex.substring(2,3)+hex.substring(2,3), 16)
            ]
        } else {
               return [
                parseInt(hex.substring(0,2), 16),
                parseInt(hex.substring(2,4), 16),
                parseInt(hex.substring(4,6), 16)
            ]
        }
    },
    hexFromRgb: function(rgb){
        var hexcode = this.toHex(rgb[0])+this.toHex(rgb[1])+this.toHex(rgb[2]),
            parts = hexcode.split("");
        // "000" instead of "000000"
        return (parts[0]===parts[1]) && (parts[2]===parts[3]) && (parts[4]==parts[5]) ? parts[0]+parts[2]+parts[4] : hexcode;
    },
    toHex: function(n) {
        if(n === 0) { return '00'; }
        n = parseInt(n, 10);
        if (n === 0 || isNaN(n)) { return "00"; }
        return "0123456789abcdef".charAt((n-n%16)/16) + "0123456789abcdef".charAt(n%16);
    }
};