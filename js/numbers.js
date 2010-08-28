/*
 *    Copyright (c) 2010 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

var regex = new RegExp(''), min, max, temporary_mode;
var digits = /[-1234567890]/g, hexcode = /[A-Fa-f0-9]/g;

function init_number_field() {
    max = $(this).attr('max');
    min = $(this).attr('min');
    temporary_mode = $(this).attr('id');
    $(this).select();
    switch (max) {
    case "100": // 0-100
        regex.compile("^(0|([1-9]{1}[0-9]{0,1}|100))$");
        break;
    case "255": // 0-255
        regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1]{1}[0-9]{0,2}|[2]{1}([0-4]{1}[0-9]{1}|[5]{1}[0-5]{1})))$");
        break;
    case "360": // 0-360
        regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1-2]{1}[0-9]{0,2}|[3]{1}([0-5]{1}[0-9]{1}|[6]{1}[0]{1})))$");
        break;
    }
}

function init_hex_field(){
    temporary_mode = $(this).attr('id');
    regex.compile("^([A-Fa-f0-9]{6})$");
}

function update_field(){
    colorpicker.update(temporary_mode);
}

function restrictCharacters(event, type) {
    var code;
    if (event.keyCode) {
        code = event.keyCode;
    }
    else if (event.which) {
        code = event.which;
    }
    var character = String.fromCharCode(code);
    // 8 = backspace, 9 = tab, 13 = enter, 35 = home, 37 = left, 38 = top, 39 = right, 40 = down
    var controlKeys = [ 8, 9, 13, 35, 36, 37, 38, 39, 40 ];
    var isControlKey = controlKeys.join(",").match(new RegExp(code));
    if (isControlKey) {
        return true;
    } else if (character.match(type)) {
        colorpicker.update(temporary_mode);
        return true;
    }
    event.preventDefault();
    return false;
}

function accelerate(event) {
    // 1 for key up, -1 for key down, 0 for other keys
    var direction = 0, code;
    if (event.keyCode) {
        code = event.keyCode;
    }
    else if (event.which) {
        code = event.which;
    }
    switch(code){
        case 38: direction = 1; break;
        case 40: direction = -1; break;
    }
    if (direction === 0) { return true; }
    event.preventDefault();
    var value = $(this).val();
    if (value === '') {
        value = 0;
    }
    var number = parseInt(value, 10);
    number += direction;
    if (number < min) {
        number = min;
    } else if (number > max) {
        number = max;
    }
    if('-'+max === min){ // as in angle from -180 to 180
        if(number === min) number = max;
        else if(number === max) number = min;
    }
    $(this).val(number).select();
    colorpicker.update(temporary_mode);
}

function validate_input(event){
    var value = $(this).val();
    var integer = parseInt(value, 10);
    if(regex.test(integer)){
        $(this).val(integer);
        return true;
    }
    event.preventDefault();
    var error_string = "An integer between "+min+" and "+max+" is required. Closest value inserted.";
    console.log(error_string);
    $(this).val(max).focus();
    //colorpicker.update(temporary_mode);
}