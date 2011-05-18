var styleStore = {
    styles: [
        { 
            name: "Default Style", 
            style: { }
        },
        { 
            name: "Inset Box", 
            style: {
                dropShadow: { color: [255,255,255], opacity: 100, blur: 0 },
                innerShadow: { color: [0,0,0], opacity: 40, blur: 7 },
                background: { stops: [[191, 191, 191], 11, [[242, 242, 242], 88], 77, [252, 252, 252]], reverse: true }
            }
        },
        {
            name: "Vista Inset Box",
            style: {
                dropShadow: { color: [255,255,255], opacity: 50, blur: 0 },
                innerShadow: { color: [0,0,0], opacity: 40, blur: 7 },
                background: { stops: [[116,116,116], [[109,109,109], 50], [[126,126,126], 50], [133,133,133]] },
                border: { isActive: false },
                borderRadius: { radii: [[10, "px"],[10, "px"],[10, "px"],[10, "px"]] }
            }
        },
        {
            name: "Hello Red",
            style: {
                dropShadow: { color: [255,255,255], opacity: 14, blur: 0 },
                innerShadow: { color: [255,255,255], opacity: 21 },
                background: { stops: [[213,87,91], [196,48,51]] },
                border: { color: [168,0,2] },
                borderRadius: { radii: [[5, "px"],[5, "px"],[5, "px"],[5, "px"]] }
            }
        },
        { 
            name: "Orange Box", 
            style: {
                dropShadow: { isActive: false },
                innerShadow: { color: [249,169,88], distance: 0, size: 1 },
                background: { stops: [[255, 225, 173], 42, [[250, 169, 28], 12], 91, [217, 97, 4]] },
                border: { color: [153,102,52] },
                borderRadius: { radii: [[2, "px"],[2, "px"],[2, "px"],[2, "px"]] }
            }
        },
        {
            name: "Apple Promo Box",
            style: {
                dropShadow: { color: [0,0,0], opacity: 40, blur: 3 },
                innerShadow: { color: [255,255,255], opacity: 100, distance: 0, size: 3 },
                background: { stops: [[250,250,250], [238,238,238]] },
                border: { isActive: false },
                borderRadius: { radii: [[5, "px"],[5, "px"],[5, "px"],[5, "px"]] }
            }
        },
        {
            name: "iPhone Copy Button",
            style: {
                dropShadow: { color: [0,0,0], opacity: 55, distance: 3, blur: 4 },
                innerShadow: { color: [255,255,255], opacity: 50 },
                background: { stops: [[112, 134, 255], [[79, 105, 255], 37], [[53, 83, 255], 41], [49, 79, 254]] },
                border: { color: [50,50,50] },
                borderRadius: { radii: [[5, "px"],[5, "px"],[5, "px"],[5, "px"]] }
            }
        },
        {
            name: "Please don't sue me",
            style: {
                dropShadow: { distance: 0 },
                innerShadow: { opacity: 55 },
                background: { stops: [[22, 127, 232], [0, 60, 123]] }
            }
        }
    ],
    init: function(){
        this.$el = $('#stylePresets');
        if(localStorage["styles"]) this.styles = JSON.parse(localStorage["styles"]);
        this.renderStyles(this.styles);
        this.loadStyle(0);
    },
    renderStyles: function(styleObjects){
        var styleFragment = document.createDocumentFragment();
        for(var i = 0, length = styleObjects.length; i<length; i++){
            styleFragment.appendChild( this.addStyle(styleObjects[i].name, styleObjects[i].style, i) );
        }
        this.$el.append(styleFragment);
    },
    addStyle: function(name, packedStyle, pos){
        var expandedStyle = this.decompress(packedStyle);
        var cssObj = css.displayCss(expandedStyle);
        var swatch = $('<div class="swatch" />')
                .attr({ 'title': name, 'data-pos': pos })
                .bind('mousedown', { self : this }, styleStore.select )
                    .append( $('<div />').css(cssObj) );
        return swatch.get(0);
    },
    select: function(e){
        e.stopPropagation();
        var self = e.data.self;
        var $obj = $(this);
        var family = $obj.parent().children();
        var pos = family.index(this);
        // if alt is pressed while clicking: remove style
        if(e.altKey){
            // double check - styles are precious
            if(pos !== 0 && window.confirm( lang.DeleteStyle + ' "'+ self.styles[pos].name +'"?' )){
                // slice out the gradient from the gradient array (method by John Resig)
                var rest = self.styles.slice(pos + 1);
                self.styles.length = pos;
                self.styles.push.apply(self.styles, rest);
                localStorage["styles"] = JSON.stringify(self.styles);
                $obj.remove();
            }
        }
        else {
            // else set the style
            family.removeClass('active');
            self.loadStyle(pos);
           }
    },
    compress: function(style){
        var slimStyle = {};
        var fatStyle = $.extend(true, {}, style);
        for( key in fatStyle ){
            var value = fatStyle[key];
            if(typeof style === "object"){
                if(value.isActive){
                    slimStyle[key] = {};
                    for( prop in value ){
                        var propVal = value[prop];
                        if( defaults[key][prop] === undefined ) continue;
                        if( typeof propVal === "object" ){
                            if( !jQuery.compare(propVal, defaults[key][prop]) ){
                                slimStyle[key][prop] = propVal;
                            }
                        } 
                        else if( propVal != defaults[key][prop] && prop !== "isActive" ){
                            slimStyle[key][prop] = propVal;
                        }
                    }
                    if( jQuery.isEmptyObject(slimStyle[key]) ) delete slimStyle[key];
                } else {
                    if(defaults[key].isActive){
                        slimStyle[key] = { isActive: false };
                    }
                }
            }
            else if(key === "globalAngle" && value !== defaults.globalAngle){
                slimStyle["globalAngle"] = value;
            }
        }
        return slimStyle;
    },
    decompress: function(packedStyle){
        var expandedStyle = $.extend(true, {}, defaults);
        for(key in packedStyle){
            expandedStyle[key] = $.extend({}, defaults[key], packedStyle[key]);
            if(packedStyle[key].isActive !== undefined){
                expandedStyle[key].isActive = packedStyle[key].isActive;
            } else {
                expandedStyle[key].isActive = true;
            }
        }
        return expandedStyle;
    },
    loadStyle: function(pos){
        this.$el.children().eq(pos).addClass('active');
        currentStyle = this.decompress(this.styles[pos].style);
        $(document).trigger('styleChange').trigger('paint');
    },
    create: function(){
        var newStyle, name = prompt(lang.NewStyle,"Style "+this.styles.length);
        if(name){
            newStyle = {'name': name, 'style': this.compress(currentStyle)};
            this.styles.push(newStyle);
            this.renderStyles([newStyle]);
            localStorage["styles"] = JSON.stringify(this.styles);
        }
    }
}
