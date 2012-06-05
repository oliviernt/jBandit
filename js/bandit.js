/***
 * jBandit 1.0
 */
(function(window, $){
    $.fn.jBandit = function(options){
        var defaults = {
            autoPlay: true,
            direction: "vertical",//valid values: "vertical" | "horizontal"
            shift: true,//valid values: true | "next" | "previous"
            pager: true,
            listType: "ul",//valid values: "ul" | "ol"
            timeout: 1000
        },
        maxHeight = 100,
        maxWidth = 75,
        values = {
            "horizontal": {
                "left" : maxWidth,
                "top" : 0
            },
            "vertical" : {
                "left" : 0,
                "top" : maxHeight
            }
        },
        listArray = [],
        R;
        
        options = $.extend(defaults, options);


        function Returnable(run) {
            this.running = run;
        };
        Returnable.prototype.pause = function(){
            if(this.running){
                this.stop();
            }
            else {
                this.play();
            }
        };
        Returnable.prototype.stop = function(){
            $(listArray).each(function(i){
                $(this).each(function(j){
                    listArray[i][j].stop();
                });
            });
            this.running = false;
        };
        Returnable.prototype.play = function(){
            $(listArray).each(function(i){
                $(this).each(function(j){
                    if (!listArray[i][j].running) {
                        listArray[i][j].interval = setInterval(function(){
                            listArray[i][j].start();
                        }, typeof options.timeout === "object"?options.timeout[j]:options.timeout);
                    }
                });
            });
            this.running = true;
        };

        R = new Returnable(options.autoPlay);

        /***
         * List Class
         */
        function List(l) {
            this.list = l;//has to be a jQuery object
            this.isNext = true;
            this.active = 0;
            this.interval = null;
            this.running = false;

            this.items = this.list.find("li");
        }

        List.prototype.setIsNext = function (iN) {
            this.isNext = iN;
            if (this.isNext) {
                this.list.addClass("next");
            } else {
                this.list.addClass("previous");
            }
        };

        List.prototype.setActive = function (act) {
            this.active = act;
        };

        List.prototype.getActive = function () {
            return this.active;
        };

        List.prototype.getItems = function () {
            if (this.items === null) {
                this.items = this.list.find("li");
            }
            return this.items;
        };

        /***
         * activates a random item
         */
        List.prototype.activateRandom = function () {
            var rand = randomInRange(0, this.items.length),
                css = {};
            if (this.isNext) {
                css.left = -values[options.direction].left + "px";
                css.top = -values[options.direction].top + "px";
            } else {
                css.left = values[options.direction].left + "px";
                css.top = values[options.direction].top + "px";
            }
            this.items.css(css);
            $(this.items[rand]).addClass("active").css({
                left: 0,
                top: 0
            });
            this.active = rand;
            return rand;
        };

        /***
         * activates the next item in list
         */
        List.prototype.next = function () {
            var l = this.list;
            this.getActiveItem(true).removeClass("active").animate({
                left: values[options.direction].left + "px",
                top: values[options.direction].top + "px"
            }, function () {
                l.find("li:not(.active)").css({
                    left: -values[options.direction].left + "px",
                    top: -values[options.direction].top + "px"
                });
            });
            this.active++;
            if (this.active >= this.items.length || this.active < 0 || !this.items[this.active]) {
                this.active = 0;
            }

            this.getActiveItem(true).addClass("active").animate({
                left : 0,
                top : 0
            });
            return this.active;
        };

        /***
         * activates the previous item in list
         */
        List.prototype.previous = function () {
            var l = this.list;
            this.getActiveItem(true).removeClass("active").animate({
                left: -values[options.direction].left + "px",
                top: -values[options.direction].top + "px"
            }, function () {
                l.find("li:not(.active)").css({
                    left: values[options.direction].left + "px",
                    top: values[options.direction].top + "px"
                });
            });
            this.active = this.active - 1;
            if (this.active < 0 || !this.items[this.active] || isNaN(this.active)) {
                this.active = this.items.length - 1;
            }

            this.getActiveItem(true).addClass("active").animate({
                left : 0,
                top : 0
            });
            return this.active;
        };

        List.prototype.start = function () {
            if (this.isNext) {
                this.next();
            } else {
                this.previous();
            }
            if (options.pager) {
                this.updatePager();
            }
            this.running = true;
        };

        List.prototype.stop = function () {
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.running = false;
        };

        List.prototype.updatePager = function () {
            this.list.find("a.active").removeClass("active");
            this.list.find("a.anchor-" + this.active).addClass("active");
        };

        List.prototype.getActiveItem = function (jqueryWrapped) {
            if (jqueryWrapped) {
                return $(this.items[this.active]);
            }
            return this.items[this.active];
        };
        
        /***
         * get a random number in a min to max range
         */
        var randomInRange = function(min, max) {
          return Math.round(min+(Math.random()*(max-min)));
        }
        
        this.each(function(i){
            var $this = $(this);
            $this.addClass("bandit");

            listArray[i] = listArray[i] || [];

            //Set maximum image height/width as maxHeight/maxWidth
            $this.find("img").each(function(){
                var $img = $(this),
                    width = $img.width(),
                    height = $img.height();
                if ( width > maxWidth ) {
                    maxWidth = width;
                    values.horizontal.left = maxWidth;
                }
                if ( height > maxHeight ){
                    maxHeight = height;
                    values.vertical.top = maxHeight;
                }
            });

            $this.find(options.listType + ", " + options.listType + " li").css({
                "height" : maxHeight + "px",
                "width" : maxWidth + "px"
            });
            //for each list
            $this.find(options.listType).each(function(j, ul){
                var $ul = $(ul),
                    $aArr = $ul.find("a"),
                    isNext = ((j % 2 == 0 && options.shift === true) || options.shift === false || options.shift === "next");

                var list = new List($ul);
                list.setIsNext(isNext);
                
                list.activateRandom();

                function _start () {
                    if (!list.running) {
                        list.interval = setInterval(function(){
                            list.start();
                        }, typeof options.timeout === "object"?options.timeout[j]:options.timeout);
                    }
                }

                if(options.autoPlay) {
                    _start();
                }

                $aArr.each(function(k, a){
                    $(a).on("mouseover.bandit", function(){
                        if (R.running)
                            list.stop();
                    }).on("mouseout.bandit", function(){
                        if (R.running)
                            _start();
                    });
                });

                //if a pager should be displayed for each Kachel
                if ( options.pager ) {
                    var $div = $("<div />").addClass("pager");
                    $.each(list.getItems(), function(i, li){
                        var $a = $('<a />').html(i+1).attr({
                            "href" : "#"
                        }).addClass("anchors anchor-"+i).css({
                            "top" : i + "0px"
                        }).data({
                            "index": i
                        }).on("click.bandit", function(){
                            list.getActiveItem(true).css({
                                left: (list.isNext?"":"-") + values[options.direction].left + "px",
                                top: (list.isNext?"":"-") + values[options.direction].top + "px",
                                zIndex: 0
                            });
                            list.setActive($(this).data("index"));
                            list.getActiveItem(true).css({
                                top: 0,
                                left: 0,
                                zIndex: 99
                            });
                            list.updatePager();
                            return false;
                        }).on("mouseover.bandit", function(){
                            if (R.running)
                                list.stop();
                        }).on("mouseout.bandit", function(){
                            if (R.running)
                                _start();
                        });
                        $div.append($a);
                    });
                    $ul.append($div);
                }
                listArray[i][j] = list;
            });
        });
        return R;
    };
})(window, jQuery);