var parallelUniverse = {
    x: 0,
    y: 0,
    KAPPA: 4*(Math.SQRT2-1)/3,
    roundToHalf: function(value){
        // makes the borders crisp
        return (value - parseInt(value, 10)) === 0.5 ? value+1 : value + 1.5;
    },
    draw: function(){
        this.x = this.roundToHalf(dimensions.width/2 - currentStyle.width/2);
        this.y = this.roundToHalf(dimensions.height/2 - currentStyle.height/2);
        
        pu.clearRect(0,0,dimensions.width,dimensions.height);    
        
        this.background();
        this.drawCanvases();
        
        this.shadow();
        pu.beginPath();
        this.rect(pu);
        pu.closePath();
        this.layerBackground();
        this.innerShadow();
        this.border();
    },
    background: function(){
        pu.fillStyle = tools.decodeCanvasGradient(
            background.background[1].stops, background.background[1].angle, background.background[1].style, pu, 0, 0, dimensions.width, dimensions.height
        );
        pu.fillRect(0, 0, dimensions.width, dimensions.height);
    },
    rect: function(ctx){
        var br = currentStyle.borderRadius;
        if(br.isActive){
            for(var i=3; i>=0; i--){
                var radiusX, radiusY, unit, percentage;
                unit = br.radii[i][1];
                if(unit === "%"){
                    percentage = Math.min(0.5, br.radii[i][0]/100);
                    radiusY = percentage*currentStyle.height;
                    radiusX = percentage*currentStyle.width;
                } else {
                    radiusX = radiusY = Math.min(currentStyle.width/2, br.radii[i][0]);
                }
                switch(i){ // anti-clockwise because of the innerShadow-mask
                case 3: // start at left middle; then bottom left
                    ctx.moveTo(this.x, this.y+currentStyle.height/2);
                    ctx.lineTo(this.x, this.y+currentStyle.height-radiusY);
                    ctx.bezierCurveTo(this.x, this.y+currentStyle.height-radiusY+radiusY*this.KAPPA, this.x+(radiusX-radiusX*this.KAPPA), this.y+currentStyle.height, this.x+radiusX, this.y+currentStyle.height);
                    break;
                case 2: // upper right
                    ctx.lineTo(this.x+currentStyle.width-radiusX, this.y+currentStyle.height);
                    ctx.bezierCurveTo(this.x+currentStyle.width-radiusX+radiusX*this.KAPPA, this.y+currentStyle.height, this.x+currentStyle.width, this.y+currentStyle.height-radiusY+radiusY*this.KAPPA, this.x+currentStyle.width, this.y+currentStyle.height-radiusY);
                    break;
                case 1: // bottom right
                    ctx.lineTo(this.x+currentStyle.width, this.y+radiusY);
                    ctx.bezierCurveTo(this.x+currentStyle.width, this.y+(radiusY-radiusY*this.KAPPA), this.x+currentStyle.width-radiusX+radiusX*this.KAPPA, this.y, this.x+currentStyle.width-radiusX, this.y);
                    break;
                case 0: // upper left and then back to left middle;
                    ctx.lineTo(this.x+radiusX, this.y);
                    ctx.bezierCurveTo(this.x+(radiusX-radiusX*this.KAPPA), this.y, this.x, this.y+(radiusY-radiusY*this.KAPPA), this.x, this.y+radiusY);
                    ctx.lineTo(this.x, this.y+currentStyle.height/2);
                    break;
                }
            }
        } else {
            // outwritten rect anti-clockwise instead of the ctx.rect(x,y,width,height) because of the innerShadow mask
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y+currentStyle.height);
            ctx.lineTo(this.x+currentStyle.width, this.y+currentStyle.height);
            ctx.lineTo(this.x+currentStyle.width, this.y);
            ctx.lineTo(this.x, this.y);
        }
        
    },
    drawCanvases: function(){
        var $canvases = $workspace.find('canvas.moveable');
        $.each($canvases, function(i, canvas){
            var $canvas = $(canvas),
                offset = $canvas.offset();
            pu.drawImage(canvas, offset.left, offset.top);
        });
    },
    shadow: function(){
        var sd = currentStyle.dropShadow, dropColor;
        if(sd.isActive){
            pu.save();
            pu.beginPath();
            
            this.rect(pu);
            
            dropColor = sd.color.slice(0);
            dropColor.push(sd.opacity/100);
            dropColor = tools.toColor(dropColor);
            pu.fillStyle = dropColor;
            pu.shadowOffsetX = sd.dropX;
            pu.shadowOffsetY = sd.dropY;
            pu.shadowBlur = sd.blur;
            pu.shadowColor = dropColor;
            pu.fill();
            pu.closePath();
            pu.restore();
        }
    },
    innerShadow: function(){
        var is = currentStyle.innerShadow, dropColor;
        if(is.isActive){
            iu.save();
            iu.beginPath();
            
            // draw the layer box as negativ area and use normal dropShadow in another universe
            // idea by Alistair MacDonald https://gist.github.com/787544
            
            iu.rect(0,0,dimensions.width,dimensions.height);
            iu.moveTo(this.x, this.y);
            this.rect(iu);
            
            dropColor = is.color.slice(0);
            dropColor.push(is.opacity/100);
            dropColor = tools.toColor(dropColor);
            iu.shadowOffsetX = is.dropX;
            iu.shadowOffsetY = is.dropY;
            iu.shadowBlur = is.blur;
            iu.shadowColor = dropColor;
            iu.fill();
            iu.closePath();
            iu.restore();
            
            // clip the paralell universe temporarily to the layers size (border-radius!) 
            // and draw the inner shadow from the other universe to the main parallel Universe
            pu.save();
            pu.beginPath();
            this.rect(pu);
            pu.closePath();
            pu.clip();
            pu.drawImage($innerShadowUniverse.get(0), this.x, this.y, currentStyle.width, currentStyle.height, this.x, this.y, currentStyle.width, currentStyle.height);
            pu.restore();
            iu.clearRect(0,0,dimensions.width,dimensions.height);
        }
    },
    layerBackground: function(){
        var bg = currentStyle.background, 
            tempAngle, tempStops;
    
        if(bg.isActive) {
            tempAngle = bg.angle;
            
            tempStops = $.extend(true, [], bg.translucidStops); // no deep copy!
            if(bg.hasGlobalLight) bg.angle = currentStyle.globalAngle;
            if(bg.isReverse) tempStops = tools.reverseStops(tempStops);
            pu.fillStyle = tools.decodeCanvasGradient(
                tempStops, tempAngle, bg.style,
                pu, this.x, this.y, currentStyle.width, currentStyle.height
            );
            pu.fill();
        }
    },
    border: function(){
        var bd = currentStyle.border, borderColor;
        if(bd.isActive){
            borderColor = bd.color.slice(0);
            borderColor.push(bd.opacity/100);
            pu.strokeStyle = tools.toColor(borderColor);
            pu.lineWidth = bd.size;
            pu.stroke();
        }
    }
};