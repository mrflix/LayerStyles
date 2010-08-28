/*
 *    Copyright (c) 2010 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

function colorpicker(object){
    this.current_color = "000000"; // hex
    var $current_color = $('#current_color');
    var $new_color = $('#new_color');
    var swatches = [{'title': 'White', 'hex': 'ffffff'},
                    {'title': '10% Gray', 'hex': 'e5e5e5'},
                    {'title': '20% Gray', 'hex': 'cccccc'},
                    {'title': '30% Gray', 'hex': 'b3b3b3'},
                    {'title': '40% Gray', 'hex': '999999'},
                    {'title': '50% Gray', 'hex': '808080'},
                    {'title': '60% Gray', 'hex': '666666'},
                    {'title': '70% Gray', 'hex': '4d4d4d'},
                    {'title': '80% Gray', 'hex': '333333'},
                    {'title': '90% Gray', 'hex': '1a1a1a'},
                    {'title': 'Black', 'hex': '000000'}];
    var $swatches = $('#swatches');
    var color_history = [];
    var pointerPos = { 'x': 0, 'y': 0 };
    this.hsb = { h: 0, s: 0, b: 0 };
    this.rgb = { r: 0, g: 0, b: 0 };
    this.hex = '';
    var $hsb = { h: $('#hsb_h'), s: $('#hsb_s'), b: $('#hsb_b') };
    var $rgb = { r: $('#rgb_r'), g: $('#rgb_g'), b: $('#rgb_b') };
    var $buttons = { 'ok': $('#color_ok'), 'cancel': $('#color_cancel') };
    var mode = 'hsb_b';
    var max; // the maximum input value
    var ratio; // the ratio for the slider: its 0.7111 (hue), ~1 (rgb) or 2.56 (saturation/brightness)
    var o = object;
    var $inputs = $('li', this.o);
    var $hex_holder = $('#hex_holder');
    var $hex = $('#hex');
    var $text_inputs = $('input[type=text]', $inputs);
    var $selected_input;
    var $radio_inputs = $('input[type=radio]', this.inputs);
    var $circle_field = $('#circle');
    var cf = $('#color_field canvas').get(0).getContext('2d');
    var cc = $circle_field.get(0).getContext('2d');
    var $slide_area = $('#color_slider');
    var $slider = $('> div', $slide_area);
    var offset; // the offset relative to the document will be stored in here to calculate mouse-dragging
    var cs = $('canvas', $slide_area).get(0).getContext('2d');
    var self = this;
    this.click_all = function(event){
        var $radio = $('input[type=radio]', this);
        var $number = $('input[type=text]', this);
        var click_target_type = $(event.target).attr('type');
        switch(click_target_type){
            case "radio":
                $number.focus();
                mode = $radio.val();
                max = $number.attr('max');
                ratio = 256/max;
                $selected_input = $number;
                self.update();
                self.move_slider($selected_input.val()*ratio);
                self.draw_pointer();
                break;
            case "text": self.update(); break;
            case "number": self.update(); break;
            default:
                $radio.attr('checked', 'ckecked');
                $number.focus();
                mode = $radio.val();
                max = $number.attr('max');
                self.update();
        }
    };
    this.click_hex = function(){
        $hex.focus();
    };
    this.update = function(custom_mode){
        var update_mode = custom_mode || mode;
        switch(update_mode){
        case 'hsb_h': case 'hsb_s': case 'hsb_b':
            self.get_hsb();
            self.hsb_to_rgb();
            self.rgb_to_hex();
            break;
        case 'rgb_r': case 'rgb_g': case 'rgb_b':
            self.get_rgb();
            self.rgb_to_hsb();
            self.rgb_to_hex();
            break;
        case 'hex':
            self.get_hex();
            self.hex_to_rgb();
            self.rgb_to_hsb();
            break;
        }
        self.paint_field();
        self.paint_slider();
        self.set_new_color();
    };
    this.paint_field = function(){
        var x_gradient, y_gradient;
        cf.save();
        cf.clearRect(0,0,256,256);
        x_gradient = cf.createLinearGradient(0, 0, 0, 256);
        y_gradient = cf.createLinearGradient(0, 0, 256, 0);
        switch (mode) {
        case 'hsb_h': // rainbow
            var hue = get_rgb_from_hsb(this.hsb.h, 100, 100);
            y_gradient.addColorStop(0, 'white');
            y_gradient.addColorStop(1, 'rgb('+hue[0]+','+hue[1]+','+hue[2]+')');
            x_gradient.addColorStop(0, 'transparent');
            x_gradient.addColorStop(1, 'black');
            break;
        case 'hsb_s': // rainbow
            y_gradient.addColorStop(0, 'rgb(255,0,0)');
            y_gradient.addColorStop(1/6, 'rgb(255,255,0)');
            y_gradient.addColorStop(2/6, 'rgb(0,255,0)');
            y_gradient.addColorStop(3/6, 'rgb(0,255,255)');
            y_gradient.addColorStop(4/6, 'rgb(0,0,255)');
            y_gradient.addColorStop(5/6, 'rgb(255,0,255)');
            y_gradient.addColorStop(1, 'rgb(255,0,0)');
            x_gradient.addColorStop(0, 'rgba(255,255,255,'+(1-this.hsb.s/100)+')' );
            x_gradient.addColorStop(1, 'black' );
            break;
        case 'hsb_b': // rainbow from saturated to unsaturated
            var grey = parseInt(this.hsb.b*2.56, 10);
            y_gradient.addColorStop(0, 'rgb(255,0,0)');
            y_gradient.addColorStop(1/6, 'rgb(255,255,0)');
            y_gradient.addColorStop(2/6, 'rgb(0,255,0)');
            y_gradient.addColorStop(3/6, 'rgb(0,255,255)');
            y_gradient.addColorStop(4/6, 'rgb(0,0,255)');
            y_gradient.addColorStop(5/6, 'rgb(255,0,255)');
            y_gradient.addColorStop(1, 'rgb(255,0,0)');
            x_gradient.addColorStop(0, 'rgba(0,0,0,'+(1-this.hsb.b/100)+')');
            x_gradient.addColorStop(1, 'rgb('+grey+','+grey+','+grey+')');
            break;
        case 'rgb_r':
            cf.globalCompositeOperation = 'lighter';
            x_gradient.addColorStop(0, 'rgb('+this.rgb.r+',255,0)');
            x_gradient.addColorStop(1, 'rgb('+this.rgb.r+',0,0)');
            y_gradient.addColorStop(0, 'rgb('+this.rgb.r+',0,0)');
            y_gradient.addColorStop(1, 'rgb('+this.rgb.r+',0,255)');
            break;
        case 'rgb_g':
            cf.globalCompositeOperation = 'lighter';
            x_gradient.addColorStop(0, 'rgb(255,'+this.rgb.g+',0)');
            x_gradient.addColorStop(1, 'rgb(0,'+this.rgb.g+',0)');
            y_gradient.addColorStop(0, 'rgb(0,'+this.rgb.g+',0)');
            y_gradient.addColorStop(1, 'rgb(1,'+this.rgb.g+',255)');
            break;
        case 'rgb_b':
            cf.globalCompositeOperation = 'lighter';
            x_gradient.addColorStop(0, 'rgb(0,255,'+this.rgb.b+')');
            x_gradient.addColorStop(1, 'rgb(0,0,'+this.rgb.b+')');
            y_gradient.addColorStop(0, 'rgb(0,0,'+this.rgb.b+')');
            y_gradient.addColorStop(1, 'rgb(255,0,'+this.rgb.b+')');
            break;
        }
        cf.beginPath();
        cf.rect(0, 0, 256, 256);
        cf.closePath();
        cf.fillStyle = y_gradient;
        cf.fill();
        cf.beginPath();
        cf.rect(0, 0, 256, 256);
        cf.closePath();
        cf.fillStyle = x_gradient;
        cf.fill();
        cf.restore();
        self.move_pointer();
    };
    this.start_pointer = function(){
        move_function = { fn: self.calculate_pointer };
        offset = $circle_field.offset();
    };
    this.calculate_pointer = function(){
        pointerPos.x = mousePos.x-offset.left;
        pointerPos.y = mousePos.y-offset.top;
        if(pointerPos.x < 0) { pointerPos.x = 0; }
        else if(pointerPos.x > 256) { pointerPos.x = 256; }
        if(pointerPos.y < 0) { pointerPos.y = 0; }
        else if(pointerPos.y > 256) { pointerPos.y = 256; }
        switch(mode){
        case 'hsb_h':
            $hsb.s.val(parseInt(pointerPos.x/2.56, 10));
            $hsb.b.val(100-parseInt(pointerPos.y/2.56, 10));
            break;
        case 'hsb_s':
            $hsb.h.val(parseInt(pointerPos.x/0.71111, 10));
            $hsb.b.val(100-parseInt(pointerPos.y/2.56, 10));
            break;
        case 'hsb_b':
            $hsb.h.val(parseInt(pointerPos.x/0.71111, 10));
            $hsb.s.val(100-parseInt(pointerPos.y/2.56, 10));
            break;
        case 'rgb_r':
            $rgb.b.val(parseInt(pointerPos.x/1.003921, 10));
            $rgb.g.val(255-parseInt(pointerPos.y/1.003921, 10));
            break;
        case 'rgb_g':
            $rgb.b.val(parseInt(pointerPos.x/1.003921, 10));
            $rgb.r.val(255-parseInt(pointerPos.y/1.003921, 10));
            break;
        case 'rgb_b':
            $rgb.r.val(parseInt(pointerPos.x/1.003921, 10));
            $rgb.g.val(255-parseInt(pointerPos.y/1.003921, 10));
            break;
        }
        self.move_pointer();
        self.update();
    };
    this.move_pointer = function(x, y){
        pointerPos.x = x >= 0 ? x : pointerPos.x;
        pointerPos.y = y >= 0 ? y : pointerPos.y;
        cc.clearRect(0,0,256,256);
        // limit x and y to 0-255 cause we need +1 (=256) space to detect the underlaying color 
        var detect_x = pointerPos.x > 255 ? 255 : pointerPos.x,
            detect_y = pointerPos.y > 255 ? 255 : pointerPos.y;
        var background = cf.getImageData(detect_x, detect_y, 1, 1).data;
        cc.strokeStyle = ((background[0]+background[1]+background[2])/3) < 128 ? 'white' : 'black';
        cc.beginPath();
        cc.arc(detect_x + 0.5, detect_y + 0.5, 5, 0, Math.PI*2, true);
        cc.closePath();
        cc.stroke();
    };
    this.draw_pointer = function(){
        var posX = 0, posY = 0;
        switch(mode){
        case 'hsb_h':
            posX = this.hsb.s*2.56;
            posY = (100-this.hsb.b)*2.56;
            break;
        case 'hsb_s':
            posX = this.hsb.h*0.71111;
            posY = (100-this.hsb.b)*2.56;
            break;
        case 'hsb_b':
            posX = this.hsb.h*0.71111;
            posY = (100-this.hsb.s)*2.56;
            break;
        case 'rgb_r':
            posX = this.rgb.b*1.003921;
            posY = (255-this.rgb.g)*1.003921;
            break;
        case 'rgb_g':
            posX = this.rgb.b*1.003921;
            posY = (255-this.rgb.r)*1.003921;
            break;
        case 'rgb_b':
            posX = this.rgb.r*1.003921;
            posY = (255-this.rgb.g)*1.003921;
            break;
        }
        self.move_pointer(parseInt(posX, 10), parseInt(posY, 10));
    }
    this.paint_slider = function(){
        var gradient;
        cs.clearRect(0,0,19,256);
        gradient = cs.createLinearGradient(0, 0, 0, 256);
        switch (mode) {
        case 'hsb_h': // rainbow
            gradient.addColorStop(0, 'rgb(255,0,0)');
            gradient.addColorStop(1/6, 'rgb(255,0,255)');
            gradient.addColorStop(2/6, 'rgb(0,0,255)');
            gradient.addColorStop(3/6, 'rgb(0,255,255)');
            gradient.addColorStop(4/6, 'rgb(0,255,0)');
            gradient.addColorStop(5/6, 'rgb(255,255,0)');
            gradient.addColorStop(1, 'rgb(255,0,0)');
            break;
        case 'hsb_s': // max saturation to unsaturated
            var brightness = this.hsb.b;
            if(brightness <= 33) brightness = 33;
            var saturated = get_rgb_from_hsb(this.hsb.h, 100, brightness);
            var unsaturated = get_rgb_from_hsb(this.hsb.h, 0, brightness);
            gradient.addColorStop(0, 'rgb('+saturated[0]+','+saturated[1]+','+saturated[2]+')');
            gradient.addColorStop(1, 'rgb('+unsaturated[0]+','+unsaturated[1]+','+unsaturated[2]+')');
            break;
        case 'hsb_b': // max brightness to black
            var brightest = get_rgb_from_hsb(this.hsb.h, this.hsb.s, 100);
            gradient.addColorStop(0, 'rgb('+brightest[0]+','+brightest[1]+','+brightest[2]+')');
            gradient.addColorStop(1, 'black');
            break;
        case 'rgb_r':
            gradient.addColorStop(0, 'rgb(255,'+this.rgb.g+','+this.rgb.b+')');
            gradient.addColorStop(1, 'rgb(0,'+this.rgb.g+','+this.rgb.b+')');
            break;
        case 'rgb_g':
            gradient.addColorStop(0, 'rgb('+this.rgb.r+',255,'+this.rgb.b+')');
            gradient.addColorStop(1, 'rgb('+this.rgb.r+',0,'+this.rgb.b+')');
            break;
        case 'rgb_b':
            gradient.addColorStop(0, 'rgb('+this.rgb.r+','+this.rgb.g+',255)');
            gradient.addColorStop(1, 'rgb('+this.rgb.r+','+this.rgb.g+',0)');
            break;
        }
        cs.beginPath();
        cs.rect(0, 0, 19, 256);
        cs.closePath();
        cs.fillStyle = gradient;
        cs.fill();
    };
    this.start_slider = function(){
        move_function = { fn: self.slide };
        offset = $slide_area.offset();
    };
    this.slide = function(){
        var relative_position = mousePos.y-offset.top;
        if(relative_position < 0) { relative_position = 0; }
        if(relative_position > 256) { relative_position = 256; }
        // invert the value because the coordination system has its origin at the top but the slider has its origin at the bottom
        relative_position = 256-relative_position;
        self.move_slider(relative_position);
        $selected_input.val(parseInt(relative_position/ratio, 10));
        self.update();
    };
    this.move_slider = function(position){
        $slider.css({'top':(256-position)+'px'});
    };
    this.get_hsb = function(){
        this.hsb.h = $hsb.h.val();
        this.hsb.s = $hsb.s.val();
        this.hsb.b = $hsb.b.val();
    };
    this.get_rgb = function(){
        this.rgb.r = $rgb.r.val();
        this.rgb.g = $rgb.g.val();
        this.rgb.b = $rgb.b.val();
    };
    this.get_hex = function(){
        var hex = $hex.val();
        var missing_length = 6 - hex.length;
        // add zeros to the hex if its shorter than 6
        for(var i = 0; i<missing_length; i++){ hex = "0" + hex; }
        this.hex = hex;
    };
    this.set_hsb = function(){
        $hsb.h.val(this.hsb.h);
        $hsb.s.val(this.hsb.s);
        $hsb.b.val(this.hsb.b);
    };
    this.set_rgb = function(){
        $rgb.r.val(this.rgb.r);
        $rgb.g.val(this.rgb.g);
        $rgb.b.val(this.rgb.b);
    };
    this.set_hex = function(hex){
        $hex.val(hex || this.hex);
    };
    this.set_new_color = function(){
        $new_color.css({background:'#'+this.hex});
    };
    this.rgb_to_hsb = function(){
        var r = this.rgb.r/255, g = this.rgb.g/255, b = this.rgb.b/255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, hsb_b = max;

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

        this.hsb.h = Math.round(h * 360);
        this.hsb.s = Math.round(s * 100);
        this.hsb.b = Math.round(hsb_b * 100);
        self.set_hsb();
    };
    this.hsb_to_rgb = function(){
        var rgb = get_rgb_from_hsb(this.hsb.h, this.hsb.s, this.hsb.b);
        this.rgb.r = rgb[0];
        this.rgb.g = rgb[1];
        this.rgb.b = rgb[2];
        self.set_rgb();
    };
    function get_rgb_from_hsb(h, s, v){
        var r, g, b;
        h = h/360; s = s/100; v = v/100;

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
    };
    this.rgb_to_hex = function(){
        this.hex = self.to_hex(this.rgb.r)+self.to_hex(this.rgb.g)+self.to_hex(this.rgb.b);
        self.set_hex();
    };
    this.to_hex = function(n){
        if(n === 0) { return '00'; }
        n = parseInt(n, 10);
        if (n === 0 || isNaN(n)) { return "00"; }
        return "0123456789abcdef".charAt((n-n%16)/16) + "0123456789abcdef".charAt(n%16);
    };
    this.hex_to_rgb = function(){
        this.rgb.r = parseInt(this.hex.substring(0,2), 16);
        this.rgb.g = parseInt(this.hex.substring(2,4), 16);
        this.rgb.b = parseInt(this.hex.substring(4,6), 16);
        self.set_rgb();
    };
    this.add_swatch = function(title, hex){
        $swatches.append(
                $('<span/>')
                .attr({'title': title, 'value': hex})
                .css({'background': '#'+hex})
                .click(function(e){
                    e.stopPropagation();
                    // if alt is pressed while clicking: remove swatch
                    if(e.altKey){
                        // find out the swatches position in the swatch array
                        var position = 0;
                        var family = $(this).parent().children();
                        for(var i = 0, length = family.length; i<length; i++){
                            if(this===family[i]){ position = i; }
                        }
                        // slice out the swatch from the swatch array (method by John Resig)
                        var rest = swatches.slice(position + 1);
                        swatches.length = position;
                        swatches.push.apply(swatches, rest);
                        $(this).remove();
                    }
                    // else get that swatches color
                    else {
                        var hex = $(this).attr('value');
                        self.set_hex(hex);
                        self.update('hex');
                    }
                })
            );
    };
    $buttons.ok.click(function(){
        this.current_color = this.hex;
        color_history.push(this.current_color);
        $current_color.css({background:'#'+this.current_color});
        o.hide();
    });
    $buttons.cancel.click(function(){
        this.current_color = color_history.pop();
        $current_color.css({background:'#'+this.current_color});
        o.hide();
    });
    $circle_field.mousedown(this.start_pointer);
    $slide_area.mousedown(this.start_slider);
    $inputs.click(this.click_all);
    $hex_holder.click(this.click_hex);
    $hex.bind({
        focus: init_hex_field,
        keydown: function(e){ restrictCharacters(e, hexcode) },
        keyup: update_field
    });
    $text_inputs.bind({
        focus: init_number_field,
        keydown: function(e){ restrictCharacters(e, digits) },
        keypress: accelerate,
        keyup: update_field,
        blur: validate_input
    });
    $swatches.click(function(){
        var title = prompt("Color Swatch Name","Swatch "+swatches.length);
        if(title){
            self.add_swatch(title, self.hex);
            swatches.push({'title': title, 'color': self.hex});
        }
    });

    for (var i = 0; i<6; i++) {
        if ($radio_inputs.eq(i).attr('checked')) {
            mode = $radio_inputs.eq(i).val();
            $selected_input = $text_inputs.eq(i);
            $selected_input.focus();
            max = $selected_input.attr('max');
            ratio = 256/max;
            this.move_slider($selected_input.val()*ratio);
            self.draw_pointer();
        }
    }
    // draw swatches
    for(var i = 0, length = swatches.length; i<length; i++){
        self.add_swatch(swatches[i].title, swatches[i].hex);
    }
    this.update();
}