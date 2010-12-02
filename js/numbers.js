/*
 *    Copyright (c) 2010 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

var numbers = {
	regex: new RegExp(''),
	min: 0,
	max: 0,
	temporaryMode: "",
	match: false,
	pressed: false,
	speed: 0,
	value: "",
	timeout: null,
	element: null,
	direction: 0,
	DIGITS: /[-1234567890]/g,
	HEXCODE: /[A-Fa-f0-9]/g,
	initNumberField: function(obj) {
	    this.max = $(obj).attr('data-max');
	    this.min = $(obj).attr('data-min');
	    this.temporaryMode = $(obj).attr('id');
	    $(obj).select();
	    switch (this.max) {
	    case "100": // 0-100
	        this.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|100))$");
	        break;
	    case "255": // 0-255
	        this.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1]{1}[0-9]{0,2}|[2]{1}([0-4]{1}[0-9]{1}|[5]{1}[0-5]{1})))$");
	        break;
	    case "360": // 0-360
	        this.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1-2]{1}[0-9]{0,2}|[3]{1}([0-5]{1}[0-9]{1}|[6]{1}[0]{1})))$");
	        break;
	    }
	},
	initHexField: function(obj) {
	    this.temporaryMode = $(obj).attr('id');
	    this.regex.compile("^([A-Fa-f0-9]{6})$");
	},
	updateField: function(type) {
	    clearTimeout(this.timeout);
	    switch(type){
	    case 'color':
	        if (this.match) colorpicker.update(this.temporaryMode);
	        break;
	    case 'style':
	        break;
	    }
	},
	restrictCharacters: function(event, type, obj) {
	    var keycode;
	    this.element = obj;
	    this.value = $(obj).val();
	    if (event.keyCode) {
	        keycode = event.keyCode;
	    } 
	    else if (event.which) {
	        keycode = event.which;
	    }
	    var character = String.fromCharCode(keycode);
	    // 1 for key up, -1 for key down, 0 for other keys
	    this.direction = 0;
	    switch(keycode){
	        case 38: this.direction = 1; break;
	        case 40: this.direction = -1; break;
	    }
	    if (this.direction !== 0 && type === this.DIGITS) {
	        this.accelerate();
	        return false;
	    }
	    else {
	        // 8 = backspace, 9 = tab, 13 = enter, 35 = home, 37 = left, 38 = top, 39 = right, 40 = down
	        var controlKeys = [ 8, 9, 13, 35, 36, 37, 38, 39, 40 ];
	        var isControlKey = controlKeys.join(",").match(new RegExp(keycode));
	        if (isControlKey) {
	            return true;
	        }
	        else if (character.match(type)) {
	            this.match = true;
	            return true;
	        }
	        event.preventDefault();
	        return false;
	    }
	},
	accelerate: function() {
	    clearTimeout(this.timeout);
	    if (this.value === '') {
	        this.value = 0;
	    }
	    var number = parseInt(this.value, 10);
	    number += this.direction;
	    if (number < this.min) {
	        number = this.min;
	    } else if (number > this.max) {
	        number = this.max;
	    }
	    if('-'+this.max === this.min) { // as in angle from -180 to 180
	        if(number === this.min) number = this.max;
	        else if(number === this.max) number = this.min;
	    }
	    $(this.element).val(number).select();
	    this.value = number;
	    colorpicker.update(this.temporaryMode);
		if(!this.pressed){
			this.speed = 500;
			this.pressed = true;
		}
		else {
			this.speed = 150;
		}
	    this.timeout = setTimeout(function(){ jQuery.proxy(this, "accelerate") }, this.speed);
	},
	validateInput: function(event, obj) {
		this.pressed = false;
	    this.value = $(obj).val();
	    var integer = parseInt(this.value, 10);
	    if(this.regex.test(integer)){
	        $(obj).val(integer);
	        return true;
	    }
	    event.preventDefault();
	    var errorString = lang.AnIntegerBetween+" "+ this.min +" "+lang.and+" "+ this.max +" "+lang.isRequired+". "+lang.ClosestValueInserted+".";
	    alert(errorString);
	    $(obj).val(this.max).focus();
	    //colorpicker.update(temporaryMode);
	}
};