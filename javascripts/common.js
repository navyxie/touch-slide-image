var EV = window.NAVY.VEVENT;
var docObj = $(document);
window.NAVY.IMAGEMOVE = function(obj,options){ 
/** 
 * obj param : wrapper,container,target ,all is id or class selector
 */
    if(!obj.wrapper){
        alert('obj must has wrapper');
        return false;
    }else if(!obj.container){
        alert('obj must has container');
        return false;
    }else if(!obj.target){
        alert('obj must has target');
        return false;
    }
    var defaultOptions = {
        direct:'h',//
        space:5,
        slideP:0.5,
        rangeP:0.4,
        marginR:0
    }
    $.extend(defaultOptions,options);
    this.defaultOptions = defaultOptions;
    this.obj = obj;
    this.wrapperObj = $(obj.wrapper);
    this.containerObj = $(obj.container);
    this.targetObj = $(obj.target);
    this.startPage = {x:0,y:0};//touchstart page postion
    this.deltaPage = {x:0,y:0};//touchmove duration
    this.endPage = {x:0,y:0};// touchend page position
    this.isMouseDown = false;// is touch flag
    this.rangeStartX = 0;//first target move right range
    this.rangeEndX = 0;// last target move left range
    this.oneSlide = 0;// one target move value
    this.init();
};
NAVY.IMAGEMOVE.prototype = {
    init:function(){
        var marginR = this.defaultOptions.marginR;
        this.wrapperObjW = this.oneSlide = this.wrapperObj.width();
        this.wrapperObjH = this.wrapperObj.height();
        if(marginR === 0){
            this.containerObj.width(this.wrapperObjW*this.targetObj.length);
        }else{
            // if target has marginRight , this.oneSlide = this.wrapperObjW+marginR
            this.containerObj.width((this.wrapperObjW+marginR)*this.targetObj.length - marginR);
            this.oneSlide += marginR;
        }     
        this.targetObj.width(this.wrapperObjW).css('float','left').last().css('marginRight',0);// set target width and some css
        this.rangeStartX = this.oneSlide*this.defaultOptions.rangeP; //mesture rangeStartX
        this.rangeEndX = this.oneSlide*(this.targetObj.length - 1);//mesture rangeEndX
        this.initEvent();// init event touchstart touchmove touchend touchcancel
    },
    initEvent:function(){
        var self = this;
        var wrapperObj = self.wrapperObj;
        var eventsTxt = EV.mousedown+' '+ EV.mousemove+' '+EV.mouseup;// event text join ' '
        wrapperObj.on(eventsTxt,function(e){
            var eTarget = e;
            if(NAVY.OS.phone){
                // if device is mobile , dosometing ,is jquery bug? beacause e.pageX or e.pageY is undefine
                eTarget = eTarget.originalEvent;
            };
            switch(e.type){
                case EV.mousedown:
                    self.startMove(eTarget);
                    return false;
                    break;
                case EV.mousemove:
                    self.move(eTarget);
                    return false;
                    break;
                case EV.mouseup:
                case EV.mouseout:
                    self.endMove(eTarget);
                    return false;
                    break;
            }
            return false;
        })
    },
    startMove:function(e){
        /**
         * do someting if device is mobile,beacause e.pageX or e.pageY is undefine ,jqeury bug?
         * refer to swipe.js https://github.com/bradbirdsall/Swipe
         */
        if(NAVY.OS.phone){
            var touches = e.touches[0];
            this.startPage = {
                x:touches.pageX,
                y:touches.pageY
            };
        }else{
            this.startPage = {
                x:e.pageX,
                y:e.pageY
            };
        }
        this.deltaPage = {x:0,y:0};//reset deltaPage
        this.isMouseDown = true;
    },
    move:function(e){
        if(!this.isMouseDown){
            return false;
        } 
        if(NAVY.OS.phone){
            if (e.touches.length > 1 || e.scale && e.scale !== 1) return false;
            var touches = e.touches[0];
            this.deltaPage = {
                x:touches.pageX - this.startPage.x,
                y:touches.pageY - this.startPage.y
            };
        }else{
            this.deltaPage = {
                x:e.pageX - this.startPage.x,
                y:e.pageY - this.startPage.y
            };
        }       
        
        var movePageX = this.endPage.x+this.deltaPage.x;
        if(this.endPage.x === 0 && this.deltaPage.x > this.rangeStartX){
            // if currentTarget is the first, moveRight maxValue is this.rangeStartX
            this.deltaPage.x = movePageX = this.rangeStartX;
        }else if(this.endPage.x === -this.rangeEndX && this.deltaPage.x < -this.rangeStartX){
            // if currentTarget is the last ,moveLeft maxValue is negative this.rangeStartX
            movePageX = this.endPage.x - this.rangeStartX;
            this.deltaPage.x = -this.rangeStartX;
        }
        // move by css3 translate ,is so cool
        this.translate(movePageX);        
    },
    endMove:function(e){
        var endDeltaX = this.deltaPage.x,endDeltay = this.deltaPage.y;
        var slideP = this.defaultOptions.slideP;
        if(endDeltaX > 0){
            // move left
            if(endDeltaX < this.oneSlide*slideP){
                // if move Value is less than this.oneSlide*slideP ,reset to prev statue
                endDeltaX = this.endPage.x;               
            }else{
                // else move to next target
                endDeltaX = this.endPage.x = this.endPage.x + this.oneSlide;
            }
        }else{
            // move right
            if(endDeltaX > -(this.oneSlide*slideP)){
                endDeltaX = this.endPage.x; 
            }else{
                endDeltaX = this.endPage.x = this.endPage.x - this.oneSlide;
            }
        }
        this.translate(endDeltaX,500);
        this.startPage = {x:0,y:0};
        this.isMouseDown = false;
    },
    /**
     * [ css3 translate , is so cool]
     * @param  {[type]} dist  [move value]
     * @param  {[type]} speed [description]
     * @return {[type]}       [description]
     */
    translate:function(dist, speed){
        speed = speed || 0;
        var style = this.containerObj[0].style;
        if (!style) return;
        style.webkitTransitionDuration = 
        style.MozTransitionDuration = 
        style.msTransitionDuration = 
        style.OTransitionDuration = 
        style.transitionDuration = speed + 'ms';
        style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
        style.msTransform = 
        style.MozTransform = 
        style.OTransform = 'translateX(' + dist + 'px)';
    }
}